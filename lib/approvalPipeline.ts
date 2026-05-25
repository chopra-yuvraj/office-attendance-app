import AttendanceRecord from '@/models/AttendanceRecord';
import ProductionLog from '@/models/ProductionLog';
import { IUser } from '@/models/User';

/**
 * Approve an attendance record. If the worker's hours are below the minimum,
 * returns a warning requiring explicit admin confirmation.
 * E9: Uses findOneAndUpdate with { status: 'pending' } filter to prevent double-approval race.
 */
export async function approveAttendanceRecord(recordId: string, adminId: string) {
  const record = await AttendanceRecord.findById(recordId).populate('userId');
  if (!record) throw new Error('Record not found');
  if (record.status === 'approved') throw new Error('Already approved');

  const user = record.userId as unknown as IUser;

  // --- Hours check ---
  const minMinutes = user.minDailyWorkHours * 60;
  if (record.totalWorkedMinutes !== null && record.totalWorkedMinutes < minMinutes) {
    return {
      requiresConfirmation: true,
      warning: `Worker logged ${record.totalWorkedMinutes} min vs required ${minMinutes} min. Approve anyway?`,
      record,
    };
  }

  // E9: Atomic update — only approve if still pending (prevents race)
  const updated = await AttendanceRecord.findOneAndUpdate(
    { _id: recordId, status: { $in: ['pending', 'corrected'] } },
    { $set: { status: 'approved' } },
    { new: true }
  );

  if (!updated) throw new Error('Record was already approved by another admin');

  // If factory worker, also lock the production log
  if (user.role === 'factory') {
    await ProductionLog.findOneAndUpdate(
      { attendanceRecordId: recordId },
      { $set: { status: 'approved' } }
    );
  }

  return { requiresConfirmation: false, record: updated };
}

/**
 * Force-approve a record (admin has confirmed despite warnings).
 * E9: Uses findOneAndUpdate with status filter for atomicity.
 */
export async function forceApproveAttendanceRecord(recordId: string, adminId: string) {
  const record = await AttendanceRecord.findById(recordId).populate('userId');
  if (!record) throw new Error('Record not found');

  const user = record.userId as unknown as IUser;

  const updated = await AttendanceRecord.findOneAndUpdate(
    { _id: recordId, status: { $ne: 'approved' } },
    {
      $set: {
        status: 'approved',
        adminNotes: (record.adminNotes || '') + ` [Force-approved by admin ${adminId} despite hours alert]`,
      }
    },
    { new: true }
  );

  if (!updated) throw new Error('Record was already approved by another admin');

  if (user.role === 'factory') {
    await ProductionLog.findOneAndUpdate(
      { attendanceRecordId: recordId },
      { $set: { status: 'approved' } }
    );
  }

  return { requiresConfirmation: false, record: updated };
}
