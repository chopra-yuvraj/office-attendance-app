'use client';
import { useState, useEffect } from 'react';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    window.addEventListener('online',  () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    return () => {
      window.removeEventListener('online',  () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-amber-400 dark:bg-amber-600 text-amber-900 dark:text-amber-100 text-sm font-semibold px-4 py-2 text-center flex items-center justify-center gap-2 rounded-lg">
      <span>📡</span>
      <span>You&apos;re offline. Your punch data will be saved and synced when you reconnect.</span>
    </div>
  );
}
