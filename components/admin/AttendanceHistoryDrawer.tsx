'use client';
import { useEffect, useRef } from 'react';
import useSWR from 'swr';
import { apiGet } from '@/lib/apiClient';

interface Props {
  workerId: string;
  workerName: string;
  onClose: () => void;
}

export default function AttendanceHistoryDrawer({ workerId, workerName, onClose }: Props) {
  const { data, isLoading, error } = useSWR(
    `/api/admin/attendance?userId=${workerId}&limit=100`,
    apiGet
  );
  const backdropRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden'; // Prevent background scroll
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose();
  }

  const records = data?.records ?? [];

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end"
    >
      {/* Drawer panel — slides in from right */}
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold">Attendance History</h2>
            <p className="text-xs text-slate-300 mt-0.5">{workerName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center text-slate-300 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Summary Bar */}
        {!isLoading && !error && records.length > 0 && (
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex gap-4 shrink-0">
            <MiniStat
              label="Total Days"
              value={records.length}
              color="text-slate-700"
            />
            <MiniStat
              label="Present"
              value={records.filter((r: any) => r.inPunch).length}
              color="text-green-600"
            />
            <MiniStat
              label="Full Day"
              value={records.filter((r: any) => r.hoursFlag === 'full_day').length}
              color="text-blue-600"
            />
            <MiniStat
              label="Half Day"
              value={records.filter((r: any) => r.hoursFlag === 'half_day_alert').length}
              color="text-amber-600"
            />
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-auto">
          {isLoading && (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {error && (
            <div className="p-8 text-center text-red-500 text-sm">
              Failed to load attendance history.
            </div>
          )}

          {!isLoading && !error && records.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">
              No attendance records found for this worker.
            </div>
          )}

          {!isLoading && !error && records.length > 0 && (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white border-b border-slate-200">
                <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Punch In</th>
                  <th className="px-5 py-3">Punch Out</th>
                  <th className="px-5 py-3">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r: any) => {
                  const dateStr = new Date(r.date).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: '2-digit',
                  });
                  const punchIn = r.inPunch?.timestamp
                    ? new Date(r.inPunch.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                    : '—';
                  const punchOut = r.outPunch?.timestamp
                    ? new Date(r.outPunch.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                    : '—';
                  const inMapsUrl = r.inPunch?.coords?.lat && r.inPunch?.coords?.lng
                    ? `https://www.google.com/maps/search/?api=1&query=${r.inPunch.coords.lat},${r.inPunch.coords.lng}`
                    : null;
                  const outMapsUrl = r.outPunch?.coords?.lat && r.outPunch?.coords?.lng
                    ? `https://www.google.com/maps/search/?api=1&query=${r.outPunch.coords.lat},${r.outPunch.coords.lng}`
                    : null;
                  const hours = r.totalWorkedMinutes != null
                    ? `${Math.floor(r.totalWorkedMinutes / 60)}h ${r.totalWorkedMinutes % 60}m`
                    : '—';

                  return (
                    <tr key={r._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-3 text-slate-800 font-medium whitespace-nowrap">{dateStr}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <StatusBadge flag={r.hoursFlag} status={r.status} hasInPunch={!!r.inPunch} />
                      </td>
                      <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span>{punchIn}</span>
                          {inMapsUrl ? (
                            <a
                              href={inMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-5 h-5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                              title="View IN location"
                            >
                              <span className="text-xs leading-none">📍</span>
                            </a>
                          ) : r.inPunch ? (
                            <span className="text-[9px] text-slate-300">N/A</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span>{punchOut}</span>
                          {outMapsUrl ? (
                            <a
                              href={outMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-5 h-5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                              title="View OUT location"
                            >
                              <span className="text-xs leading-none">📍</span>
                            </a>
                          ) : r.outPunch ? (
                            <span className="text-[9px] text-slate-300">N/A</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={`font-medium ${
                          r.hoursFlag === 'full_day' ? 'text-green-600' :
                          r.hoursFlag === 'half_day_alert' ? 'text-amber-600' :
                          'text-slate-400'
                        }`}>
                          {hours}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 shrink-0 text-right">
          <button
            onClick={onClose}
            className="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ flag, status, hasInPunch }: { flag: string | null; status: string; hasInPunch: boolean }) {
  if (flag === 'leave_approved') {
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Leave</span>;
  }
  if (!hasInPunch) {
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">Absent</span>;
  }
  if (flag === 'full_day') {
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Full Day</span>;
  }
  if (flag === 'half_day_alert') {
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Half Day</span>;
  }
  if (status === 'pending') {
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Pending</span>;
  }
  return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Present</span>;
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col">
      <span className={`text-lg font-bold ${color}`}>{value}</span>
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}
