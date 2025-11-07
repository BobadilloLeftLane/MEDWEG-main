import { pool } from '../config/database';
import { User, UserRole } from '../types';

/**
 * User Repository
 * Database queries za User entitet
 */

/**
 * Find user by email
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Find user by ID
 */
export const findUserById = async (id: string): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Create new user
 */
export const createUser = async (userData: {
  email: string;
  password_hash: string;
  role: UserRole;
  institution_id?: string;
  verification_code: string;
  verification_code_expires_at: Date;
}): Promise<User> => {
  const result = await pool.query(
    `INSERT INTO users
    (email, password_hash, role, institution_id, verification_code, verification_code_expires_at, is_verified, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, false, true)
    RETURNING *`,
    [
      userData.email,
      userData.password_hash,
      userData.role,
      userData.institution_id || null,
      userData.verification_code,
      userData.verification_code_expires_at,
    ]
  );

  return result.rows[0];
};

/**
 * Update user verification status
 */
export const verifyUser = async (userId: string): Promise<void> => {
  await pool.query(
    `UPDATE users
    SET is_verified = true,
        verification_code = NULL,
        verification_code_expires_at = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1`,
    [userId]
  );
};

/**
 * Update user verification code
 */
export const updateVerificationCode = async (
  userId: string,
  code: string,
  expiresAt: Date
): Promise<void> => {
  await pool.query(
    `UPDATE users
    SET verification_code = $1,
        verification_code_expires_at = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3`,
    [code, expiresAt, userId]
  );
};

/**
 * Update last login timestamp
 */
export const updateLastLogin = async (userId: string): Promise<void> => {
  await pool.query(
    `UPDATE users
    SET last_login_at = CURRENT_TIMESTAMP
    WHERE id = $1`,
    [userId]
  );
};

/**
 * Set password reset token
 */
export const setResetToken = async (
  userId: string,
  token: string,
  expiresAt: Date
): Promise<void> => {
  await pool.query(
    `UPDATE users
    SET reset_token = $1,
        reset_token_expires_at = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3`,
    [token, expiresAt, userId]
  );
};

/**
 * Find user by reset token
 */
export const findUserByResetToken = async (token: string): Promise<User | null> => {
  const result = await pool.query(
    `SELECT * FROM users
    WHERE reset_token = $1
    AND reset_token_expires_at > NOW()`,
    [token]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Update password
 */
export const updatePassword = async (userId: string, passwordHash: string): Promise<void> => {
  await pool.query(
    `UPDATE users
    SET password_hash = $1,
        reset_token = NULL,
        reset_token_expires_at = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2`,
    [passwordHash, userId]
  );
};

/**
 * Deactivate user
 */
export const deactivateUser = async (userId: string): Promise<void> => {
  await pool.query(
    `UPDATE users
    SET is_active = false,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1`,
    [userId]
  );
};
