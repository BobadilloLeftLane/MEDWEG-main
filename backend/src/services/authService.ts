import {
  RegisterDto,
  VerifyEmailDto,
  LoginDto,
  WorkerLoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  LoginResponse,
  UserRole,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
} from '../types';
import * as userRepo from '../repositories/userRepository';
import * as institutionRepo from '../repositories/institutionRepository';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { encrypt } from '../utils/encryption';
import { sendVerificationEmail, sendPasswordResetEmail } from './emailService';
import { UserModel } from '../models/User';
import logger from '../utils/logger';
import crypto from 'crypto';

/**
 * Auth Service
 * Business logic za autentifikaciju i autorizaciju
 */

/**
 * Generate 6-digit verification code
 */
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate random token (za password reset)
 */
const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Register new Admin Institution
 */
export const register = async (data: RegisterDto): Promise<{ message: string; email: string }> => {
  // 1. Validate password strength
  const passwordError = validatePasswordStrength(data.password);
  if (passwordError) {
    throw new ValidationError(passwordError);
  }

  // 2. Check if email already exists
  const existingUser = await userRepo.findUserByEmail(data.email);
  if (existingUser) {
    throw new ValidationError('E-Mail-Adresse ist bereits registriert');
  }

  // 3. Hash password
  const passwordHash = await hashPassword(data.password);

  // 4. Encrypt address street
  const encryptedStreet = await encrypt(data.addressStreet);

  // 5. Create institution
  const institution = await institutionRepo.createInstitution({
    name: data.institutionName,
    address_street: encryptedStreet,
    address_plz: data.addressPlz,
    address_city: data.addressCity,
  });

  logger.info('Institution created', { institutionId: institution.id, name: institution.name });

  // 6. Generate verification code (expires in 5 minutes)
  const verificationCode = generateVerificationCode();
  const codeExpiresAt = new Date();
  codeExpiresAt.setMinutes(codeExpiresAt.getMinutes() + 5);

  // 7. Create user (Admin Institution)
  const user = await userRepo.createUser({
    email: data.email,
    password_hash: passwordHash,
    role: UserRole.ADMIN_INSTITUTION,
    institution_id: institution.id,
    verification_code: verificationCode,
    verification_code_expires_at: codeExpiresAt,
  });

  logger.info('User registered', { userId: user.id, email: user.email, role: user.role });

  // 8. Send verification email
  await sendVerificationEmail(data.email, verificationCode);

  return {
    message: 'Registrierung erfolgreich. Bitte überprüfen Sie Ihre E-Mail.',
    email: data.email,
  };
};

/**
 * Verify email with 6-digit code
 */
export const verifyEmail = async (data: VerifyEmailDto): Promise<{ message: string }> => {
  // 1. Find user by email
  const user = await userRepo.findUserByEmail(data.email);
  if (!user) {
    throw new NotFoundError('Benutzer nicht gefunden');
  }

  // 2. Check if already verified
  if (user.is_verified) {
    throw new ValidationError('E-Mail ist bereits verifiziert');
  }

  // 3. Check verification code
  if (!user.verification_code || user.verification_code !== data.code) {
    throw new ValidationError('Ungültiger Verifizierungscode');
  }

  // 4. Check if code expired
  if (!user.verification_code_expires_at || new Date() > user.verification_code_expires_at) {
    throw new ValidationError('Verifizierungscode ist abgelaufen');
  }

  // 5. Verify user
  await userRepo.verifyUser(user.id);

  // 6. Verify institution
  if (user.institution_id) {
    await institutionRepo.verifyInstitution(user.institution_id);
  }

  logger.info('Email verified', { userId: user.id, email: user.email });

  return {
    message: 'E-Mail erfolgreich verifiziert. Sie können sich jetzt anmelden.',
  };
};

/**
 * Resend verification code
 */
export const resendVerificationCode = async (email: string): Promise<{ message: string }> => {
  // 1. Find user
  const user = await userRepo.findUserByEmail(email);
  if (!user) {
    throw new NotFoundError('Benutzer nicht gefunden');
  }

  // 2. Check if already verified
  if (user.is_verified) {
    throw new ValidationError('E-Mail ist bereits verifiziert');
  }

  // 3. Generate new code
  const verificationCode = generateVerificationCode();
  const codeExpiresAt = new Date();
  codeExpiresAt.setMinutes(codeExpiresAt.getMinutes() + 5);

  // 4. Update code in DB
  await userRepo.updateVerificationCode(user.id, verificationCode, codeExpiresAt);

  // 5. Send email
  await sendVerificationEmail(email, verificationCode);

  logger.info('Verification code resent', { email });

  return {
    message: 'Verifizierungscode wurde erneut gesendet',
  };
};

/**
 * Login (Admin App & Admin Institution)
 */
export const login = async (data: LoginDto): Promise<LoginResponse> => {
  // 1. Find user
  const user = await userRepo.findUserByEmail(data.email);
  if (!user) {
    throw new UnauthorizedError('Ungültige Anmeldedaten');
  }

  // 2. Check if verified
  if (!user.is_verified) {
    throw new UnauthorizedError('E-Mail ist nicht verifiziert');
  }

  // 3. Check if active
  if (!user.is_active) {
    throw new UnauthorizedError('Benutzerkonto wurde deaktiviert');
  }

  // 4. Verify password
  const isPasswordValid = await verifyPassword(data.password, user.password_hash);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Ungültige Anmeldedaten');
  }

  // 5. Update last login
  await userRepo.updateLastLogin(user.id);

  // 6. Generate tokens
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    institutionId: user.institution_id,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  logger.info('User logged in', { userId: user.id, email: user.email });

  return {
    user: UserModel.toResponse(user),
    accessToken,
    refreshToken,
  };
};

