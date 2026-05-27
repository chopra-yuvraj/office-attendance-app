'use client';

export default function AuditTrailDrawer({ corrections, onClose }: { corrections: any[]; onClose: () => void }) {
  return (
    <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-slate-800 shadow-2xl z-50 overflow-y-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Audit Trail</h2>
        <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-xl">✕</button>
      </div>
      {corrections.length === 0
        ? <p className="text-sm text-slate-400 dark:text-slate-500">No corrections on record.</p>
        : corrections.map((c: any, i: number) => (
          <div key={i} className="border-l-4 border-amber-400 dark:border-amber-500 pl-4 mb-4">
            <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(c.correctedAt).toLocaleString()}</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{c.field}</p>
            <p className="text-xs text-red-500 dark:text-red-400">Old: {JSON.stringify(c.oldValue)}</p>
            <p className="text-xs text-green-600 dark:text-green-400">New: {JSON.stringify(c.newValue)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">&quot;{c.reason}&quot;</p>
          </div>
        ))
      }
    </div>
  );
}
