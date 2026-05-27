'use client';
import { useState } from 'react';
import CameraCapture from './CameraCapture';
import GeolocationCapture from './GeolocationCapture';
import DynamicMachineForm from './DynamicMachineForm';
import { apiPost } from '@/lib/apiClient';
import { compressImageBase64 } from '@/lib/compressImage';
import { cacheOutPunch } from '@/lib/offlineCache';

interface Props {
  onSuccess?: () => void;
}

export default function FactoryOutPunchScreen({ onSuccess }: Props) {
  const [step, setStep] = useState<'idle' | 'selfie' | 'geo' | 'machine_count' | 'machine_forms' | 'submitting' | 'done' | 'error' | 'offline_cached'>('idle');
  const [selfieFileId, setSelfieFileId] = useState('');
  const [selfieLink, setSelfieLink] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [machineCount, setMachineCount] = useState<number>(1);
  const [machineLogs, setMachineLogs] = useState<any[]>([]);
  const [allComplete, setAllComplete] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Take selfie
  if (step === 'selfie') return (
    <CameraCapture
      mode="selfie"
      label="📷 Take your OUT selfie"
      onCapture={async (b64) => {
        const compressed = await compressImageBase64(b64, 1024, 0.75);
        try {
          const { fileId, webViewLink } = await apiPost('/api/upload/image', {
            base64: compressed, mimeType: 'image/jpeg', context: 'selfie_out',
          });
          setSelfieFileId(fileId);
          setSelfieLink(webViewLink);
          setStep('geo');
        } catch {
          setError('Failed to upload selfie. Try again.');
          setStep('error');
        }
      }}
    />
  );

  // Step 2: Get location
  if (step === 'geo') return (
    <GeolocationCapture onCapture={(c) => { setCoords(c); setStep('machine_count'); }} />
  );

  // Step 3: Enter machine count
  if (step === 'machine_count') return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow dark:shadow-slate-900/50 p-6 flex flex-col gap-4">
      <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200">How many machines did you operate today?</h2>
      <input
        type="number"
        min={1}
        value={machineCount}
        onChange={e => setMachineCount(Math.max(1, parseInt(e.target.value) || 1))}
        className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
      />
      <button
        onClick={() => setStep('machine_forms')}
        className="bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg py-2.5 transition"
      >
        Continue
      </button>
    </div>
  );

  // Step 4: Fill machine forms
  if (step === 'machine_forms') return (
    <div className="flex flex-col gap-4">
      <DynamicMachineForm
        totalMachines={machineCount}
        onAllComplete={(logs) => { setMachineLogs(logs); setAllComplete(true); }}
      />
      <button
        disabled={!allComplete}
        onClick={submitFactoryOut}
        className={`w-full py-3 rounded-xl font-bold text-white text-lg transition
          ${allComplete
            ? 'bg-red-500 hover:bg-red-600 active:scale-95'
            : 'bg-gray-300 cursor-not-allowed opacity-60'
          }`}
      >
        {allComplete ? '🚪 Punch OUT' : `⏳ Complete all ${machineCount} machine forms first`}
      </button>
    </div>
  );

  async function submitFactoryOut() {
    setStep('submitting');
    const payload = {
      outPunch: {
        driveFileId:      selfieFileId,
        driveWebViewLink: selfieLink,
        coords:           coords!,
        timestamp:        new Date().toISOString(),
      },
      production: {
        totalMachinesOperated: machineLogs.length,
        machineLogs: machineLogs.map(log => ({
          machineNumber:    log.machineNumber,
          driveFileId:      log.driveFileId,
          driveWebViewLink: log.driveWebViewLink,
          productionCount:  log.productionCount,
          designNo:         log.designNo,
          category:         log.category,
          coords:           log.coords,
          capturedAt:       log.capturedAt,
        })),
      },
    };

    try {
      await apiPost('/api/punch/out', payload);
      setStep('done');
      onSuccess?.();
    } catch (err: any) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        await cacheOutPunch(payload);
        setStep('offline_cached');
      } else {
        setError(err.message);
        setStep('error');
      }
    }
  }

  if (step === 'submitting') return (
    <div className="flex flex-col items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
      <div className="w-8 h-8 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Submitting factory OUT punch…</p>
    </div>
  );

  if (step === 'done') return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
      <p className="text-green-700 dark:text-green-400 font-semibold">✅ Factory OUT punch recorded!</p>
    </div>
  );

  if (step === 'offline_cached') return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-center">
      <p className="text-blue-700 dark:text-blue-300 font-semibold">📡 Saved Offline</p>
      <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">Your punch will sync when you reconnect.</p>
    </div>
  );

  if (step === 'error') return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
      <p className="text-red-600 dark:text-red-400 text-sm font-medium">❌ {error}</p>
      <button onClick={() => setStep('idle')} className="mt-3 text-xs text-blue-600 dark:text-blue-400 underline">Try Again</button>
    </div>
  );

  return (
    <button
      onClick={() => setStep('selfie')}
      className="w-full py-3 rounded-xl font-bold text-white text-lg bg-red-500 hover:bg-red-600 active:scale-95 transition"
    >
      🏭 Punch OUT (Factory)
    </button>
  );
}
