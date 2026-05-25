'use client';
import useSWR from 'swr';
import { apiGet } from '@/lib/apiClient';

export function useAttendance(date: string, status?: string) {
  const params = new URLSearchParams({ date });
  if (status) params.set('status', status);

  return useSWR(`/api/admin/attendance?${params}`, apiGet, {
    refreshInterval: 30000,  // Re-fetch every 30 seconds
  });
}
