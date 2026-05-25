import { connectDB } from '@/lib/db';
import LeaveRequest from '@/models/LeaveRequest';
import AttendanceRecord from '@/models/AttendanceRecord';
import { getAuthUserId, normalizeToMidnightUTC } from '@/lib/auth';
import { NextResponse } from 'next/server';

// PUT - Approve / reject leave request (admin)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const adminId = getAuthUserId(req);
  const { action } = await req.json(); // 'approve' | 'reject'
  await connectDB();

  const leave = await LeaveRequest.findById(params.id);
  if (!leave) return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
  if (leave.status !== 'pending') {
    return NextResponse.json({ error: 'Leave request already reviewed' }, { status: 400 });
  }

  if (action === 'approve') {
    leave.status = 'approved';
    leave.reviewedBy = adminId as any;
    leave.reviewedAt = new Date();
    await leave.save();

    // If approved, create/update the attendance record for that day
    const leaveDate = normalizeToMidnightUTC(leave.date);
    let record = await AttendanceRecord.findOne({ userId: leave.userId, date: leaveDate });
    if (!record) {
      record = new AttendanceRecord({
        userId: leave.userId,
        date: leaveDate,
        status: 'approved',
        hoursFlag: 'leave_approved',
        leaveRequestId: leave._id,
        isManualEntry: true,
      });
    } else {
      record.hoursFlag = 'leave_approved';
      record.status = 'approved';
      record.leaveRequestId = leave._id;
    }
    await record.save();
  } else if (action === 'reject') {
    leave.status = 'rejected';
    leave.reviewedBy = adminId as any;
    leave.reviewedAt = new Date();
    await leave.save();
  } else {
    return NextResponse.json({ error: 'Invalid action. Use "approve" or "reject".' }, { status: 400 });
  }

  return NextResponse.json({ success: true, status: leave.status });
}
