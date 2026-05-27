const FLAG_STYLES: Record<string, string> = {
  full_day:       'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  half_day_alert: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  absent:         'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  leave_approved: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  overtime:       'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
};

const FLAG_LABELS: Record<string, string> = {
  full_day:       '✅ Full Day',
  half_day_alert: '⚠️ Short Hours',
  absent:         '❌ Absent',
  leave_approved: '🏖️ On Leave',
  overtime:       '🔥 Overtime',
};

export function HoursFlagBadge({ flag }: { flag?: string }) {
  if (!flag) return <span className="text-gray-400 dark:text-gray-500 text-xs">—</span>;
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${FLAG_STYLES[flag]}`}>
      {FLAG_LABELS[flag] || flag}
    </span>
  );
}
