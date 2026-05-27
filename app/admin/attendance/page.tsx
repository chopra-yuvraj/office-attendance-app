'use client';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import AdminDashboardTable from '@/components/admin/AdminDashboardTable';
import AdminCorrectionModal from '@/components/admin/AdminCorrectionModal';
import ApproveConfirmModal from '@/components/admin/ApproveConfirmModal';
import AuditTrailDrawer from '@/components/admin/AuditTrailDrawer';
import ManualEntryModal from '@/components/admin/ManualEntryModal';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { apiGet, apiPost, apiPut } from '@/lib/apiClient';

export default function AttendancePage() {
  const [date,   setDate]   = useState('');
  const [status, setStatus] = useState('');
  const [workerFilter, setWorkerFilter] = useState('');
  const [correcting, setCorrecting] = useState<any>(null);
  const [confirming, setConfirming] = useState<{
    recordId: string;
    suggestedFlag: string;
    workerName?: string;
    workedMinutes?: number | null;
    warning?: string;
  } | null>(null);
  const [auditRecord, setAuditRecord] = useState<any>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);

  // Enforce IST on the client side to avoid SSR UTC mismatch
  useEffect(() => {
    const d = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(d.getTime() + istOffset);
    setDate(istTime.toISOString().split('T')[0]);
  }, []);

  // Build query params including workerFilter
  const queryParams = new URLSearchParams();
  if (date) queryParams.set('date', date);
  if (status) queryParams.set('status', status);
  const queryKey = date ? `/api/admin/attendance?${queryParams}` : null;

  const { data, mutate, isLoading } = useSWR(queryKey, apiGet, {
    refreshInterval: 30000,
  });

  // Fetch workers for manual entry and name filter
  const { data: workersData } = useSWR('/api/admin/users?limit=200', apiGet);
  const workers = workersData?.users ?? [];

  // Client-side worker name filtering
  const filteredRecords = (data?.records ?? []).filter((rec: any) => {
    if (!workerFilter) return true;
    const name = rec.userId?.fullName ?? '';
    return name.toLowerCase().includes(workerFilter.toLowerCase());
  });

  async function handleApprove(recordId: string) {
    // Step 1: Call prepare to get the suggested status
    const res = await apiPost(`/api/admin/attendance/${recordId}/approve`, {});
    if (res.requiresOverride) {
      setConfirming({
        recordId,
        suggestedFlag: res.suggestedFlag,
        workerName: res.workerName,
        workedMinutes: res.workedMinutes,
        warning: res.warning ?? undefined,
      });
    } else {
      mutate();
    }
  }

  async function handleConfirmApproval(overrideStatus: string) {
    if (!confirming) return;
    await apiPost(`/api/admin/attendance/${confirming.recordId}/approve`, {
      overrideFlag: overrideStatus,
    });
    setConfirming(null);
    mutate();
  }

  async function handleCorrect({ field, newValue, reason }: any) {
    await apiPut(`/api/admin/attendance/${correcting._id}/correct`, { field, newValue, reason });
    setCorrecting(null);
    mutate();
  }

  // Inline CSV export for current view
  async function handleExportCsv() {
    setCsvLoading(true);
    try {
      let token: string | null = null;
      try { token = localStorage.getItem('token'); } catch { /* ignore */ }
      try { if (!token) token = sessionStorage.getItem('token'); } catch { /* ignore */ }

      const params = new URLSearchParams({ startDate: date, endDate: date, role: 'all' });
      const res = await fetch(`/api/admin/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `attendance_${date}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setCsvLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Attendance Review</h1>
        <div className="flex gap-2">
          {/* Export CSV button */}
          <button
            onClick={handleExportCsv}
            disabled={csvLoading || !date}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {csvLoading ? 'Exporting…' : 'Export CSV'}
          </button>
          {/* Manual Entry button */}
          <button
            onClick={() => setShowManualEntry(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Manual Entry
          </button>
        </div>
      </div>

      {/* Filters: Date + Status + Worker Name */}
      <div className="flex gap-3 flex-wrap">
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white" />
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="corrected">Corrected</option>
        </select>
        {/* Worker Name search filter */}
        <div className="relative">
          <input
            type="text"
            value={workerFilter}
            onChange={e => setWorkerFilter(e.target.value)}
            placeholder="Filter by worker name…"
            className="border border-slate-300 dark:border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-56 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {isLoading
        ? <TableSkeleton />
        : <AdminDashboardTable
            records={filteredRecords}
            onApprove={handleApprove}
            onCorrect={setCorrecting}
            onViewAudit={setAuditRecord}
          />
      }

      {correcting && <AdminCorrectionModal record={correcting} onClose={() => setCorrecting(null)} onSubmit={handleCorrect} />}

      {/* Feature 1: Status Override Modal */}
      {confirming && (
        <ApproveConfirmModal
          suggestedStatus={confirming.suggestedFlag}
          workerName={confirming.workerName}
          workedMinutes={confirming.workedMinutes}
          warning={confirming.warning}
          onConfirm={handleConfirmApproval}
          onCancel={() => setConfirming(null)}
        />
      )}

      {auditRecord && <AuditTrailDrawer corrections={auditRecord.corrections || []} onClose={() => setAuditRecord(null)} />}

      {/* Feature 5: Manual Entry Modal */}
      {showManualEntry && (
        <ManualEntryModal
          workers={workers.map((w: any) => ({ _id: w._id, fullName: w.fullName }))}
          onClose={() => setShowManualEntry(false)}
          onSuccess={() => { setShowManualEntry(false); mutate(); }}
        />
      )}
    </div>
  );
}
