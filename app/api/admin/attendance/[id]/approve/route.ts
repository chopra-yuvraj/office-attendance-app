export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/db';
import { getAuthUserId } from '@/lib/auth';
import { prepareApproval, executeApproval } from '@/lib/approvalPipeline';
import { NextResponse } from 'next/server';

// POST - Approve & lock an attendance record (with admin override status)
// Body options:
//   { } or { prepare: true }        → Return suggested flag for the override modal
//   { overrideFlag: 'full_day' }    → Execute approval with the given flag
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const adminId = getAuthUserId(req);
  await connectDB();

  try {
    const body = await req.json().catch(() => ({}));

    // If overrideFlag is provided, execute the approval with that flag
    if (body.overrideFlag) {
      const validFlags = ['full_day', 'half_day_alert', 'absent', 'overtime'];
      if (!validFlags.includes(body.overrideFlag)) {
        return NextResponse.json({ error: 'Invalid override flag' }, { status: 400 });
      }

      const result = await executeApproval(params.id, adminId, body.overrideFlag);
      return NextResponse.json({ success: true, status: result.record.status, hoursFlag: result.record.hoursFlag });
    }

    // Otherwise, prepare the approval (return suggestion for the modal)
    const prep = await prepareApproval(params.id);
    return NextResponse.json({
      requiresOverride: true,
      suggestedFlag: prep.suggestedFlag,
      workerName: prep.workerName,
      workedMinutes: prep.workedMinutes,
      warning: prep.warning ?? null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
