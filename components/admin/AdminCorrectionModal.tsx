'use client';
import { useState } from 'react';

const CORRECTABLE_FIELDS = [
  { value: 'inPunch.coords',     label: 'IN Punch GPS Coordinates' },
  { value: 'outPunch.coords',    label: 'OUT Punch GPS Coordinates' },
  { value: 'totalWorkedMinutes', label: 'Total Worked Minutes' },
  { value: 'hoursFlag',          label: 'Hours Flag' },
  { value: 'adminNotes',         label: 'Admin Notes' },
];

export default function AdminCorrectionModal({ record, onClose, onSubmit }: { record: any; onClose: () => void; onSubmit: (data: any) => void; }) {
  const [field,    setField]    = useState('');
  const [newValue, setNewValue] = useState('');
  const [reason,   setReason]   = useState('');

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-800">Correct Record — {record?.userId?.fullName}</h2>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Field to Correct</label>
          <select
            value={field}
            onChange={e => setField(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400"
          >
            <option value="">— Select field —</option>
            {CORRECTABLE_FIELDS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">New Value</label>
          <input
            type="text"
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400"
            placeholder="Enter corrected value"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Reason for Correction <span className="text-red-500">*</span></label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={2}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-400 resize-none"
            placeholder="Explain why this correction is needed…"
          />
        </div>

        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 border border-slate-300 rounded-lg py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit({ field, newValue, reason })}
            disabled={!field || !newValue || !reason}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-40"
          >
            Submit Correction
          </button>
        </div>
      </div>
    </div>
  );
}
