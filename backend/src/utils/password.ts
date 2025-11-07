import bcrypt from 'bcrypt';

/**
 * Password Hashing & Verification
 * Koristi bcrypt sa 12 salt rounds
 */

const SALT_ROUNDS = 12;

/**
 * Hash password sa bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Verifikuj password
 * @param password - Plain text password
 * @param hash - Bcrypt hash
 * @returns true ako se poklapa
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

/**
 * Validate password strength
 * @param password - Plain text password
 * @returns Error message ili null ako je validan
 */
export const validatePasswordStrength = (password: string): string | null => {
  if (password.length < 8) {
    return 'Passwort muss mindestens 8 Zeichen lang sein';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Passwort muss mindestens einen Großbuchstaben enthalten';
  }

  if (!/[a-z]/.test(password)) {
    return 'Passwort muss mindestens einen Kleinbuchstaben enthalten';
  }

  if (!/[0-9]/.test(password)) {
    return 'Passwort muss mindestens eine Ziffer enthalten';
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Passwort muss mindestens ein Sonderzeichen enthalten';
  }

  return null;
};
