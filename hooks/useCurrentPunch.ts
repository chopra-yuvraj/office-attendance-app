'use client';
import useSWR from 'swr';
import { apiGet } from '@/lib/apiClient';

export function useCurrentPunch() {
  return useSWR('/api/punch/today', apiGet, {
    refreshInterval: 30000,
  });
}
