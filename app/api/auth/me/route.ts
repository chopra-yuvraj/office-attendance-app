import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getAuthUserId } from '@/lib/auth';
import { NextResponse } from 'next/server';

// S8: Returns safe user object for auth context rehydration
// Called on app load by AuthProvider to verify JWT and get current user
export async function GET(req: Request) {
  const userId = getAuthUserId(req);
  await connectDB();

  const user = await User.findById(userId)
    .select('fullName username role minDailyWorkHours salaryPerDay mobile isActive')
    .lean();

  // E10: Check if user account has been deactivated
  if (!user || !user.isActive) {
    return NextResponse.json({ error: 'User not found or inactive' }, { status: 404 });
  }

  return NextResponse.json(user);
}
