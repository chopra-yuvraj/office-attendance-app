export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/db';
import AttendanceRecord from '@/models/AttendanceRecord';
import ProductionLog from '@/models/ProductionLog';
import User from '@/models/User';
import { normalizeToMidnightUTC } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET - Live present/absent/production counts + user arrays for dashboard drill-down
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const date = normalizeToMidnightUTC(new Date(searchParams.get('date') ?? Date.now()));

  const [presentRecords, pendingCount, productionTotal, allWorkers] = await Promise.all([
    // Fetch full records with user details for present workers
    AttendanceRecord.find({
      date,
      inPunch: { $ne: null },
    })
      .populate('userId', 'fullName username role mobile')
      .lean(),

    AttendanceRecord.countDocuments({ date, status: 'pending' }),

    ProductionLog.aggregate([
      { $match: { date } },
      { $group: { _id: null, total: { $sum: '$totalMachinesOperated' } } }
    ]),

    // All active non-admin workers
    User.find({ isActive: true, role: { $ne: 'admin' } })
      .select('fullName username role mobile')
      .lean(),
  ]);

  // Build present user list from attendance records
  const presentUserIds = new Set(
    presentRecords.map((r: any) => r.userId?._id?.toString()).filter(Boolean)
  );

  const presentUsers = presentRecords
    .filter((r: any) => r.userId)
    .map((r: any) => ({
      _id: r.userId._id,
      fullName: r.userId.fullName,
      username: r.userId.username,
      role: r.userId.role,
      mobile: r.userId.mobile,
      timeIn: r.inPunch?.timestamp ?? null,
      timeOut: r.outPunch?.timestamp ?? null,
      status: r.status,
    }));

  // Absent = all active workers NOT in the present set
  const absentUsers = allWorkers
    .filter((u: any) => !presentUserIds.has(u._id.toString()))
    .map((u: any) => ({
      _id: u._id,
      fullName: u.fullName,
      username: u.username,
      role: u.role,
      mobile: u.mobile,
    }));

  return NextResponse.json({
    present: presentUsers.length,
    absent: absentUsers.length,
    pending: pendingCount,
    totalProduction: productionTotal[0]?.total ?? 0,
    presentUsers,
    absentUsers,
  });
}
