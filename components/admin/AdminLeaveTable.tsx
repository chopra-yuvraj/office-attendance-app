'use client';
import { StatusBadge } from '../shared/StatusBadge';

export default function AdminLeaveTable({ leaves, onApprove, onReject }: {
  leaves: any[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  if (leaves.length === 0) return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow dark:shadow-slate-900/50 p-8 text-center">
      <p className="text-slate-400 dark:text-slate-500 text-sm">No leave requests found.</p>
    </div>
  );

  return (
    <div className="overflow-x-auto rounded-xl shadow dark:shadow-slate-900/50 bg-white dark:bg-slate-800">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-800 dark:bg-slate-950 text-white">
          <tr>
            <th className="px-4 py-3 font-medium">Worker</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Reason</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave, i) => (
            <tr key={leave._id} className={i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'}>
              <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{leave.userId?.fullName ?? '—'}</td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{new Date(leave.date).toLocaleDateString()}</td>
              <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-300">{leave.type}</td>
              <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs max-w-[200px] truncate">{leave.reason || '—'}</td>
              <td className="px-4 py-3">
                <StatusBadge status={leave.status} />
              </td>
              <td className="px-4 py-3 flex gap-2">
                {leave.status === 'pending' && (
                  <>
                    <button onClick={() => onApprove(leave._id)}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition">
                      Approve
                    </button>
                    <button onClick={() => onReject(leave._id)}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition">
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
