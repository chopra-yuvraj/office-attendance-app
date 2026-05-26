export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/db';
import LeaveRequest from '@/models/LeaveRequest';
import { NextResponse } from 'next/server';

// GET - List all leave requests (admin view)
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);

  const status = searchParams.get('status');
  const page   = parseInt(searchParams.get('page') ?? '1');
  const limit  = parseInt(searchParams.get('limit') ?? '20');
  const skip   = (page - 1) * limit;

  const filter: Record<string, any> = {};
  if (status) filter.status = status;

  const [leaves, total] = await Promise.all([
    LeaveRequest.find(filter)
      .populate('userId', 'fullName username role mobile')
      .populate('reviewedBy', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    LeaveRequest.countDocuments(filter),
  ]);

  return NextResponse.json({ leaves, total, page, pages: Math.ceil(total / limit) });
}
