import WorkerProfileForm from '@/components/admin/WorkerProfileForm';

export default function AdminWorkersPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-800">Manage Workers</h1>
      <WorkerProfileForm />
    </div>
  );
}
