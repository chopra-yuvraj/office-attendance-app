export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/db';
import AttendanceRecord from '@/models/AttendanceRecord';
import { getAuthUserId, normalizeToMidnightUTC } from '@/lib/auth';
import { NextResponse } from 'next/server';

// POST - Create a full manual attendance entry (admin only)
// Body: { userId, date, inPunch, outPunch, totalWorkedMinutes, hoursFlag, adminNotes }
export async function POST(req: Request) {
  const body = await req.json();
  const adminId = getAuthUserId(req);
  await connectDB();

  const today = normalizeToMidnightUTC(new Date(body.date));

  const existing = await AttendanceRecord.findOne({ userId: body.userId, date: today });
  if (existing) return NextResponse.json({ error: 'Record exists for this date' }, { status: 409 });

  // For manual entries: use a placeholder Drive file or admin-uploaded photo
  const record = new AttendanceRecord({
    userId:             body.userId,
    date:               today,
    inPunch:            body.inPunch || null,
    outPunch:           body.outPunch || null,
    totalWorkedMinutes: body.totalWorkedMinutes || null,
    hoursFlag:          body.hoursFlag || null,
    adminNotes:         body.adminNotes || '',
    status:             'approved',     // manual entries are pre-approved
    isManualEntry:      true,
    corrections: [{
      correctedBy: adminId,
      correctedAt: new Date(),
      field: 'isManualEntry',
      oldValue: null,
      newValue: true,
      reason: 'Admin manual entry',
    }],
  });

  await record.save();
  return NextResponse.json({ recordId: record._id }, { status: 201 });
}
