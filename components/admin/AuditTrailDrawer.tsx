'use client';

export default function AuditTrailDrawer({ corrections, onClose }: { corrections: any[]; onClose: () => void }) {
  return (
    <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 overflow-y-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-800">Audit Trail</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
      </div>
      {corrections.length === 0
        ? <p className="text-sm text-slate-400">No corrections on record.</p>
        : corrections.map((c: any, i: number) => (
          <div key={i} className="border-l-4 border-amber-400 pl-4 mb-4">
            <p className="text-xs text-slate-400">{new Date(c.correctedAt).toLocaleString()}</p>
            <p className="text-sm font-semibold text-slate-700">{c.field}</p>
            <p className="text-xs text-red-500">Old: {JSON.stringify(c.oldValue)}</p>
            <p className="text-xs text-green-600">New: {JSON.stringify(c.newValue)}</p>
            <p className="text-xs text-slate-500 italic">&quot;{c.reason}&quot;</p>
          </div>
        ))
      }
    </div>
  );
}
