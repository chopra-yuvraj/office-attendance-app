'use client';

interface Props {
  present?: number;
  absent?: number;
  pending?: number;
  totalProduction?: number;
  onPresentClick?: () => void;
  onAbsentClick?: () => void;
}

export default function DashboardStatsBar({
  present = 0,
  absent = 0,
  pending = 0,
  totalProduction = 0,
  onPresentClick,
  onAbsentClick,
}: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Present Today"
        value={present}
        color="bg-green-500"
        icon="✅"
        onClick={onPresentClick}
        clickable={!!onPresentClick}
      />
      <StatCard
        label="Absent Today"
        value={absent}
        color="bg-red-500"
        icon="❌"
        onClick={onAbsentClick}
        clickable={!!onAbsentClick}
      />
      <StatCard label="Pending Review"   value={pending}         color="bg-yellow-500" icon="⏳" />
      <StatCard label="Total Production" value={totalProduction} color="bg-blue-600"   icon="🏭" />
    </div>
  );
}

function StatCard({
  label, value, color, icon, onClick, clickable,
}: {
  label: string; value: number | string; color: string; icon: string;
  onClick?: () => void; clickable?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`${color} text-white rounded-xl p-4 flex flex-col gap-1 shadow transition
        ${clickable ? 'cursor-pointer hover:scale-[1.03] hover:shadow-lg active:scale-[0.98] ring-0 hover:ring-2 hover:ring-white/30' : ''}
      `}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter') onClick?.(); } : undefined}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-3xl font-bold">{value}</span>
      <div className="flex items-center justify-between">
        <span className="text-sm opacity-80">{label}</span>
        {clickable && <span className="text-xs opacity-60">Click to view →</span>}
      </div>
    </div>
  );
}
