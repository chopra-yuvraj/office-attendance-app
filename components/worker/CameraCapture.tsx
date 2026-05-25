'use client';
// Uses HTML5 native input — works on iOS and Android without permissions dialog
// mode: 'selfie' | 'environment'

interface Props {
  mode: 'selfie' | 'environment';
  label?: string;
  onCapture: (base64: string) => void;
}

export default function CameraCapture({ mode, label, onCapture }: Props) {
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onCapture(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
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
