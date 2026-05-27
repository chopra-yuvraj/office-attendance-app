import ExportPanel from '@/components/admin/ExportPanel';

export default function ExportPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Export Data</h1>
      <ExportPanel />
    </div>
  );
}
