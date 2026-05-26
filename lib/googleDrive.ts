import { google } from 'googleapis';
import { Readable } from 'stream';

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!;

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
 * Upload an image to Google Drive and return its fileId + webViewLink.
 * The file is made publicly readable (view-only) after upload.
 *
 * @param base64Data - Raw base64 or data URL prefixed base64 string
 * @param mimeType   - 'image/jpeg' | 'image/png'
 * @param fileName   - Target file name on Drive (e.g. "punch_in_userId_timestamp.jpg")
 */
export async function uploadImageToDrive(
  base64Data: string,
  mimeType: string,
  fileName: string,
): Promise<{ fileId: string; webViewLink: string }> {
  const auth = getAuthClient();
  const drive = google.drive({ version: 'v3', auth });

  // Strip data URL prefix if present
  const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');
  const stream = Readable.from(buffer);

  const response = await drive.files.create({
    requestBody: {
      name:    fileName,
      parents: [FOLDER_ID],
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
