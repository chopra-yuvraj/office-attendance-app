export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/db';
import { getAuthUserId } from '@/lib/auth';
import { approveAttendanceRecord, forceApproveAttendanceRecord } from '@/lib/approvalPipeline';
import { NextResponse } from 'next/server';

// POST - Approve & lock an attendance record
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const adminId = getAuthUserId(req);
  await connectDB();

  try {
    const body = await req.json().catch(() => ({}));
    const forceApprove = body?.forceApprove === true;

    let result: any;
    if (forceApprove) {
      result = await forceApproveAttendanceRecord(params.id, adminId);
    } else {
      result = await approveAttendanceRecord(params.id, adminId);
    }

    if (result.requiresConfirmation) {
      return NextResponse.json({
        requiresConfirmation: true,
        warning: result.warning,
      }, { status: 200 });
    }

    return NextResponse.json({ success: true, status: result.record.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
