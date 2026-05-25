'use client';
import { useState } from 'react';

export default function ProductionLogTable({ logs }: { logs: any[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (logs.length === 0) return (
    <div className="bg-white rounded-xl shadow p-8 text-center">
      <p className="text-slate-400 text-sm">No production logs found.</p>
    </div>
  );

  return (
    <div className="overflow-x-auto rounded-xl shadow bg-white">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-800 text-white">
          <tr>
            <th className="px-4 py-3 font-medium"></th>
            <th className="px-4 py-3 font-medium">Worker</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Machines</th>
            <th className="px-4 py-3 font-medium">Total Production</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => {
            const totalProduction = log.machineLogs?.reduce((sum: number, m: any) => sum + m.productionCount, 0) ?? 0;
            const isExpanded = expandedId === log._id;
            return (
              <>
                <tr key={log._id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-4 py-3">
                    <button onClick={() => setExpandedId(isExpanded ? null : log._id)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-semibold">
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{log.userId?.fullName ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{new Date(log.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-600">{log.totalMachinesOperated}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{totalProduction}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize
                      ${log.status === 'approved' ? 'bg-green-100 text-green-700' :
                        log.status === 'corrected' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
                {isExpanded && log.machineLogs?.map((m: any) => (
                  <tr key={`${log._id}-${m.machineNumber}`} className="bg-blue-50">
                    <td className="px-4 py-2"></td>
                    <td className="px-4 py-2 text-xs text-slate-600">Machine {m.machineNumber}</td>
                    <td className="px-4 py-2 text-xs text-slate-600">{m.designNo}</td>
                    <td className="px-4 py-2 text-xs text-slate-600">{m.category}</td>
                    <td className="px-4 py-2 text-xs font-semibold text-slate-700">{m.productionCount}</td>
                    <td className="px-4 py-2 text-xs">
                      <a href={m.driveWebViewLink} target="_blank" rel="noopener noreferrer"
                        className="text-blue-600 underline">View Photo ↗</a>
                    </td>
                  </tr>
                ))}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
