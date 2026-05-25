import { connectDB } from '@/lib/db';
import AttendanceRecord from '@/models/AttendanceRecord';
import ProductionLog from '@/models/ProductionLog';
import User from '@/models/User';
import { normalizeToMidnightUTC } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET - Live present/absent/production counts for dashboard
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const date = normalizeToMidnightUTC(new Date(searchParams.get('date') ?? Date.now()));

  const [presentCount, pendingCount, productionTotal, totalWorkers] = await Promise.all([
    AttendanceRecord.countDocuments({
      date,
      status: { $in: ['approved', 'corrected'] },
      inPunch: { $ne: null },
    }),
    AttendanceRecord.countDocuments({ date, status: 'pending' }),
    ProductionLog.aggregate([
      { $match: { date } },
      { $group: { _id: null, total: { $sum: '$totalMachinesOperated' } } }
    ]),
    User.countDocuments({ isActive: true, role: { $ne: 'admin' } }),
  ]);

  return NextResponse.json({
    present: presentCount,
    absent: totalWorkers - presentCount,
    pending: pendingCount,
    totalProduction: productionTotal[0]?.total ?? 0,
  });
}
