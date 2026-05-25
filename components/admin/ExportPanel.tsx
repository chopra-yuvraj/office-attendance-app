'use client';
import { useState } from 'react';

export default function ExportPanel() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [role, setRole]           = useState('all');
  const [loading, setLoading]     = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      let token: string | null = null;
      try { token = localStorage.getItem('token'); } catch { /* ignore */ }
      try { if (!token) token = sessionStorage.getItem('token'); } catch { /* ignore */ }

      const params = new URLSearchParams({ startDate, endDate, role });
      const res = await fetch(`/api/admin/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `attendance_export_${startDate}_to_${endDate}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4 max-w-lg">
      <h2 className="text-lg font-bold text-slate-700">Export Attendance Data</h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Start Date</label>
          <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">End Date</label>
          <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-600">Role Filter</label>
        <select value={role} onChange={e => setRole(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="all">All Roles</option>
          <option value="office">Office Only</option>
          <option value="factory">Factory Only</option>
        </select>
      </div>

      <button
        onClick={handleExport}
        disabled={!startDate || !endDate || loading}
        className="bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg py-2.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '⏳ Exporting…' : '📥 Download CSV'}
      </button>
    </div>
  );
}
