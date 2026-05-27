'use client';
import { useEffect, useRef } from 'react';

interface PresentUser {
  _id: string;
  fullName: string;
  username: string;
  role: string;
  mobile: string;
  timeIn: string | null;
  timeOut: string | null;
  status: string;
}

interface AbsentUser {
  _id: string;
  fullName: string;
  username: string;
  role: string;
  mobile: string;
}

interface Props {
  type: 'present' | 'absent';
  presentUsers: PresentUser[];
  absentUsers: AbsentUser[];
  onClose: () => void;
}

export default function DailyRosterModal({ type, presentUsers, absentUsers, onClose }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === backdropRef.current) onClose();
  }

  const isPresent = type === 'present';
  const users = isPresent ? presentUsers : absentUsers;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b ${
          isPresent
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div>
            <h2 className={`text-lg font-bold ${isPresent ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
              {isPresent ? '✅ Present Today' : '❌ Absent Today'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {users.length} worker{users.length !== 1 ? 's' : ''} • {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto">
          {users.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
              No workers {isPresent ? 'present' : 'absent'} today.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900">
                <tr className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3">Worker Name</th>
                  <th className="px-5 py-3">Role</th>
                  {isPresent && <th className="px-5 py-3">Time In</th>}
                  {isPresent && <th className="px-5 py-3">Time Out</th>}
                  <th className="px-5 py-3">Mobile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {users.map((u: any) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition">
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">{u.fullName}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">@{u.username}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        u.role === 'office' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                      }`}>
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </span>
                    </td>
                    {isPresent && (
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {u.timeIn ? new Date(u.timeIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                    )}
                    {isPresent && (
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {u.timeOut ? new Date(u.timeOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                    )}
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{u.mobile}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
