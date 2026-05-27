'use client';
import { useRef, useEffect, useState } from 'react';

interface Props {
  onCapture: (coords: { lat: number; lng: number }) => void;
}

export default function GeolocationCapture({ onCapture }: Props) {
  const [status, setStatus] = useState<'waiting' | 'error'>('waiting');
  const [error,  setError]  = useState('');
  const hasFired = useRef(false);

  useEffect(() => {
    // Guard: only fire once, even if parent re-renders with a new onCapture reference
    if (hasFired.current) return;

    if (!navigator.geolocation) {
      setError('Geolocation not supported on this device.');
      setStatus('error');
      return;
    }

    hasFired.current = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => onCapture({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        setError(
          err.code === 1
            ? 'Location permission denied. Please enable it in your browser/device settings and try again.'
            : err.code === 2
            ? 'Location unavailable. Make sure GPS is turned on.'
            : err.code === 3
            ? 'Location request timed out. Please try again in an open area.'
            : err.message
        );
        setStatus('error');
        hasFired.current = false; // Allow retry
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps: fire once on mount only

  if (status === 'error') return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
      <p className="text-red-600 dark:text-red-400 text-sm font-medium">📍 Location Error</p>
      <p className="text-xs text-red-400 dark:text-red-500 mt-1">{error}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Please enable location permissions in your browser settings and try again.</p>
      <button
        onClick={() => { hasFired.current = false; setStatus('waiting'); setError(''); }}
        className="mt-3 text-xs text-blue-600 dark:text-blue-400 underline font-medium"
      >
        🔄 Retry Location
      </button>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
      <div className="w-8 h-8 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Detecting your location…</p>
      <p className="text-xs text-blue-400 dark:text-blue-500">Make sure GPS/Location is enabled</p>
    </div>
  );
}
