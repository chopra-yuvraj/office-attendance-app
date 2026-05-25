const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  approved:  'bg-green-100 text-green-700',
  corrected: 'bg-blue-100 text-blue-700',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}
