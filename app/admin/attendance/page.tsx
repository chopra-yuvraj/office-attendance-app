'use client';
import { useState, useEffect } from 'react';
import { useAttendance } from '@/hooks/useAttendance';
import AdminDashboardTable from '@/components/admin/AdminDashboardTable';
import AdminCorrectionModal from '@/components/admin/AdminCorrectionModal';
import ApproveConfirmModal from '@/components/admin/ApproveConfirmModal';
import AuditTrailDrawer from '@/components/admin/AuditTrailDrawer';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { apiPost, apiPut } from '@/lib/apiClient';

export default function AttendancePage() {
  const [date,   setDate]   = useState('');
  const [status, setStatus] = useState('');
  const [correcting, setCorrecting] = useState<any>(null);
  const [confirming, setConfirming] = useState<{ recordId: string; warning: string } | null>(null);
  const [auditRecord, setAuditRecord] = useState<any>(null);

  // Enforce IST on the client side to avoid SSR UTC mismatch
  useEffect(() => {
    const d = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(d.getTime() + istOffset);
    setDate(istTime.toISOString().split('T')[0]);
  }, []);

  const { data, mutate, isLoading } = useAttendance(date, status);

  async function handleApprove(recordId: string) {
    const res = await apiPost(`/api/admin/attendance/${recordId}/approve`, {});
    if (res.requiresConfirmation) {
      setConfirming({ recordId, warning: res.warning });
    } else {
      mutate();
    }
  }

  async function handleCorrect({ field, newValue, reason }: any) {
    await apiPut(`/api/admin/attendance/${correcting._id}/correct`, { field, newValue, reason });
    setCorrecting(null);
    mutate();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-800">Attendance Review</h1>

      {/* Date + Status filters */}
      <div className="flex gap-3 flex-wrap">
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="corrected">Corrected</option>
        </select>
      </div>

      {isLoading
        ? <TableSkeleton />
        : <AdminDashboardTable
            records={data?.records ?? []}
            onApprove={handleApprove}
            onCorrect={setCorrecting}
            onViewAudit={setAuditRecord}
          />
      }

      {correcting && <AdminCorrectionModal record={correcting} onClose={() => setCorrecting(null)} onSubmit={handleCorrect} />}
      {confirming && <ApproveConfirmModal
        warning={confirming.warning}
        onConfirm={async () => {
          await apiPost(`/api/admin/attendance/${confirming.recordId}/approve`, { forceApprove: true });
          setConfirming(null);
          mutate();
        }}
        onCancel={() => setConfirming(null)}
      />}
      {auditRecord && <AuditTrailDrawer corrections={auditRecord.corrections || []} onClose={() => setAuditRecord(null)} />}
    </div>
  );
}
