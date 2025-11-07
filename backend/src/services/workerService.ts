import * as workerRepository from '../repositories/workerRepository';
import * as patientRepository from '../repositories/patientRepository';
import { hashPassword } from '../utils/password';
import { NotFoundError, AppError } from '../types';
import logger from '../utils/logger';

/**
 * Worker Service
 * Business logic za worker CRUD operacije
 */

/**
 * Generate unique username from patient name
 * Format: FirstLast + number (e.g., MMustermann1)
 */
const generateUsername = async (firstName: string, lastName: string): Promise<string> => {
  // Create base username: First letter of first name + Last name
  const baseUsername = `${firstName.charAt(0)}${lastName}`.replace(/\s+/g, '');

  let username = baseUsername;
  let counter = 1;

  // Check if username exists, if yes, add counter
  while (true) {
    const existing = await workerRepository.findWorkerByUsername(username);
    if (!existing) {
      break;
    }
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
};

/**
 * Generate random password
 * Format: 10 characters alphanumeric (e.g., jd32jf82md)
 */
const generatePassword = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

/**
 * Create worker for patient
 * Generates username and password, returns credentials
 */
export const createWorkerForPatient = async (
  patientId: string,
  institutionId: string,
  adminUserId: string
): Promise<{ username: string; password: string; workerId: string }> => {
  logger.info(`Creating worker for patient ${patientId} by admin ${adminUserId}`);

  // 1. Get patient data
  const patient = await patientRepository.findPatientById(patientId);
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  // 2. Verify patient belongs to institution
  if (patient.institution_id !== institutionId) {
    throw new AppError(403, 'Unauthorized: Patient does not belong to your institution');
  }

  // 3. Check if worker already exists for this patient
  const existingWorker = await workerRepository.findWorkerByPatientId(patientId);
  if (existingWorker) {
    throw new AppError(400, 'Worker-Zugangsdaten existieren bereits für diesen Patienten');
  }

  // 4. Decrypt patient name (it's encrypted in DB)
  const decryptedFirstName = String(patient.first_name);
  const decryptedLastName = String(patient.last_name);

  // 5. Generate unique username
  const username = await generateUsername(decryptedFirstName, decryptedLastName);

  // 6. Generate random password
  const plainPassword = generatePassword();

  // 7. Hash password
  const passwordHash = await hashPassword(plainPassword);

  // 8. Create worker in database
  const worker = await workerRepository.createWorker({
    institution_id: institutionId,
    patient_id: patientId,
    username,
    password_hash: passwordHash,
  });

  logger.info(`Worker created successfully: ${worker.id} (username: ${username})`);

  // 9. Return credentials (ONLY returned once!)
  return {
    username,
    password: plainPassword,
    workerId: worker.id,
  };
};

/**
 * Get workers by institution
 */
export const getWorkersByInstitution = async (institutionId: string) => {
  const workers = await workerRepository.getWorkersByInstitution(institutionId);

  // Remove sensitive data
  return workers.map(worker => ({
    id: worker.id,
    username: worker.username,
    patientId: worker.patient_id,
    institutionId: worker.institution_id,
    isActive: worker.is_active,
    createdAt: worker.created_at,
    lastLoginAt: worker.last_login_at,
  }));
};

/**
 * Deactivate worker
 */
export const deactivateWorker = async (workerId: string, institutionId: string) => {
  const worker = await workerRepository.findWorkerById(workerId);

  if (!worker) {
    throw new NotFoundError('Worker not found');
  }

  if (worker.institution_id !== institutionId) {
    throw new AppError(403, 'Unauthorized: Worker does not belong to your institution');
  }

  await workerRepository.deactivateWorker(workerId);
  logger.info(`Worker deactivated: ${workerId}`);
};

/**
 * Reset worker password
 */
export const resetWorkerPassword = async (workerId: string, institutionId: string): Promise<string> => {
  const worker = await workerRepository.findWorkerById(workerId);

  if (!worker) {
    throw new NotFoundError('Worker not found');
  }

  if (worker.institution_id !== institutionId) {
    throw new AppError(403, 'Unauthorized: Worker does not belong to your institution');
  }

  // Generate new password
  const newPassword = generatePassword();
  const passwordHash = await hashPassword(newPassword);

  // Update in database
  await workerRepository.updateWorkerPassword(workerId, passwordHash);
  logger.info(`Worker password reset: ${workerId}`);

  return newPassword;
};

/**
 * Get worker by patient ID
 */
export const getWorkerByPatientId = async (patientId: string, institutionId: string) => {
  // Verify patient belongs to institution
  const patient = await patientRepository.findPatientById(patientId);
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  if (patient.institution_id !== institutionId) {
    throw new AppError(403, 'Unauthorized: Patient does not belong to your institution');
  }

  // Get worker for this patient
  const worker = await workerRepository.findWorkerByPatientId(patientId);

  if (!worker) {
    return null;
  }

  // Return worker without sensitive data
  return {
    id: worker.id,
    username: worker.username,
    patientId: worker.patient_id,
    institutionId: worker.institution_id,
    isActive: worker.is_active,
    createdAt: worker.created_at,
    lastLoginAt: worker.last_login_at,
  };
};
