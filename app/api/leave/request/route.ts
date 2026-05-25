import { connectDB } from '@/lib/db';
import LeaveRequest from '@/models/LeaveRequest';
import { getAuthUserId, normalizeToMidnightUTC } from '@/lib/auth';
import { NextResponse } from 'next/server';

// POST - Submit leave request (worker)
export async function POST(req: Request) {
  const userId = getAuthUserId(req);
  const body = await req.json();
  await connectDB();

  const leaveDate = normalizeToMidnightUTC(new Date(body.date));

  // Check for duplicate leave request on same date
  const existing = await LeaveRequest.findOne({ userId, date: leaveDate });
  if (existing) {
    return NextResponse.json({ error: 'You already applied for this date' }, { status: 409 });
  }

  const leave = await LeaveRequest.create({
    userId,
    date:   leaveDate,
    type:   body.type,
    reason: body.reason || '',
  });

  return NextResponse.json({ leaveId: leave._id }, { status: 201 });
}
