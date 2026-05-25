'use client';
import PunchButton from './PunchButton';
import FactoryOutPunchScreen from './FactoryOutPunchScreen';

export default function PunchCard({ punchRecord, userRole }: { punchRecord: any; userRole: string }) {
  const hasPunchedIn  = !!punchRecord?.inPunch;
  const hasPunchedOut = !!punchRecord?.outPunch;

  return (
    <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
      <h2 className="text-lg font-bold text-slate-700">Today&apos;s Attendance</h2>

      {/* Timestamps */}
      {hasPunchedIn && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium text-xs">IN</span>
          {new Date(punchRecord.inPunch.timestamp).toLocaleTimeString()}
        </div>
      )}
      {hasPunchedOut && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium text-xs">OUT</span>
          {new Date(punchRecord.outPunch.timestamp).toLocaleTimeString()}
          {punchRecord.totalWorkedMinutes != null && (
            <span className="ml-auto text-xs text-slate-400">
              {Math.floor(punchRecord.totalWorkedMinutes / 60)}h {punchRecord.totalWorkedMinutes % 60}m worked
            </span>
          )}
        </div>
      )}

      {/* Completed — show summary */}
      {hasPunchedIn && hasPunchedOut && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          <p className="text-green-700 text-sm font-medium">✅ Attendance complete for today!</p>
        </div>
      )}

      {/* Action Buttons — factory workers use FactoryOutPunchScreen for OUT */}
      {!hasPunchedIn  && <PunchButton type="IN" userRole={userRole} recordId={null} />}
      {hasPunchedIn && !hasPunchedOut && (
        userRole === 'factory'
          ? <FactoryOutPunchScreen />
          : <PunchButton type="OUT" userRole={userRole} recordId={punchRecord._id} />
      )}
    </div>
  );
}
