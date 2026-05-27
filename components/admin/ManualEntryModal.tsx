'use client';
import { useState } from 'react';
import { apiPost } from '@/lib/apiClient';

const HOURS_FLAGS = ['full_day', 'half_day_alert', 'absent', 'overtime'];

export default function ManualEntryModal({ workers, onClose, onSuccess }: {
  workers: { _id: string; fullName: string }[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    userId: '', date: '', inTime: '', outTime: '', hoursFlag: 'full_day', adminNotes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const inTimestamp  = new Date(`${form.date}T${form.inTime}`);
    const outTimestamp = new Date(`${form.date}T${form.outTime}`);
    const totalWorkedMinutes = Math.floor((outTimestamp.getTime() - inTimestamp.getTime()) / 60000);

    if (totalWorkedMinutes < 0) {
      setError('OUT time must be after IN time');
      setLoading(false);
      return;
    }

    const MANUAL_DRIVE_PLACEHOLDER = { driveFileId: 'manual_entry', driveWebViewLink: '#' };

    try {
      await apiPost('/api/admin/attendance/manual', {
        userId: form.userId,
        date:   form.date,
        inPunch:  { timestamp: inTimestamp.toISOString(),  coords: { lat: 0, lng: 0 }, ...MANUAL_DRIVE_PLACEHOLDER },
        outPunch: { timestamp: outTimestamp.toISOString(), coords: { lat: 0, lng: 0 }, ...MANUAL_DRIVE_PLACEHOLDER },
        totalWorkedMinutes,
        hoursFlag:   form.hoursFlag,
        adminNotes:  form.adminNotes,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? 'Failed to create entry');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-800">Manual Attendance Entry</h2>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-600">Worker</label>
            <select required value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">— Select worker —</option>
              {workers.map(w => <option key={w._id} value={w._id}>{w.fullName}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-600">Date</label>
            <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-600">IN Time</label>
              <input type="time" required value={form.inTime} onChange={e => setForm(f => ({ ...f, inTime: e.target.value }))}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-600">OUT Time</label>
              <input type="time" required value={form.outTime} onChange={e => setForm(f => ({ ...f, outTime: e.target.value }))}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-600">Hours Flag</label>
            <select value={form.hoursFlag} onChange={e => setForm(f => ({ ...f, hoursFlag: e.target.value }))}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
              {HOURS_FLAGS.map(f => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-600">Admin Notes</label>
            <textarea value={form.adminNotes} onChange={e => setForm(f => ({ ...f, adminNotes: e.target.value }))}
              rows={2} className="border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none" />
          </div>

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-slate-300 rounded-lg py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-50">
              {loading ? 'Creating…' : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
