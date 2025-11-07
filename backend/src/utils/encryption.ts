import { pool } from '../config/database';

/**
 * Database Encryption Utilities
 * Koristi pgcrypto za enkripciju/dekripciju podataka
 */

const ENCRYPTION_KEY = process.env.DB_ENCRYPTION_KEY || 'fallback-key-change-this';

/**
 * Encrypt text using pgcrypto
 * @param text - Plain text
 * @returns Buffer (encrypted data)
 */
export const encrypt = async (text: string): Promise<Buffer> => {
  const result = await pool.query('SELECT pgp_sym_encrypt($1, $2) AS encrypted', [
    text,
    ENCRYPTION_KEY,
  ]);

  return result.rows[0].encrypted;
};

/**
 * Decrypt data using pgcrypto
 * @param encryptedData - Encrypted buffer
 * @returns Decrypted text
 */
export const decrypt = async (encryptedData: Buffer): Promise<string> => {
  const result = await pool.query('SELECT pgp_sym_decrypt($1, $2) AS decrypted', [
    encryptedData,
    ENCRYPTION_KEY,
  ]);

  return result.rows[0].decrypted;
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
