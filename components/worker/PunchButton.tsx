'use client';
import { useState } from 'react';
import CameraCapture from './CameraCapture';
import GeolocationCapture from './GeolocationCapture';
import { apiPost } from '@/lib/apiClient';
import { compressImageBase64 } from '@/lib/compressImage';
import { cacheOutPunch } from '@/lib/offlineCache';

interface Props {
  type: 'IN' | 'OUT';
  userRole: string;
  recordId: string | null;
  onSuccess?: () => void;
}

export default function PunchButton({ type, userRole, recordId, onSuccess }: Props) {
  const [step, setStep] = useState<'idle' | 'camera' | 'geo' | 'submitting' | 'done' | 'error' | 'offline_cached'>('idle');
  const [selfieBase64, setSelfieBase64] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (step === 'camera') return (
    <CameraCapture
      mode="selfie"
      onCapture={(b64) => { setSelfieBase64(b64); setStep('geo'); }}
    />
  );

  if (step === 'geo') return (
    <GeolocationCapture
      onCapture={(c) => { setStep('submitting'); submitPunch(c); }}
    />
  );

  async function submitPunch(geoCoords: { lat: number; lng: number }) {
    try {
      // 1. Compress selfie
      const compressed = await compressImageBase64(selfieBase64!, 1024, 0.75);

      // 2. Upload to Drive
      const { fileId, webViewLink } = await apiPost('/api/upload/image', {
        base64:  compressed,
        mimeType: 'image/jpeg',
        context:  type === 'IN' ? 'selfie_in' : 'selfie_out',
      });

      // 3. Build punch payload
      const punchPayload = {
        driveFileId:      fileId,
        driveWebViewLink: webViewLink,
        coords:           geoCoords,
        timestamp:        new Date().toISOString(),
      };

      // 4. Submit punch
      if (type === 'IN') {
        await apiPost('/api/punch/in', punchPayload);
      } else {
        await apiPost('/api/punch/out', { outPunch: punchPayload });
      }

      setStep('done');
      onSuccess?.();
    } catch (err: any) {
      // 6. Handle offline: cache and show banner
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        const punchPayload = {
          driveFileId: 'offline_cached',
          driveWebViewLink: '#',
          coords: geoCoords,
          timestamp: new Date().toISOString(),
        };
        await cacheOutPunch({ outPunch: punchPayload, timestamp: Date.now() });
        setStep('offline_cached');
        return;
      }
      setError(err.message ?? 'Punch failed. Try again.');
      setStep('error');
    }
  }

  if (step === 'submitting') return (
    <div className="flex flex-col items-center gap-3 p-4 bg-blue-50 rounded-xl">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-blue-700 font-medium">Submitting your punch…</p>
    </div>
  );

  if (step === 'done') return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
      <p className="text-green-700 font-semibold">✅ Punch {type} recorded successfully!</p>
    </div>
  );



  if (step === 'offline_cached') return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
      <p className="text-blue-700 font-semibold">📡 Saved Offline</p>
      <p className="text-xs text-blue-500 mt-1">Your punch will sync automatically when you reconnect.</p>
    </div>
  );

  if (step === 'error') return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
      <p className="text-red-600 text-sm font-medium">❌ Error</p>
      <p className="text-xs text-red-400 mt-1">{error}</p>
      <button onClick={() => setStep('idle')} className="mt-3 text-xs text-blue-600 underline">Try Again</button>
    </div>
  );

  return (
    <button
      onClick={() => setStep('camera')}
      className={`w-full py-3 rounded-xl font-bold text-white text-lg transition
        ${type === 'IN'
          ? 'bg-green-600 hover:bg-green-700 active:scale-95'
          : 'bg-red-500 hover:bg-red-600 active:scale-95'
        }`}
    >
      {type === 'IN' ? '✅ Punch IN' : '🚪 Punch OUT'}
    </button>
  );
}
