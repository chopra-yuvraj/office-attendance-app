export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/db';
import AttendanceRecord from '@/models/AttendanceRecord';
import ProductionLog from '@/models/ProductionLog';
import User from '@/models/User';
import { getAuthUserId, normalizeToMidnightUTC } from '@/lib/auth';
import { NextResponse } from 'next/server';

// POST - Sync cached OUT data from offline mode
// S5: Hardened drift detection — flags at 4h and 24h thresholds
export async function POST(req: Request) {
  const userId = getAuthUserId(req);
  const body = await req.json();
  await connectDB();

  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const punchDate = normalizeToMidnightUTC(new Date(body.outPunch.timestamp));
  const record = await AttendanceRecord.findOne({ userId, date: punchDate });

  if (!record?.inPunch) {
    return NextResponse.json({ error: 'No IN punch found for this date' }, { status: 400 });
  }

  if (record.outPunch) {
    return NextResponse.json({ error: 'OUT punch already exists for this date' }, { status: 409 });
  }

  // Calculate drift
  const punchTime    = new Date(body.outPunch.timestamp);
  const now          = new Date();
  const driftMs      = now.getTime() - punchTime.getTime();
  const driftMinutes = Math.floor(driftMs / 60000);
  const driftHours   = driftMinutes / 60;
  let flagged = false;

  if (driftHours > 24) {
    // Severe drift — flag strongly and keep as pending for manual review
    record.adminNotes = (record.adminNotes || '') +
      ` [OFFLINE SYNC: ${Math.floor(driftHours)}h ${driftMinutes % 60}m drift — CRITICAL, verify manually]`;
    record.status = 'pending';
    flagged = true;
  } else if (driftHours > 4) {
    // Moderate drift — flag for admin attention
    record.adminNotes = (record.adminNotes || '') +
      ` [OFFLINE SYNC: ${Math.floor(driftHours)}h ${driftMinutes % 60}m drift — verify manually]`;
    flagged = true;
  }

  // Compute worked minutes
  const inTime  = record.inPunch.timestamp.getTime();
  const outTime = punchTime.getTime();
  const totalWorkedMinutes = Math.floor((outTime - inTime) / 60000);

  record.outPunch = { ...body.outPunch, timestamp: punchTime };
  record.totalWorkedMinutes = totalWorkedMinutes;

  const minMinutes = user.minDailyWorkHours * 60;
  record.hoursFlag = totalWorkedMinutes >= minMinutes ? 'full_day' : 'half_day_alert';

  await record.save();

  // Create production log for factory workers
  if (user.role === 'factory' && body.production) {
    await ProductionLog.create({
      attendanceRecordId:     record._id,
      userId,
      date:                   punchDate,
      totalMachinesOperated:  body.production.totalMachinesOperated,
      machineLogs:            body.production.machineLogs,
      isComplete:             true,
    });
  }

  return NextResponse.json({ success: true, totalWorkedMinutes, driftMinutes, flagged, synced: true });
}
