import { pool } from '../config/database';
import { Institution } from '../types';

/**
 * Institution Repository
 * Database queries za Institution entitet
 */

/**
 * Create new institution
 */
export const createInstitution = async (institutionData: {
  name: string;
  address_street: Buffer; // Enkriptovano
  address_plz: string;
  address_city: string;
}): Promise<Institution> => {
  const result = await pool.query(
    `INSERT INTO institutions
    (name, address_street, address_plz, address_city, is_verified, is_active)
    VALUES ($1, $2, $3, $4, false, true)
    RETURNING *`,
    [
      institutionData.name,
      institutionData.address_street,
      institutionData.address_plz,
      institutionData.address_city,
    ]
  );

  return result.rows[0];
};

/**
 * Find institution by ID
 */
export const findInstitutionById = async (id: string): Promise<Institution | null> => {
  const result = await pool.query('SELECT * FROM institutions WHERE id = $1', [id]);

  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Find institution by name
 */
export const findInstitutionByName = async (name: string): Promise<Institution | null> => {
  const result = await pool.query('SELECT * FROM institutions WHERE name = $1', [name]);

  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Verify institution
 * Also verifies the email of the admin_institution user
 */
export const verifyInstitution = async (id: string): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify the institution
    await client.query(
      `UPDATE institutions
      SET is_verified = true,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1`,
      [id]
    );

    // Verify the admin_institution user for this institution
    await client.query(
      `UPDATE users
      SET is_verified = true,
          is_email_verified = true,
          updated_at = CURRENT_TIMESTAMP
      WHERE institution_id = $1
        AND role = 'admin_institution'`,
      [id]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get all institutions (Admin App only)
 * Excludes MEDWEG Admin institution
 */
export const getAllInstitutions = async (filters?: {
  isActive?: boolean;
  isVerified?: boolean;
}): Promise<Institution[]> => {
  let query = 'SELECT * FROM institutions WHERE name != \'MEDWEG Admin\'';
  const params: any[] = [];

  if (filters?.isActive !== undefined) {
    params.push(filters.isActive);
    query += ` AND is_active = $${params.length}`;
  }

  if (filters?.isVerified !== undefined) {
    params.push(filters.isVerified);
    query += ` AND is_verified = $${params.length}`;
  }

  query += ' ORDER BY created_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
};

/**
 * Deactivate institution
 */
export const deactivateInstitution = async (id: string): Promise<void> => {
  await pool.query(
    `UPDATE institutions
    SET is_active = false,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1`,
    [id]
  );
};
