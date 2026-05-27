import AttendanceRecord from '@/models/AttendanceRecord';
import ProductionLog from '@/models/ProductionLog';
import { IUser } from '@/models/User';

/**
 * Calculate the system-suggested hours flag based on worked minutes vs minimum hours.
 * This is purely a suggestion — the admin can override it.
 */
export function calculateSuggestedFlag(
  totalWorkedMinutes: number | null,
  minDailyWorkHours: number,
): string {
  if (totalWorkedMinutes == null) return 'absent';
  const minMinutes = minDailyWorkHours * 60;
  if (totalWorkedMinutes >= minMinutes * 1.25) return 'overtime';
  if (totalWorkedMinutes >= minMinutes) return 'full_day';
  if (totalWorkedMinutes >= minMinutes * 0.5) return 'half_day_alert';
  return 'absent';
}

/**
 * Step 1: Prepare approval — calculate the suggested status and return it
 * for the admin to review/override. Does NOT modify the record yet.
 */
export async function prepareApproval(recordId: string) {
  const record = await AttendanceRecord.findById(recordId).populate('userId');
  if (!record) throw new Error('Record not found');
  if (record.status === 'approved') throw new Error('Already approved');

  const user = record.userId as unknown as IUser;
  const suggestedFlag = calculateSuggestedFlag(
    record.totalWorkedMinutes,
    user.minDailyWorkHours,
  );

  // Check if hours are below minimum for a warning
  const minMinutes = user.minDailyWorkHours * 60;
  const isShortHours = record.totalWorkedMinutes !== null && record.totalWorkedMinutes < minMinutes;

  return {
    suggestedFlag,
    workerName: user.fullName,
    workedMinutes: record.totalWorkedMinutes,
    warning: isShortHours
      ? `Worker logged ${record.totalWorkedMinutes} min vs required ${minMinutes} min.`
      : undefined,
    record,
  };
}

/**
 * Step 2: Execute approval with the admin's chosen override status.
 * E9: Uses findOneAndUpdate with status filter for atomicity.
 *
 * @param recordId - The attendance record to approve
 * @param adminId - The admin performing the approval
 * @param overrideFlag - The final hours flag chosen by the admin (e.g. 'full_day', 'overtime')
 */
export async function executeApproval(
  recordId: string,
  adminId: string,
  overrideFlag: string,
) {
  const record = await AttendanceRecord.findById(recordId).populate('userId');
  if (!record) throw new Error('Record not found');

  const user = record.userId as unknown as IUser;

  // E9: Atomic update — only approve if still pending/corrected (prevents race)
  const updated = await AttendanceRecord.findOneAndUpdate(
    { _id: recordId, status: { $in: ['pending', 'corrected'] } },
    {
      $set: {
        status: 'approved',
        hoursFlag: overrideFlag,
        adminNotes: (record.adminNotes || '') +
          ` [Approved by admin ${adminId} as ${overrideFlag}]`,
      },
    },
    { new: true },
  );

  if (!updated) throw new Error('Record was already approved by another admin');

  // If factory worker, also lock the production log
  if (user.role === 'factory') {
    await ProductionLog.findOneAndUpdate(
      { attendanceRecordId: recordId },
      { $set: { status: 'approved' } },
    );
  }

  return { record: updated };
}

// Legacy compatibility wrappers (unused by new code, kept for safety)
export async function approveAttendanceRecord(recordId: string, adminId: string) {
  const prep = await prepareApproval(recordId);
  return executeApproval(recordId, adminId, prep.suggestedFlag);
}

export async function forceApproveAttendanceRecord(recordId: string, adminId: string) {
  const prep = await prepareApproval(recordId);
  return executeApproval(recordId, adminId, prep.suggestedFlag);
}
