'use client';

export default function DashboardStatsBar({ present = 0, absent = 0, pending = 0, totalProduction = 0 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard label="Present Today"   value={present}         color="bg-green-500"  icon="✅" />
      <StatCard label="Absent Today"    value={absent}          color="bg-red-500"    icon="❌" />
      <StatCard label="Pending Review"  value={pending}         color="bg-yellow-500" icon="⏳" />
      <StatCard label="Total Production"value={totalProduction} color="bg-blue-600"   icon="🏭" />
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: string }) {
  return (
    <div className={`${color} text-white rounded-xl p-4 flex flex-col gap-1 shadow`}>
      <span className="text-2xl">{icon}</span>
      <span className="text-3xl font-bold">{value}</span>
      <span className="text-sm opacity-80">{label}</span>
    </div>
  );
}
