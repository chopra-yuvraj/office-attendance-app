export const dynamic = 'force-dynamic';
import { uploadImageToDrive } from '@/lib/googleDrive';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';

// POST - Upload image to Google Drive with 4-level folder hierarchy
// Body: { base64: string, mimeType: string, context: string, punchType?: string }
// context: 'selfie_in' | 'selfie_out' | 'machine_N'
export async function POST(req: Request) {
  const { base64, mimeType, context, punchType: rawPunchType } = await req.json();

  const userId = req.headers.get('x-user-id')!;

  // Determine punch type: explicit from body, or infer from context
  // 'selfie_in' → IN, 'selfie_out' → OUT, 'machine_N' → OUT (factory out flow)
  let punchType = 'IN';
  if (rawPunchType) {
    punchType = rawPunchType.toUpperCase();
  } else if (context?.includes('out') || context?.startsWith('machine_')) {
    punchType = 'OUT';
  }

  // Look up worker's full name for the filename
  let workerName = 'Unknown';
  try {
    await connectDB();
    const user = await User.findById(userId).select('fullName').lean();
    if (user && user.fullName) {
      workerName = user.fullName;
    }
  } catch {
    // Non-fatal: fall back to "Unknown" if DB lookup fails
    console.warn('Could not look up worker name for Drive filename');
  }

  try {
    const { fileId, webViewLink } = await uploadImageToDrive(
      base64,
      mimeType,
      workerName,
      punchType,
      context,
    );
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
