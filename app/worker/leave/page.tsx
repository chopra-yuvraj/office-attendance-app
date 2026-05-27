import LeaveRequestForm from '@/components/worker/LeaveRequestForm';

export default function WorkerLeavePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Leave Requests</h1>
      <LeaveRequestForm />
    </div>
  );
}
