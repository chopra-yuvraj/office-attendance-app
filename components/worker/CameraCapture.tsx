'use client';
import { useRef, useState, useCallback, useEffect } from 'react';

interface Props {
  mode: 'selfie' | 'environment';
  label?: string;
  onCapture: (base64: string) => void;
}

/**
 * Camera component that uses getUserMedia for a live preview + capture flow.
 * Falls back to <input type="file" capture> on devices where getUserMedia fails.
 * This approach properly triggers the browser permission prompt for camera access.
 */
export default function CameraCapture({ mode, label, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState('');

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode === 'selfie' ? 'user' : 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setCameraReady(true);
      } catch (err: any) {
        if (cancelled) return;
        // If getUserMedia is unsupported or denied, fall back to file input
        if (err.name === 'NotAllowedError') {
          setError('Camera permission denied. Please enable it in your browser settings.');
        }
        setUseFallback(true);
      }
    }

    if (!useFallback) startCamera();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [mode, useFallback, stopStream]);

  function captureFromVideo() {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    stopStream();
    onCapture(base64);
  }

  // Fallback: HTML5 file input (works on mobile with native camera apps)
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onCapture(reader.result as string);
    reader.readAsDataURL(file);
  }

  // Fallback mode
  if (useFallback) {
    return (
      <div className="flex flex-col items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
        {error && <p className="text-xs text-red-500">{error}</p>}
        <p className="text-sm text-slate-600 font-medium">
          {label ?? (mode === 'selfie' ? '📷 Take a selfie to continue' : '📸 Photograph the machine')}
        </p>
        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition text-center w-full max-w-[200px]">
          Open Camera
          <input
            type="file"
            accept="image/*"
            capture={mode === 'selfie' ? 'user' : 'environment'}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
    );
  }

  // Live camera preview mode
  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-slate-900 rounded-xl border border-slate-700">
      <p className="text-sm text-white font-medium">
        {label ?? (mode === 'selfie' ? '📷 Take a selfie to continue' : '📸 Photograph the machine')}
      </p>

      <div className="relative w-full max-w-sm aspect-[4/3] rounded-lg overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${mode === 'selfie' ? 'scale-x-[-1]' : ''}`}
        />
        {!cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <button
        onClick={captureFromVideo}
        disabled={!cameraReady}
        className="w-16 h-16 rounded-full bg-white border-4 border-slate-300 hover:border-blue-500 transition disabled:opacity-40 shadow-lg flex items-center justify-center"
        aria-label="Capture photo"
      >
        <div className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 transition" />
      </button>

      <button
        onClick={() => { stopStream(); setUseFallback(true); }}
        className="text-xs text-slate-400 underline"
      >
        Use file picker instead
      </button>
    </div>
  );
}
