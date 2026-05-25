'use client';
import { useState } from 'react';
import { apiPost } from '@/lib/apiClient';
import { Toast } from '@/components/shared/Toast';

export default function LeaveRequestForm() {
  const [date, setDate] = useState('');
  const [type, setType] = useState('sick');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPost('/api/leave/request', { date, type, reason });
      setToast({ message: 'Leave request submitted successfully!', type: 'success' });
      setDate('');
      setReason('');
    } catch (err: any) {
      setToast({ message: err.message ?? 'Failed to submit leave request', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-slate-700">Apply for Leave</h2>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Leave Date</label>
          <input 
            type="date" 
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" 
            required 
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Leave Type</label>
          <div className="flex gap-3">
            {['sick', 'casual'].map(t => (
              <label key={t} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="leaveType" 
                  value={t}
                  checked={type === t}
                  onChange={e => setType(e.target.value)}
                  className="accent-blue-600" 
                />
                <span className="capitalize text-sm text-slate-700">{t}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Reason (optional)</label>
          <textarea 
            rows={3} 
            value={reason}
            onChange={e => setReason(e.target.value)}
            maxLength={500}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" 
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-700 hover:bg-blue-800 text-white rounded-lg py-2.5 font-semibold transition mt-2 w-full disabled:opacity-50"
        >
          {loading ? 'Submitting…' : 'Submit Leave Request'}
        </button>
      </form>
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}
