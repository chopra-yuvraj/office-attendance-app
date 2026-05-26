export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/db';
import AttendanceRecord from '@/models/AttendanceRecord';
import { getAuthUserId, normalizeToMidnightUTC } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET - Fetch own today's attendance record
export async function GET(req: Request) {
  const userId = getAuthUserId(req);
  await connectDB();

  const today = normalizeToMidnightUTC(new Date());
  const record = await AttendanceRecord.findOne({ userId, date: today });

  return NextResponse.json({ record: record || null });
}
