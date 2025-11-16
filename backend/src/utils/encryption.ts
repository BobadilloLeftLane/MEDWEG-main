import { pool } from '../config/database';

/**
 * Database Encryption Utilities
 * Koristi pgcrypto za enkripciju/dekripciju podataka
 */

// CRITICAL: Encryption key must be set in environment variables
const ENCRYPTION_KEY: string | undefined = process.env.DB_ENCRYPTION_KEY;

// Validate encryption key exists
if (!ENCRYPTION_KEY) {
  throw new Error(
    'CRITICAL SECURITY ERROR: DB_ENCRYPTION_KEY must be set in environment variables. ' +
    'This key is used to encrypt GDPR-protected patient data (names, addresses, DOB). ' +
    'Application cannot start without this key.'
  );
}

// Validate minimum length (32 characters for AES-256)
if (ENCRYPTION_KEY.length < 32) {
  throw new Error(
    'CRITICAL SECURITY ERROR: DB_ENCRYPTION_KEY must be at least 32 characters long for secure AES-256 encryption. ' +
    `Current length: ${ENCRYPTION_KEY.length}. Generate a strong key using: ` +
    `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
  );
}

/**
 * Encrypt text using pgcrypto
 * @param text - Plain text
 * @returns Buffer (encrypted data)
 */
export const encrypt = async (text: string): Promise<Buffer> => {
  const result = await pool.query('SELECT pgp_sym_encrypt($1, $2) AS encrypted', [
    text,
    ENCRYPTION_KEY!,
  ]);

  return result.rows[0].encrypted;
};

/**
 * Decrypt data using pgcrypto
 * @param encryptedData - Encrypted buffer
 * @returns Decrypted text
 */
export const decrypt = async (encryptedData: Buffer): Promise<string> => {
  try {
    const result = await pool.query('SELECT pgp_sym_decrypt($1, $2) AS decrypted', [
      encryptedData,
      ENCRYPTION_KEY!,
    ]);

    return result.rows[0].decrypted;
  } catch (error: any) {
    // If decryption fails (wrong key or corrupt data), return error indicator
    console.error('Decryption failed:', error.message);
    throw new Error('Daten können nicht entschlüsselt werden. Möglicherweise wurde der Verschlüsselungsschlüssel geändert.');
  }
};

/**
 * Encrypt multiple fields
 */
export const encryptFields = async (
  fields: Record<string, string>
): Promise<Record<string, Buffer>> => {
  const encrypted: Record<string, Buffer> = {};

  for (const [key, value] of Object.entries(fields)) {
    encrypted[key] = await encrypt(value);
  }

  return encrypted;
};

/**
 * Decrypt multiple fields
 */
export const decryptFields = async (
  fields: Record<string, Buffer>
): Promise<Record<string, string>> => {
  const decrypted: Record<string, string> = {};

  for (const [key, value] of Object.entries(fields)) {
    decrypted[key] = await decrypt(value);
  }

  return decrypted;
};
