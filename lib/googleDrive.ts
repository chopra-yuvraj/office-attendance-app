import { google } from 'googleapis';
import { Readable } from 'stream';
import type { drive_v3 } from 'googleapis';
import sharp from 'sharp';

const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!;

/**
 * Create an OAuth2 client authenticated with a long-lived refresh token.
 * This lets the app upload files as the personal Gmail user (using their quota)
 * instead of a Service Account (which has zero quota on free Gmail).
 */
function getAuthClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return oauth2Client;
}

/**
 * Find or create a sub-folder inside a parent folder on Google Drive.
 * Used to build the Year > Month > Day > IN/OUT hierarchy.
 */
async function getOrCreateFolder(
  drive: drive_v3.Drive,
  folderName: string,
  parentId: string,
): Promise<string> {
  // Search for existing folder
  const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${parentId}' in parents and trashed=false`;
  const response = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id!;
  }

  // Create new folder
  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
  });

  return folder.data.id!;
}

/**
 * Get current date/time in IST (UTC+5:30), independent of server timezone.
 */
function getISTComponents() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
  const istTime = new Date(now.getTime() + istOffset);

  const year   = istTime.getUTCFullYear().toString();
  const month  = (istTime.getUTCMonth() + 1).toString().padStart(2, '0');
  const day    = istTime.getUTCDate().toString().padStart(2, '0');
  const hours  = istTime.getUTCHours().toString().padStart(2, '0');
  const minutes = istTime.getUTCMinutes().toString().padStart(2, '0');
  const seconds = istTime.getUTCSeconds().toString().padStart(2, '0');

  return { year, month, day, hours, minutes, seconds };
}

/**
 * Upload an image to Google Drive using a 4-level folder hierarchy:
 *   Root > Year > Year-Month > Year-Month-Day > IN|OUT|PRODUCTION
 *
 * Selfie files:  WorkerName_IN_HH-MM-SS_YYYY-MM-DD.jpg
 * Machine files: WorkerName_Machine-1_HH-MM-SS_YYYY-MM-DD.jpg
 * The file is made publicly readable (view-only) after upload.
 *
 * @param base64Data  - Raw base64 or data URL prefixed base64 string
 * @param mimeType    - 'image/jpeg' | 'image/png'
 * @param workerName  - Display name of the worker (e.g. "Yuvraj")
 * @param punchType   - 'IN', 'OUT', or 'PRODUCTION' (determines folder name)
 * @param context     - Upload context (e.g. 'selfie_in', 'selfie_out', 'machine_1')
 */
export async function uploadImageToDrive(
  base64Data: string,
  mimeType: string,
  workerName: string,
  punchType: string,
  context: string,
): Promise<{ fileId: string; webViewLink: string }> {
  const auth = getAuthClient();
  const drive = google.drive({ version: 'v3', auth });

  // --- IST date/time components ---
  const { year, month, day, hours, minutes, seconds } = getISTComponents();
  const dateString = `${year}-${month}-${day}`;
  const timeString = `${hours}-${minutes}-${seconds}`;

  // Sanitize worker name for filesystem safety
  const safeName = workerName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const normalizedPunchType = punchType.toUpperCase();

  // Build filename label based on context
  // Selfies: "Yuvraj_IN_09-30-00_2026-05-27.jpg"
  // Machines: "Yuvraj_Machine-1_09-30-00_2026-05-27.jpg"
  let fileLabel = normalizedPunchType; // default: IN or OUT
  if (context?.startsWith('machine_')) {
    const machineNum = context.replace('machine_', '');
    fileLabel = `Machine-${machineNum}`;
  }
  const fileName = `${safeName}_${fileLabel}_${timeString}_${dateString}.jpg`;

  // --- Build 4-tier folder hierarchy ---
  // Root > 2026 > 2026-05 > 2026-05-27 > IN
  const yearFolderId  = await getOrCreateFolder(drive, year, ROOT_FOLDER_ID);
  const monthFolderId = await getOrCreateFolder(drive, `${year}-${month}`, yearFolderId);
  const dayFolderId   = await getOrCreateFolder(drive, dateString, monthFolderId);
  const finalFolderId = await getOrCreateFolder(drive, normalizedPunchType, dayFolderId);

  // --- Apply Watermark & Upload the image ---
  const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
  let buffer = Buffer.from(base64, 'base64');

  try {
    const watermarkSvg = `
      <svg width="360" height="110">
        <rect x="0" y="0" width="360" height="110" fill="rgba(0, 0, 0, 0.65)" rx="5" ry="5" />
        <text x="15" y="30" font-family="sans-serif" font-size="20" fill="white" font-weight="bold">
          ${workerName}
        </text>
        <text x="15" y="60" font-family="sans-serif" font-size="18" fill="white">
          Date: ${dateString} | Time: ${timeString}
        </text>
        <text x="15" y="90" font-family="sans-serif" font-size="18" fill="white">
          Punch Type: ${normalizedPunchType}
        </text>
      </svg>
    `;

    buffer = await sharp(buffer)
      .composite([
        {
          input: Buffer.from(watermarkSvg),
          gravity: 'southeast',
        }
      ])
      .toBuffer();
  } catch (err) {
    console.error('Failed to apply watermark, continuing with original image:', err);
  }

  const stream = Readable.from(buffer);

  const response = await drive.files.create({
    requestBody: {
      name:    fileName,
      parents: [finalFolderId],
      mimeType,
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id, webViewLink',
  });

  const fileId = response.data.id!;

  // Make file publicly readable (view only)
  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  return { fileId, webViewLink: response.data.webViewLink! };
}
