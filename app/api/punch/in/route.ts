export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/db';
import AttendanceRecord from '@/models/AttendanceRecord';
import User from '@/models/User';
import { getAuthUserId } from '@/lib/auth';
import { normalizeToMidnightUTC } from '@/lib/auth';
import LeaveRequest from '@/models/LeaveRequest';
import { NextResponse } from 'next/server';

// POST - Submit IN punch (selfie + coords)
// Expected body: { driveFileId, driveWebViewLink, coords: {lat, lng}, timestamp }
export async function POST(req: Request) {
  const userId = getAuthUserId(req);
  const body = await req.json();
  await connectDB();

  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const today = normalizeToMidnightUTC(new Date());

  // Check if leave is approved for today
  const leaveToday = await LeaveRequest.findOne({ userId, date: today, status: 'approved' });
  if (leaveToday) {
    return NextResponse.json({ error: 'Leave approved for this date' }, { status: 409 });
  }

  // Idempotency: prevent double IN punch
  const existing = await AttendanceRecord.findOne({ userId, date: today });
  if (existing?.inPunch) {
    return NextResponse.json({ error: 'Already punched IN today' }, { status: 409 });
  }

  // Location is captured but NOT enforced — admin reviews location in dashboard

  const record = existing ?? new AttendanceRecord({ userId, date: today });
  record.inPunch = {
    timestamp:        new Date(body.timestamp),
    coords:           body.coords,
    driveFileId:      body.driveFileId,
    driveWebViewLink: body.driveWebViewLink,
  };
  record.status = 'pending';
  await record.save();

  return NextResponse.json({ recordId: record._id });
}
