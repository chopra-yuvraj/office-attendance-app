import { google } from 'googleapis';
import { Readable } from 'stream';

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!;

function getAuthClient() {
  const credentials = JSON.parse(
    Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!, 'base64').toString('utf-8')
  );
  return new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
    clientOptions: {
      subject: process.env.GOOGLE_IMPERSONATE_EMAIL!, // Impersonate this Gmail user so files count against their quota
    },
  });
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
