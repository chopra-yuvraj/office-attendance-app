'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { apiGet } from '@/lib/apiClient';
import ProductionLogTable from '@/components/admin/ProductionLogTable';
import { TableSkeleton } from '@/components/shared/LoadingSkeleton';

export default function ProductionPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { data, isLoading } = useSWR(`/api/admin/production?date=${date}`, apiGet);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-800">Production Logs</h1>
      <div className="flex gap-3">
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      {isLoading
        ? <TableSkeleton />
        : <ProductionLogTable logs={data?.logs ?? []} />
      }
    </div>
  );
}
