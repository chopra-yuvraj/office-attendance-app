import { StatusBadge } from '../shared/StatusBadge';
import { HoursFlagBadge } from '../shared/HoursFlagBadge';

const COLUMNS = [
  { key: 'worker',           label: 'Worker',        width: 'min-w-[160px]' },
  { key: 'date',             label: 'Date',           width: 'min-w-[110px]' },
  { key: 'inTime',           label: 'IN Time',        width: 'min-w-[90px]'  },
  { key: 'outTime',          label: 'OUT Time',       width: 'min-w-[90px]'  },
  { key: 'workedHours',      label: 'Hours',          width: 'min-w-[70px]'  },
  { key: 'hoursFlag',        label: 'Flag',           width: 'min-w-[120px]' },
  { key: 'status',           label: 'Status',         width: 'min-w-[110px]' },
  { key: 'actions',          label: 'Actions',        width: 'min-w-[180px]' },
];

interface Props {
  records: any[];
  onApprove: (id: string) => void;
  onCorrect: (record: any) => void;
  onViewAudit?: (record: any) => void;
}

export default function AdminDashboardTable({ records, onApprove, onCorrect, onViewAudit }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl shadow bg-white">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-800 text-white">
          <tr>
            {COLUMNS.map(col => (
              <th key={col.key} className={`px-4 py-3 font-medium whitespace-nowrap ${col.width}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((rec, i) => (
            <tr key={rec._id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
              <td className="px-4 py-3 font-medium text-slate-800">{rec.userId?.fullName ?? '—'}</td>
              <td className="px-4 py-3 text-slate-600">{new Date(rec.date).toLocaleDateString()}</td>
              <td className="px-4 py-3">{rec.inPunch ? new Date(rec.inPunch.timestamp).toLocaleTimeString() : '—'}</td>
              <td className="px-4 py-3">{rec.outPunch ? new Date(rec.outPunch.timestamp).toLocaleTimeString() : '—'}</td>
              <td className="px-4 py-3">
                {rec.totalWorkedMinutes != null
                  ? `${Math.floor(rec.totalWorkedMinutes/60)}h ${rec.totalWorkedMinutes%60}m`
                  : '—'}
              </td>
              <td className="px-4 py-3"><HoursFlagBadge flag={rec.hoursFlag} /></td>
              <td className="px-4 py-3"><StatusBadge status={rec.status} /></td>
              <td className="px-4 py-3 flex gap-2">
                {rec.status === 'pending' && (
                  <button
                    onClick={() => onApprove(rec._id)}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition"
                  >
                    Approve
                  </button>
                )}
                <button
                  onClick={() => onCorrect(rec)}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition"
                >
                  Correct
                </button>
                {onViewAudit && rec.corrections?.length > 0 && (
                  <button
                    onClick={() => onViewAudit(rec)}
                    className="bg-slate-600 hover:bg-slate-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition"
                  >
                    🔍 History
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
