export function compressImageBase64(
  base64: string,
  maxWidthPx = 1024,
  quality    = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale  = Math.min(1, maxWidthPx / img.width);
      canvas.width  = img.width  * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        blob => {
          if (!blob) return reject(new Error('Compression failed'));
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = reject;
    img.src = base64;
  });
}
