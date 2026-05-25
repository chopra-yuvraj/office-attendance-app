import { connectDB } from '@/lib/db';
import AttendanceRecord from '@/models/AttendanceRecord';
import ProductionLog from '@/models/ProductionLog';
import User from '@/models/User';
import { normalizeToMidnightUTC } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET - CSV export of attendance and production data
// Query params: startDate, endDate, role (optional), format ('csv' default)
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);

  const startDate = normalizeToMidnightUTC(new Date(searchParams.get('startDate') || Date.now()));
  const endDate   = normalizeToMidnightUTC(new Date(searchParams.get('endDate') || Date.now()));
  const roleFilter = searchParams.get('role'); // 'office' | 'factory' | null

  // Set endDate to end of day
  endDate.setUTCHours(23, 59, 59, 999);

  // Build user filter
  const userFilter: Record<string, any> = { isActive: true, role: { $ne: 'admin' } };
  if (roleFilter && roleFilter !== 'all') userFilter.role = roleFilter;
  const users = await User.find(userFilter).select('fullName username role');
  const userIds = users.map(u => u._id);

  const records = await AttendanceRecord.find({
    userId: { $in: userIds },
    date: { $gte: startDate, $lte: endDate },
  }).populate('userId', 'fullName username role').sort({ date: 1 });

  // For factory role, also fetch production logs
  const isFactory = roleFilter === 'factory';
  let productionMap: Record<string, any> = {};
  if (isFactory) {
    const productionLogs = await ProductionLog.find({
      date: { $gte: startDate, $lte: endDate },
      userId: { $in: userIds },
    });
    for (const log of productionLogs) {
      productionMap[log.attendanceRecordId.toString()] = log;
    }
  }

  // Build CSV columns
  const baseHeaders = [
    'Date', 'Worker Name', 'Username', 'Role',
    'IN Time', 'IN Coords', 'OUT Time', 'OUT Coords',
    'Worked Minutes', 'Hours Flag', 'Status', 'Is Manual', 'Admin Notes'
  ];
  const factoryHeaders = isFactory ? ['Machines Operated', 'Total Production Count'] : [];
  const csvHeaders = [...baseHeaders, ...factoryHeaders].join(',');

  const csvRows = records.map(rec => {
    const user = rec.userId as any;
    const baseCols = [
      rec.date.toISOString().split('T')[0],
      `"${user.fullName}"`,
      user.username,
      user.role,
      rec.inPunch ? new Date(rec.inPunch.timestamp).toISOString() : '',
      rec.inPunch ? `"${rec.inPunch.coords.lat},${rec.inPunch.coords.lng}"` : '',
      rec.outPunch ? new Date(rec.outPunch.timestamp).toISOString() : '',
      rec.outPunch ? `"${rec.outPunch.coords.lat},${rec.outPunch.coords.lng}"` : '',
      rec.totalWorkedMinutes ?? '',
      rec.hoursFlag ?? '',
      rec.status,
      rec.isManualEntry ? 'Yes' : 'No',
      `"${(rec.adminNotes || '').replace(/"/g, '""')}"`,
    ];

    if (isFactory) {
      const pLog = productionMap[rec._id.toString()];
      baseCols.push(pLog ? String(pLog.totalMachinesOperated) : '');
      baseCols.push(pLog ? String(pLog.machineLogs.reduce((sum: number, m: any) => sum + m.productionCount, 0)) : '');
    }

    return baseCols.join(',');
  });

  const csv = [csvHeaders, ...csvRows].join('\n');
  const dateRangeStr = `${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}`;

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="attendance_${dateRangeStr}.csv"`,
    },
  });
}
