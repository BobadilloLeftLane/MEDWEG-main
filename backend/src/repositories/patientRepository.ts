import { pool } from '../config/database';
import { encrypt, decrypt } from '../utils/encryption';

/**
 * Patient Repository
 * GDPR-compliant: first_name, last_name, date_of_birth su enkriptovani
 */

export interface PatientDb {
  id: string;
  institution_id: string;
  first_name: Buffer; // Encrypted
  last_name: Buffer; // Encrypted
  date_of_birth: Buffer; // Encrypted
  address: Buffer; // Encrypted
  unique_code: string; // Plain text za brzo pretraživanje
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PatientDecrypted {
  id: string;
  institution_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  address: string;
  unique_code: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Create new patient
 */
export const createPatient = async (data: {
  institution_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  address: string;
  unique_code: string;
}): Promise<PatientDb> => {
  // Encrypt sensitive fields
  const encryptedFirstName = await encrypt(data.first_name);
  const encryptedLastName = await encrypt(data.last_name);
  const encryptedDob = await encrypt(data.date_of_birth);
  const encryptedAddress = await encrypt(data.address);

  const result = await pool.query(
    `INSERT INTO patients (institution_id, first_name, last_name, date_of_birth, address, unique_code, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, true)
    RETURNING *`,
    [
      data.institution_id,
      encryptedFirstName,
      encryptedLastName,
      encryptedDob,
      encryptedAddress,
      data.unique_code,
    ]
  );

  return result.rows[0];
};

/**
 * Find patient by ID (decrypted)
 */
export const findPatientById = async (patientId: string): Promise<PatientDecrypted | null> => {
  const result = await pool.query(`SELECT * FROM patients WHERE id = $1`, [patientId]);

  if (result.rows.length === 0) {
    return null;
  }

  const patient = result.rows[0];

  // Decrypt sensitive fields
  return {
    id: patient.id,
    institution_id: patient.institution_id,
    first_name: await decrypt(patient.first_name),
    last_name: await decrypt(patient.last_name),
    date_of_birth: await decrypt(patient.date_of_birth),
    address: await decrypt(patient.address),
    unique_code: patient.unique_code,
    is_active: patient.is_active,
    created_at: patient.created_at,
    updated_at: patient.updated_at,
  };
};

/**
 * Find patient by unique code (in institution)
 */
export const findPatientByCode = async (
  institutionId: string,
  uniqueCode: string
): Promise<PatientDecrypted | null> => {
  const result = await pool.query(
    `SELECT * FROM patients WHERE institution_id = $1 AND unique_code = $2`,
    [institutionId, uniqueCode]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const patient = result.rows[0];

  return {
    id: patient.id,
    institution_id: patient.institution_id,
    first_name: await decrypt(patient.first_name),
    last_name: await decrypt(patient.last_name),
    date_of_birth: await decrypt(patient.date_of_birth),
    address: await decrypt(patient.address),
    unique_code: patient.unique_code,
    is_active: patient.is_active,
    created_at: patient.created_at,
    updated_at: patient.updated_at,
  };
};

/**
 * Get all patients for institution (decrypted)
 */
export const getPatientsByInstitution = async (
  institutionId: string,
  activeOnly: boolean = true
): Promise<PatientDecrypted[]> => {
  const query = activeOnly
    ? `SELECT * FROM patients WHERE institution_id = $1 AND is_active = true ORDER BY created_at DESC`
    : `SELECT * FROM patients WHERE institution_id = $1 ORDER BY created_at DESC`;

  const result = await pool.query(query, [institutionId]);

  // Decrypt all patients
  const patients = await Promise.all(
    result.rows.map(async (patient) => ({
      id: patient.id,
      institution_id: patient.institution_id,
      first_name: await decrypt(patient.first_name),
      last_name: await decrypt(patient.last_name),
      date_of_birth: await decrypt(patient.date_of_birth),
      address: await decrypt(patient.address),
      unique_code: patient.unique_code,
      is_active: patient.is_active,
      created_at: patient.created_at,
      updated_at: patient.updated_at,
    }))
  );

  return patients;
};

/**
 * Update patient
 */
export const updatePatient = async (
  patientId: string,
  data: {
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    address?: string;
  }
): Promise<PatientDb> => {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.first_name !== undefined) {
    updates.push(`first_name = $${paramCount}`);
    values.push(await encrypt(data.first_name));
    paramCount++;
  }

  if (data.last_name !== undefined) {
    updates.push(`last_name = $${paramCount}`);
    values.push(await encrypt(data.last_name));
    paramCount++;
  }

  if (data.date_of_birth !== undefined) {
    updates.push(`date_of_birth = $${paramCount}`);
    values.push(await encrypt(data.date_of_birth));
    paramCount++;
  }

  if (data.address !== undefined) {
    updates.push(`address = $${paramCount}`);
    values.push(await encrypt(data.address));
    paramCount++;
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(patientId);

  const result = await pool.query(
    `UPDATE patients SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  return result.rows[0];
};

/**
 * Deactivate patient (soft delete)
 */
export const deactivatePatient = async (patientId: string): Promise<void> => {
  await pool.query(
    `UPDATE patients SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [patientId]
  );
};

/**
 * Reactivate patient
 */
export const reactivatePatient = async (patientId: string): Promise<void> => {
  await pool.query(
    `UPDATE patients SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
    [patientId]
  );
};

/**
 * Delete patient permanently (GDPR compliance)
 */
export const deletePatient = async (patientId: string): Promise<void> => {
  await pool.query(`DELETE FROM patients WHERE id = $1`, [patientId]);
};
