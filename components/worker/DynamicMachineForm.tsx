'use client';
import { useState, useCallback } from 'react';
import CameraCapture from './CameraCapture';
import GeolocationCapture from './GeolocationCapture';

interface MachineFormData {
  machineNumber: number;
  driveFileId:      string | null;
  driveWebViewLink: string | null;
  productionCount:  number | '';
  designNo:         string;
  category:         string;
  coords:           { lat: number; lng: number } | null;
  capturedAt:       string | null;
  isComplete:       boolean;
}

interface Props {
  totalMachines: number;
  onAllComplete: (logs: MachineFormData[]) => void;
}

const CATEGORIES = ['Suit', 'Saree', 'All Over', 'Others'];

function makeMachineLog(n: number): MachineFormData {
  return {
    machineNumber: n,
    driveFileId: null, driveWebViewLink: null,
    productionCount: '', designNo: '', category: '',
    coords: null, capturedAt: null, isComplete: false,
  };
}

export default function DynamicMachineForm({ totalMachines, onAllComplete }: Props) {
  const [logs, setLogs]           = useState<MachineFormData[]>(
    Array.from({ length: totalMachines }, (_, i) => makeMachineLog(i + 1))
  );
  const [photoStep, setPhotoStep] = useState<Record<number, 'idle'|'camera'|'geo'>>({});

  const updateLog = useCallback((index: number, updates: Partial<MachineFormData>) => {
    setLogs(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      // Auto-compute isComplete
      const log = next[index];
      next[index].isComplete = !!(
        log.driveFileId &&
        log.productionCount !== '' &&
        log.designNo.trim() &&
        log.category &&
        log.coords
      );
      // Notify parent when all done
      if (next.every(l => l.isComplete)) onAllComplete(next);
      return next;
    });
  }, [onAllComplete]);

  async function handlePhotoCapture(index: number, base64: string) {
    try {
      // 1. Compress image
      const { compressImageBase64 } = await import('@/lib/compressImage');
      const compressed = await compressImageBase64(base64, 1024, 0.75);
      // 2. Upload to Drive
      const { apiPost } = await import('@/lib/apiClient');
      const { fileId, webViewLink } = await apiPost('/api/upload/image', {
        base64: compressed, mimeType: 'image/jpeg', context: `machine_${index + 1}`,
      });
      // 3. Update log and move to geo step
      updateLog(index, { driveFileId: fileId, driveWebViewLink: webViewLink, capturedAt: new Date().toISOString() });
      setPhotoStep(p => ({ ...p, [index]: 'geo' }));
    } catch {
      // E3: Upload failed — reset to idle so user can retry this specific machine
      setPhotoStep(p => ({ ...p, [index]: 'idle' }));
      alert(`Photo upload failed for Machine ${index + 1}. Please try again.`);
    }
  }

  function handleGeoCapture(index: number, coords: { lat: number; lng: number }) {
    updateLog(index, { coords });
    setPhotoStep(p => ({ ...p, [index]: 'idle' }));
  }

  return (
    <div className="flex flex-col gap-4">
      {logs.map((log, i) => (
        <div
          key={i}
          className={`rounded-xl border-2 p-4 flex flex-col gap-3 transition
            ${log.isComplete
              ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-white">Machine {i + 1}</h3>
            {log.isComplete
              ? <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">✅ Complete</span>
              : <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">⏳ Incomplete</span>
            }
          </div>

          {/* Camera + Geo */}
          {!log.driveFileId && photoStep[i] !== 'camera' && (
            <button
              onClick={() => setPhotoStep(p => ({ ...p, [i]: 'camera' }))}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg py-2 font-medium"
            >
              📸 Take Machine Photo
            </button>
          )}
          {photoStep[i] === 'camera' && (
            <CameraCapture
              mode="environment"
              label={`Photograph Machine ${i + 1}`}
              onCapture={(b64) => handlePhotoCapture(i, b64)}
            />
          )}
          {photoStep[i] === 'geo' && (
            <GeolocationCapture onCapture={(c) => handleGeoCapture(i, c)} />
          )}
          {log.driveFileId && (
            <p className="text-xs text-green-600 dark:text-green-400">✅ Photo uploaded & GPS captured</p>
          )}

          {/* Metrics */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Production Count</label>
            <input
              type="number"
              min={0}
              value={log.productionCount}
              onChange={e => updateLog(i, { productionCount: Number(e.target.value) })}
              className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="e.g. 120"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Design No.</label>
            <input
              type="text"
              value={log.designNo}
              onChange={e => updateLog(i, { designNo: e.target.value })}
              className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="e.g. D-402"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Category</label>
            <select
              value={log.category}
              onChange={e => updateLog(i, { category: e.target.value })}
              className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="">— Select category —</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
