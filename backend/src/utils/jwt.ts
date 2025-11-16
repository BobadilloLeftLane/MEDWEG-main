import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

/**
 * JWT Token Generation & Verification
 */

// CRITICAL: JWT secrets must be set in environment variables
const JWT_SECRET: string | undefined = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET: string | undefined = process.env.JWT_REFRESH_SECRET;

// Validate secrets exist
if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error(
    'CRITICAL SECURITY ERROR: JWT_SECRET and JWT_REFRESH_SECRET must be set in environment variables. ' +
    'Application cannot start without these secrets.'
  );
}

// Validate minimum length (32 characters)
if (JWT_SECRET.length < 32) {
  throw new Error(
    'CRITICAL SECURITY ERROR: JWT_SECRET must be at least 32 characters long. ' +
    `Current length: ${JWT_SECRET.length}. Generate a strong secret using: ` +
    `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
  );
}

if (JWT_REFRESH_SECRET.length < 32) {
  throw new Error(
    'CRITICAL SECURITY ERROR: JWT_REFRESH_SECRET must be at least 32 characters long. ' +
    `Current length: ${JWT_REFRESH_SECRET.length}. Generate a strong secret using: ` +
    `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
  );
}

// Ensure secrets are different
if (JWT_SECRET === JWT_REFRESH_SECRET) {
  throw new Error(
    'CRITICAL SECURITY ERROR: JWT_SECRET and JWT_REFRESH_SECRET must be different.'
  );
}

/**
 * Generate Access Token (kratkotrajan - 15min, dev: 24h)
 */
export const generateAccessToken = (payload: JWTPayload): string => {
  const expiresIn = process.env.NODE_ENV === 'production' ? '15m' : '24h';
  return jwt.sign(payload, JWT_SECRET!, {
    expiresIn,
    algorithm: 'HS256', // Explicit algorithm to prevent algorithm confusion attacks
  });
};

/**
 * Generate Refresh Token (dugotrajan - 7 dana)
 */
export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET!, {
    expiresIn: '7d',
    algorithm: 'HS256', // Explicit algorithm
  });
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET!, {
      algorithms: ['HS256'], // Prevent algorithm confusion attacks
    }) as JWTPayload;
  } catch (error) {
    throw new Error('Ungültiger oder abgelaufener Token');
  }
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET!, {
      algorithms: ['HS256'], // Prevent algorithm confusion attacks
    }) as JWTPayload;
  } catch (error) {
    throw new Error('Ungültiger oder abgelaufener Refresh-Token');
  }
};

/**
 * Decode token bez verifikacije (za debugging)
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
};
