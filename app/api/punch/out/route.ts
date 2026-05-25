import { connectDB } from '@/lib/db';
import AttendanceRecord from '@/models/AttendanceRecord';
import ProductionLog from '@/models/ProductionLog';
import User from '@/models/User';
import { getAuthUserId, normalizeToMidnightUTC } from '@/lib/auth';
import { isWithinGeofence } from '@/lib/geofence';
import { OFFICE_ZONES, FACTORY_ZONES } from '@/lib/geofenceZones';
import { NextResponse } from 'next/server';

// POST - Submit OUT punch
// Body shape for office: { outPunch: { driveFileId, driveWebViewLink, coords, timestamp } }
// Body shape for factory: {
//   outPunch: { driveFileId, driveWebViewLink, coords, timestamp },
//   production: { totalMachinesOperated: number, machineLogs: IMachineLog[] }
// }
export async function POST(req: Request) {
  const userId = getAuthUserId(req);
  const body = await req.json();
  await connectDB();

  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // E6: Use IN punch date instead of today for night-shift support
  // Find today's record first; if missing, check for yesterday (night shift started Day 1, OUT on Day 2)
  let today = normalizeToMidnightUTC(new Date());
  let record = await AttendanceRecord.findOne({ userId, date: today });

  if (!record?.inPunch) {
    // E6: Check yesterday's record for night shift workers
    const yesterday = new Date(today.getTime() - 86400000);
    record = await AttendanceRecord.findOne({ userId, date: yesterday, outPunch: null });
    if (record?.inPunch) {
      // Night shift — use the IN punch record's date
      today = yesterday;
      record.adminNotes = (record.adminNotes || '') + ' [Night shift: OUT submitted next day]';
    }
  }

  if (!record?.inPunch) {
    return NextResponse.json({ error: 'No IN punch found for today' }, { status: 400 });
  }

  // Server-side geofence validation
  const zones = user.role === 'office' ? OFFICE_ZONES : FACTORY_ZONES;
  const geoResult = isWithinGeofence(body.outPunch.coords.lat, body.outPunch.coords.lng, zones);

  if (!geoResult.valid) {
    return NextResponse.json({
      error: 'Punch rejected: location outside permitted zone',
      distanceMeters: geoResult.distanceMeters,
    }, { status: 422 });
  }

  // Validate factory completeness
  if (user.role === 'factory') {
    const { machineLogs, totalMachinesOperated } = body.production;
    if (!machineLogs || machineLogs.length !== totalMachinesOperated) {
      return NextResponse.json({ error: 'All machine forms must be completed' }, { status: 422 });
    }
    // Validate each machine log has required fields
    for (const log of machineLogs) {
      if (!log.driveFileId || log.productionCount == null || !log.designNo || !log.category || !log.coords) {
        return NextResponse.json({ error: `Machine log ${log.machineNumber} is incomplete` }, { status: 422 });
      }
    }
  }

  // Handle offline sync — stale timestamp detection
  const punchTime = new Date(body.outPunch.timestamp);
  const now       = new Date();
  const diffHours = (now.getTime() - punchTime.getTime()) / 3600000;

  if (diffHours > 24) {
    record.adminNotes = (record.adminNotes || '') + ' [OFFLINE SYNC: punch timestamp > 24h old, verify manually]';
  }

  // Compute worked minutes
  const inTime  = record.inPunch.timestamp.getTime();
  const outTime = punchTime.getTime();
  const totalWorkedMinutes = Math.floor((outTime - inTime) / 60000);

  record.outPunch = { ...body.outPunch, timestamp: punchTime };
  record.totalWorkedMinutes = totalWorkedMinutes;

  // Hours alert flag (Admin decides; system only flags)
  const minMinutes = user.minDailyWorkHours * 60;
  record.hoursFlag = totalWorkedMinutes >= minMinutes ? 'full_day' : 'half_day_alert';

  await record.save();

  // Create production log for factory workers
  if (user.role === 'factory') {
    await ProductionLog.create({
      attendanceRecordId:     record._id,
      userId,
      date:                   today,
      totalMachinesOperated:  body.production.totalMachinesOperated,
      machineLogs:            body.production.machineLogs,
      isComplete:             true,
    });
  }

  return NextResponse.json({ success: true, totalWorkedMinutes, hoursFlag: record.hoursFlag });
}
