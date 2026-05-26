export const dynamic = 'force-dynamic';
import { uploadImageToDrive } from '@/lib/googleDrive';
import { NextResponse } from 'next/server';

// POST - Upload image to Google Drive, return fileId + webViewLink
// Body: { base64: string, mimeType: string, context: string }
// context: 'selfie_in' | 'selfie_out' | 'machine_N'
export async function POST(req: Request) {
  const { base64, mimeType, context } = await req.json();

  const userId  = req.headers.get('x-user-id')!;
  const ts      = Date.now();
  const fileName = `${context}_${userId}_${ts}.jpg`;

  try {
    const { fileId, webViewLink } = await uploadImageToDrive(base64, mimeType, fileName);
    return NextResponse.json({ fileId, webViewLink });
  } catch (err: any) {
    console.error('Drive upload failed:', err);

    // E8: Handle Google Drive API quota or service errors gracefully
    if (err.code === 403 || err.code === 429 || err.message?.includes('quota')) {
      return NextResponse.json({ error: 'Storage service temporarily unavailable. Please try again in a few minutes.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
