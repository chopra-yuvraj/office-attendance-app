'use client';
import { useRef, useState, useCallback, useEffect } from 'react';

interface Props {
  mode: 'selfie' | 'environment';
  label?: string;
  onCapture: (base64: string) => void;
}

/**
 * Camera component that uses getUserMedia for a live preview + capture flow.
 * SECURITY: No file-upload fallback — only live camera frames are accepted.
 * If camera permissions are denied, a clear error is shown instructing the
 * user to enable camera access in their browser/device settings.
 */
export default function CameraCapture({ mode, label, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
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
        // Check for getUserMedia support
        if (!navigator.mediaDevices?.getUserMedia) {
          setError('Your browser does not support live camera access. Please use a modern browser like Chrome, Safari, or Edge.');
          return;
        }

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
        if (err.name === 'NotAllowedError') {
          setError('Camera permission denied. Please enable camera access in your browser or device settings, then try again.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No camera found on this device. A camera is required to take your attendance photo.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('Camera is in use by another application. Please close other apps using the camera and retry.');
        } else {
          setError(`Camera error: ${err.message || 'Unknown error'}. Please check your device settings.`);
        }
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [mode, stopStream]);

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

  function retryCamera() {
    setError('');
    setCameraReady(false);
    stopStream();
    // Re-trigger useEffect by toggling a restart — we rely on React re-running
    // the effect when error is cleared. For a clean restart, unmount/remount.
    window.location.reload();
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
          <span className="text-2xl">🚫</span>
        </div>
        <p className="text-sm text-red-700 dark:text-red-400 font-semibold text-center">Camera Required</p>
        <p className="text-xs text-red-500 dark:text-red-300 text-center leading-relaxed max-w-xs">{error}</p>
        <div className="bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900/50 rounded-lg p-3 mt-1 w-full max-w-xs">
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>How to enable:</strong><br/>
            • <strong>Android Chrome:</strong> Tap the 🔒 icon in the address bar → Site Settings → Camera → Allow<br/>
            • <strong>iPhone Safari:</strong> Settings → Safari → Camera → Allow<br/>
            • <strong>Desktop:</strong> Click the camera icon in the address bar and allow access
          </p>
        </div>
        <button
          onClick={retryCamera}
          className="mt-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition"
        >
          🔄 Retry Camera
        </button>
      </div>
    );
  }

  // Live camera preview mode — the ONLY capture method
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
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 gap-2">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-white/70">Starting camera…</p>
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
    </div>
  );
}
