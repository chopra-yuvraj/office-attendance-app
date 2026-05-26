export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/db';
import AttendanceRecord from '@/models/AttendanceRecord';
import { getAuthUserId } from '@/lib/auth';
import { NextResponse } from 'next/server';

// PUT - Correct fields on an attendance record (audit trail preserved)
// Body: { field: string, newValue: unknown, reason: string }
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const adminId = getAuthUserId(req);
  const { field, newValue, reason } = await req.json();
  await connectDB();

  const CORRECTABLE_FIELDS = ['inPunch.coords', 'outPunch.coords', 'adminNotes', 'hoursFlag', 'totalWorkedMinutes'];
  if (!CORRECTABLE_FIELDS.includes(field)) {
    return NextResponse.json({ error: 'Field is not correctable' }, { status: 400 });
  }

  if (!reason || !reason.trim()) {
    return NextResponse.json({ error: 'Reason is required for corrections' }, { status: 400 });
  }

  // E4: Guard against negative totalWorkedMinutes
  if (field === 'totalWorkedMinutes' && (typeof newValue !== 'number' || newValue < 0)) {
    return NextResponse.json({ error: 'Worked minutes cannot be negative' }, { status: 400 });
  }

  const record = await AttendanceRecord.findById(params.id);
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Snapshot old value
  const oldValue = record.get(field);

  // Append to audit trail BEFORE modifying
  record.corrections.push({
    correctedBy: adminId,
    correctedAt: new Date(),
    field,
    oldValue,
    newValue,
    reason,
  } as any);

  // Apply correction
  record.set(field, newValue);
  record.status = 'corrected';
  await record.save();

  return NextResponse.json({ success: true });
}
