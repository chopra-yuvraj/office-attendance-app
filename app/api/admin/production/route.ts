export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/db';
import ProductionLog from '@/models/ProductionLog';
import { normalizeToMidnightUTC } from '@/lib/auth';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

// GET /api/admin/production — List production logs (paginated)
// Query params: date (ISO string), userId (optional), status (optional), page, limit
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);

  const date   = searchParams.get('date');
  const userId = searchParams.get('userId');
  const status = searchParams.get('status');
  const page   = parseInt(searchParams.get('page') ?? '1');
  const limit  = parseInt(searchParams.get('limit') ?? '20');
  const skip   = (page - 1) * limit;

  const query: Record<string, unknown> = {};
  if (date) {
    const queryDate = new Date(date); // 2026-05-27T00:00:00Z
    const startOfDay = new Date(queryDate.getTime() - (5.5 * 60 * 60 * 1000)); // 2026-05-26T18:30:00.000Z
    const endOfDay = new Date(startOfDay.getTime() + (24 * 60 * 60 * 1000) - 1); // 2026-05-27T18:29:59.999Z
    query.date = { $gte: startOfDay, $lte: endOfDay };
  }
  if (userId) query.userId = new mongoose.Types.ObjectId(userId);
  if (status) query.status = status;

  const [logs, total] = await Promise.all([
    ProductionLog
      .find(query)
      .populate('userId', 'fullName role')
      .populate('attendanceRecordId', 'status')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    ProductionLog.countDocuments(query),
  ]);

  return NextResponse.json({ logs, total, page, pages: Math.ceil(total / limit) });
}
