'use client';
import PunchButton from './PunchButton';
import FactoryOutPunchScreen from './FactoryOutPunchScreen';

interface Props {
  punchRecord: any;
  userRole: string;
  onPunchSuccess?: () => void;
}

export default function PunchCard({ punchRecord, userRole, onPunchSuccess }: Props) {
  const hasPunchedIn  = !!punchRecord?.inPunch;
  const hasPunchedOut = !!punchRecord?.outPunch;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow dark:shadow-slate-900/50 p-6 flex flex-col gap-4">
      <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">Today&apos;s Attendance</h2>

      {/* Timestamps */}
      {hasPunchedIn && (
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium text-xs">IN</span>
          {new Date(punchRecord.inPunch.timestamp).toLocaleTimeString()}
        </div>
      )}
      {hasPunchedOut && (
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full font-medium text-xs">OUT</span>
          {new Date(punchRecord.outPunch.timestamp).toLocaleTimeString()}
          {punchRecord.totalWorkedMinutes != null && (
            <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
              {Math.floor(punchRecord.totalWorkedMinutes / 60)}h {punchRecord.totalWorkedMinutes % 60}m worked
            </span>
          )}
        </div>
      )}

      {/* Completed — show summary */}
      {hasPunchedIn && hasPunchedOut && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-center">
          <p className="text-green-700 dark:text-green-400 text-sm font-medium">✅ Attendance complete for today!</p>
        </div>
      )}

      {/* Action Buttons — factory workers use FactoryOutPunchScreen for OUT */}
      {!hasPunchedIn  && <PunchButton type="IN" userRole={userRole} recordId={null} onSuccess={onPunchSuccess} />}
      {hasPunchedIn && !hasPunchedOut && (
        userRole === 'factory'
          ? <FactoryOutPunchScreen onSuccess={onPunchSuccess} />
          : <PunchButton type="OUT" userRole={userRole} recordId={punchRecord._id} onSuccess={onPunchSuccess} />
      )}
    </div>
  );
}
