'use client';
import { useState, useEffect } from 'react';

interface Props {
  onCapture: (coords: { lat: number; lng: number }) => void;
}

export default function GeolocationCapture({ onCapture }: Props) {
  const [status, setStatus] = useState<'waiting' | 'error'>('waiting');
  const [error,  setError]  = useState('');

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported on this device.');
      setStatus('error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => onCapture({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => { setError(err.message); setStatus('error'); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [onCapture]);

  if (status === 'error') return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
      <p className="text-red-600 text-sm font-medium">📍 Location Error</p>
      <p className="text-xs text-red-400 mt-1">{error}</p>
      <p className="text-xs text-slate-500 mt-2">Please enable location permissions and try again.</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-blue-50 rounded-xl">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-blue-700 font-medium">Detecting your location…</p>
    </div>
  );
}
