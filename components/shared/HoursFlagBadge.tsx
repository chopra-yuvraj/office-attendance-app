const FLAG_STYLES: Record<string, string> = {
  full_day:       'bg-green-100 text-green-700',
  half_day_alert: 'bg-orange-100 text-orange-700',
  absent:         'bg-red-100 text-red-700',
  leave_approved: 'bg-purple-100 text-purple-700',
};

const FLAG_LABELS: Record<string, string> = {
  full_day:       '✅ Full Day',
  half_day_alert: '⚠️ Short Hours',
  absent:         '❌ Absent',
  leave_approved: '🏖️ On Leave',
};

export function HoursFlagBadge({ flag }: { flag?: string }) {
  if (!flag) return <span className="text-gray-400 text-xs">—</span>;
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${FLAG_STYLES[flag]}`}>
      {FLAG_LABELS[flag] || flag}
    </span>
  );
}
