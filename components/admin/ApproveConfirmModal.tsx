'use client';
import { useState } from 'react';

const STATUS_OPTIONS = [
  { value: 'full_day',       label: 'Full Day',  icon: '✅', color: 'bg-green-50 border-green-300 text-green-700 ring-green-400', darkColor: 'dark:bg-green-900/30 dark:border-green-700 dark:text-green-400 dark:ring-green-600' },
  { value: 'half_day_alert', label: 'Half Day',  icon: '⚠️', color: 'bg-orange-50 border-orange-300 text-orange-700 ring-orange-400', darkColor: 'dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-400 dark:ring-orange-600' },
  { value: 'absent',         label: 'Absent',    icon: '❌', color: 'bg-red-50 border-red-300 text-red-700 ring-red-400', darkColor: 'dark:bg-red-900/30 dark:border-red-700 dark:text-red-400 dark:ring-red-600' },
  { value: 'overtime',       label: 'Overtime',  icon: '🔥', color: 'bg-blue-50 border-blue-300 text-blue-700 ring-blue-400', darkColor: 'dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400 dark:ring-blue-600' },
];

interface Props {
  /** System-calculated suggested status based on worked hours */
  suggestedStatus: string;
  /** Worker name for display */
  workerName?: string;
  /** Total worked minutes for context */
  workedMinutes?: number | null;
  /** Warning text from the hours check (if any) */
  warning?: string;
  /** Called with the final chosen status override */
  onConfirm: (overrideStatus: string) => void;
  onCancel: () => void;
}

export default function ApproveConfirmModal({
  suggestedStatus,
  workerName,
  workedMinutes,
  warning,
  onConfirm,
  onCancel,
}: Props) {
  const [selectedStatus, setSelectedStatus] = useState(suggestedStatus || 'full_day');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 flex flex-col gap-5 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-lg">✓</div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Approve Attendance</h2>
            {workerName && <p className="text-sm text-slate-500 dark:text-slate-400">{workerName}</p>}
          </div>
        </div>

        {/* Hours context */}
        {workedMinutes != null && (
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <span className="text-lg">⏱️</span>
            <span>
              Worked: <strong>{Math.floor(workedMinutes / 60)}h {workedMinutes % 60}m</strong>
            </span>
          </div>
        )}

        {/* Warning if hours are below minimum */}
        {warning && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2.5 text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span>{warning}</span>
          </div>
        )}

        {/* Suggested status indicator */}
        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">
          System Suggestion: <span className="text-slate-700 dark:text-slate-300 normal-case capitalize">{suggestedStatus?.replace(/_/g, ' ') || 'N/A'}</span>
        </div>

        {/* Status selection grid */}
        <div className="grid grid-cols-2 gap-2">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelectedStatus(opt.value)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                selectedStatus === opt.value
                  ? `${opt.color} ${opt.darkColor} ring-2 scale-[1.02] shadow-sm`
                  : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-600'
              }`}
            >
              <span className="text-lg">{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedStatus)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2.5 text-sm font-bold transition shadow-sm hover:shadow"
          >
            Approve as {STATUS_OPTIONS.find(o => o.value === selectedStatus)?.label}
          </button>
        </div>
      </div>
    </div>
  );
}
