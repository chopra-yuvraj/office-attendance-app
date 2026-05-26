export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/db';
import AttendanceRecord from '@/models/AttendanceRecord';
import { normalizeToMidnightUTC } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET - List attendance records by date/status/user/role (paginated)
// S4: Full population with minDailyWorkHours, salaryPerDay + role filter
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);

  const date   = searchParams.get('date');
  const status = searchParams.get('status');
  const userId = searchParams.get('userId');
  const role   = searchParams.get('role');
  const page   = parseInt(searchParams.get('page') ?? '1');
  const limit  = parseInt(searchParams.get('limit') ?? '20');
  const skip   = (page - 1) * limit;

  // Build query filter
  const filter: Record<string, any> = {};
  if (date)   filter.date   = normalizeToMidnightUTC(new Date(date));
  if (status) filter.status = status;
  if (userId) filter.userId = userId;

  // If role filter is set, we need to first find users with that role, then filter
  let roleUserIds: string[] | null = null;
  if (role) {
    const User = (await import('@/models/User')).default;
    const usersWithRole = await User.find({ role }).select('_id');
    roleUserIds = usersWithRole.map((u: any) => u._id);
    filter.userId = { $in: roleUserIds };
  }

  const [records, total] = await Promise.all([
    AttendanceRecord.find(filter)
      .populate('userId', 'fullName username role mobile minDailyWorkHours salaryPerDay')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AttendanceRecord.countDocuments(filter),
  ]);

  return NextResponse.json({ records, total, page, pages: Math.ceil(total / limit) });
}
