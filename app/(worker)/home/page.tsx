'use client';
import PunchCard from '@/components/worker/PunchCard';
import OfflineBanner from '@/components/shared/OfflineBanner';
import { useAuth } from '@/context/AuthContext';
import { useCurrentPunch } from '@/hooks/useCurrentPunch';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton';
import { useRouter } from 'next/navigation';

export default function WorkerHomePage() {
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading, mutate } = useCurrentPunch();
  const router = useRouter();

  // J7: Wire offline sync — refresh punch data after successful sync
  useOfflineSync(() => mutate());

  if (authLoading || isLoading) return (
    <div className="flex flex-col gap-6">
      <CardSkeleton />
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <OfflineBanner />
      <h1 className="text-2xl font-bold text-slate-800">
        Welcome{user ? `, ${user.fullName}` : ''}
      </h1>
      <PunchCard
        punchRecord={data?.record}
        userRole={user?.role || 'office'}
      />
    </div>
  );
}
