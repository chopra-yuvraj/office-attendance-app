'use client';
import { useState } from 'react';
import DashboardStatsBar from '@/components/admin/DashboardStatsBar';
import DailyRosterModal from '@/components/admin/DailyRosterModal';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';

export default function AdminDashboardPage() {
  const today = new Date().toISOString().split('T')[0];
  const { data, isLoading } = useDashboardStats(today);
  const [rosterType, setRosterType] = useState<'present' | 'absent' | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Dashboard</h1>
      {isLoading
        ? <CardSkeleton />
        : <DashboardStatsBar
            present={data?.present ?? 0}
            absent={data?.absent ?? 0}
            pending={data?.pending ?? 0}
            totalProduction={data?.totalProduction ?? 0}
            onPresentClick={() => setRosterType('present')}
            onAbsentClick={() => setRosterType('absent')}
          />
      }

      {/* Drill-down Modal */}
      {rosterType && data && (
        <DailyRosterModal
          type={rosterType}
          presentUsers={data.presentUsers ?? []}
          absentUsers={data.absentUsers ?? []}
          onClose={() => setRosterType(null)}
        />
      )}
    </div>
  );
}
