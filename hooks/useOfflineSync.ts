'use client';
import { useEffect } from 'react';
import { getPendingOutPunches, clearCachedPunch } from '@/lib/offlineCache';
import { apiPost } from '@/lib/apiClient';

export function useOfflineSync(onSyncComplete?: () => void) {
  useEffect(() => {
    async function syncPending() {
      const pending = await getPendingOutPunches();
      if (pending.length === 0) return;

      for (const item of pending) {
        try {
          await apiPost('/api/punch/offline-sync', item);
          await clearCachedPunch(item.id);
        } catch {
          // Will retry on next online event
          console.warn('Sync failed for item', item.id, '— will retry');
        }
      }
      onSyncComplete?.();
    }

    window.addEventListener('online', syncPending);
    // Also attempt on mount (in case app opened while pending syncs exist)
    if (navigator.onLine) syncPending();

    return () => window.removeEventListener('online', syncPending);
  }, [onSyncComplete]);
}
