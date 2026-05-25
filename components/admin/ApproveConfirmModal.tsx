'use client';

export default function ApproveConfirmModal({ warning, onConfirm, onCancel }: { warning: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚠️</span>
          <h2 className="text-lg font-bold text-slate-800">Hours Alert</h2>
        </div>
        <p className="text-sm text-slate-600">{warning}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 border border-slate-300 rounded-lg py-2 text-sm text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 text-sm font-semibold">
            Approve Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