/**
 * Worker Login (username/password)
 */
export const workerLogin = async (data: WorkerLoginDto): Promise<LoginResponse> => {
  const { findWorkerByUsername, updateWorkerLastLogin } = await import('../repositories/workerRepository');

  logger.info(`Worker login attempt: username="${data.username}"`);

  // 1. Find worker by username
  const worker = await findWorkerByUsername(data.username);
  if (!worker) {
    logger.warn(`Worker not found: username="${data.username}"`);
    throw new UnauthorizedError('Ungültige Anmeldedaten');
  }

  logger.info(`Worker found: id=${worker.id}, username="${worker.username}", active=${worker.is_active}`);

  // 2. Check if active
  if (!worker.is_active) {
    logger.warn(`Worker account deactivated: id=${worker.id}`);
    throw new UnauthorizedError('Benutzerkonto wurde deaktiviert');
  }

  // 3. Verify password
  const isPasswordValid = await verifyPassword(data.password, worker.password_hash);
  if (!isPasswordValid) {
    logger.warn(`Invalid password for worker: id=${worker.id}`);
    throw new UnauthorizedError('Ungültige Anmeldedaten');
  }

  logger.info(`Worker login successful: id=${worker.id}`);

  // 4. Update last login
  await updateWorkerLastLogin(worker.id);

  // 5. Generate tokens (worker tokens imaju workerId umesto userId)
  const payload = {
    userId: worker.id, // Worker ID ide kao userId u tokenu
    email: worker.username, // Username ide kao email u tokenu
    role: UserRole.WORKER,
    institutionId: worker.institution_id,
    patientId: worker.patient_id || undefined, // Add patient ID to token (convert null to undefined)
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  logger.info('Worker logged in', { workerId: worker.id, username: worker.username, patientId: worker.patient_id });

  // 6. Return worker response (slično kao user)
  return {
    user: {
      id: worker.id,
      email: worker.username, // Username umesto email-a
      role: UserRole.WORKER,
      institution_id: worker.institution_id,
      patient_id: worker.patient_id || undefined, // Add patient ID to user object (convert null to undefined)
      is_verified: true, // Workers su uvek verified
      is_active: worker.is_active,
      created_at: worker.created_at,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Forgot Password
 */
export const forgotPassword = async (data: ForgotPasswordDto): Promise<{ message: string }> => {
  // 1. Find user
  const user = await userRepo.findUserByEmail(data.email);
  if (!user) {
    // Vrati success i za nepostojeći email (security best practice)
    return {
      message:
        'Falls diese E-Mail registriert ist, wurde ein Link zum Zurücksetzen des Passworts gesendet.',
    };
  }

  // 2. Generate reset token (expires in 30 minutes)
  const resetToken = generateResetToken();
  const tokenExpiresAt = new Date();
  tokenExpiresAt.setMinutes(tokenExpiresAt.getMinutes() + 30);

  // 3. Save token to DB
  await userRepo.setResetToken(user.id, resetToken, tokenExpiresAt);

  // 4. Send reset email
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await sendPasswordResetEmail(data.email, resetLink);

  logger.info('Password reset requested', { email: data.email });

  return {
    message:
      'Falls diese E-Mail registriert ist, wurde ein Link zum Zurücksetzen des Passworts gesendet.',
  };
};

/**
 * Reset Password
 */
export const resetPassword = async (data: ResetPasswordDto): Promise<{ message: string }> => {
  // 1. Validate password strength
  const passwordError = validatePasswordStrength(data.newPassword);
  if (passwordError) {
    throw new ValidationError(passwordError);
  }

  // 2. Find user by reset token
  const user = await userRepo.findUserByResetToken(data.token);
  if (!user) {
    throw new ValidationError('Ungültiger oder abgelaufener Reset-Token');
  }

  // 3. Hash new password
  const passwordHash = await hashPassword(data.newPassword);

  // 4. Update password and clear reset token
  await userRepo.updatePassword(user.id, passwordHash);

  logger.info('Password reset successful', { userId: user.id, email: user.email });

  return {
    message: 'Passwort erfolgreich zurückgesetzt. Sie können sich jetzt anmelden.',
  };
};

/**
 * Refresh Access Token
 */
export const refreshAccessToken = (refreshToken: string): { accessToken: string; refreshToken: string } => {
  // Verify refresh token
  const { verifyRefreshToken } = require('../utils/jwt');

  try {
    const payload = verifyRefreshToken(refreshToken);

    // Generate new tokens
    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      institutionId: payload.institutionId,
      patientId: payload.patientId,
    });

    const newRefreshToken = generateRefreshToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      institutionId: payload.institutionId,
      patientId: payload.patientId,
    });

    logger.info('Access token refreshed', { userId: payload.userId });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    throw new UnauthorizedError('Ungültiger oder abgelaufener Refresh-Token');
  }
};
