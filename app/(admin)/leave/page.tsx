'use client';
import useSWR from 'swr';
import { apiGet, apiPut } from '@/lib/apiClient';
import AdminLeaveTable from '@/components/admin/AdminLeaveTable';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { Toast } from '@/components/shared/Toast';
import { useState } from 'react';

export default function AdminLeavePage() {
  const { data, isLoading, mutate } = useSWR('/api/admin/leave', apiGet);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  async function handleApprove(id: string) {
    try {
      await apiPut(`/api/admin/leave/${id}`, { action: 'approve' });
      mutate();
      setToast({ message: 'Leave approved', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  async function handleReject(id: string) {
    try {
      await apiPut(`/api/admin/leave/${id}`, { action: 'reject' });
      mutate();
      setToast({ message: 'Leave rejected', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-800">Leave Requests</h1>
      {isLoading
        ? <TableSkeleton />
        : <AdminLeaveTable leaves={data?.leaves ?? []} onApprove={handleApprove} onReject={handleReject} />
      }
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
