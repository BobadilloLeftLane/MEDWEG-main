import { pool } from '../config/database';

/**
 * Worker Repository
 * Database operations za workers tabelu
 */

export interface Worker {
  id: string;
  institution_id: string;
  patient_id: string | null;
  username: string;
  password_hash: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_login_at: Date | null;
}

/**
 * Find worker by username (case-insensitive)
 */
export const findWorkerByUsername = async (username: string): Promise<Worker | null> => {
  const result = await pool.query(
    `SELECT * FROM workers WHERE LOWER(username) = LOWER($1)`,
    [username]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Find worker by ID
 */
export const findWorkerById = async (workerId: string): Promise<Worker | null> => {
  const result = await pool.query(
    `SELECT * FROM workers WHERE id = $1`,
    [workerId]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Find worker by patient ID
 */
export const findWorkerByPatientId = async (patientId: string): Promise<Worker | null> => {
  const result = await pool.query(
    `SELECT * FROM workers WHERE patient_id = $1`,
    [patientId]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Create new worker (called by Admin Institution)
 */
export const createWorker = async (data: {
  institution_id: string;
  patient_id?: string;
  username: string;
  password_hash: string;
}): Promise<Worker> => {
  const result = await pool.query(
    `INSERT INTO workers (institution_id, patient_id, username, password_hash, is_active)
    VALUES ($1, $2, $3, $4, true)
    RETURNING *`,
    [data.institution_id, data.patient_id || null, data.username, data.password_hash]
  );

  return result.rows[0];
};

/**
 * Update worker's last login timestamp
 */
export const updateWorkerLastLogin = async (workerId: string): Promise<void> => {
  await pool.query(
    `UPDATE workers
    SET last_login_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1`,
    [workerId]
  );
};

/**
 * Deactivate worker
 */
export const deactivateWorker = async (workerId: string): Promise<void> => {
  await pool.query(
    `UPDATE workers
    SET is_active = false,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1`,
    [workerId]
  );
};

/**
 * Get all workers for institution
 */
export const getWorkersByInstitution = async (institutionId: string): Promise<Worker[]> => {
  const result = await pool.query(
    `SELECT * FROM workers
    WHERE institution_id = $1
    ORDER BY created_at DESC`,
    [institutionId]
  );

  return result.rows;
};

/**
 * Update worker password
 */
export const updateWorkerPassword = async (
  workerId: string,
  passwordHash: string
): Promise<void> => {
  await pool.query(
    `UPDATE workers
    SET password_hash = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2`,
    [passwordHash, workerId]
  );
};
