import crypto from 'crypto';

const KEY = Buffer.from(process.env.ENCRYPTION_KEY || '0'.repeat(64), 'hex'); // 32 bytes

/**
 * Encrypt a plaintext string using AES-256-CBC.
 * Returns "iv_hex:encrypted_hex" format.
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypt a string encrypted by encrypt().
 * Expects "iv_hex:encrypted_hex" format.
 */
export function decrypt(encrypted: string): string {
  const [ivHex, encHex] = encrypted.split(':');
  const iv      = Buffer.from(ivHex, 'hex');
  const enc     = Buffer.from(encHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, iv);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}
