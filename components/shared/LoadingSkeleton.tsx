'use client';

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />;
}

export function FormSkeleton() {
  return (
    <div className="space-y-4 max-w-2xl">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse w-48" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}
