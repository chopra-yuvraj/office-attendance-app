'use client';
import useSWR from 'swr';
import { apiGet } from '@/lib/apiClient';

export function useDashboardStats(date: string) {
  return useSWR(`/api/admin/dashboard/stats?date=${date}`, apiGet, {
    refreshInterval: 60000,  // Re-fetch every 60 seconds
  });
}
