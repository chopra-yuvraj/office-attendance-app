'use client';
import { useEffect } from 'react';

interface ToastProps { message: string; type?: 'success' | 'error' | 'info'; onDone: () => void; }

export function Toast({ message, type = 'success', onDone }: ToastProps) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);

  const colors = {
    success: 'bg-green-500 text-white',
    error:   'bg-red-500 text-white',
    info:    'bg-blue-600 text-white',
  };

  return (
    <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold z-50 ${colors[type]}`}>
      {message}
    </div>
  );
}
