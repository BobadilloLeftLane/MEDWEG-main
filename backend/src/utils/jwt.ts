import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

/**
 * JWT Token Generation & Verification
 */

const JWT_SECRET: string = process.env.JWT_SECRET || 'fallback-secret-change-this';
const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';

/**
 * Generate Access Token (kratkotrajan - 15min, dev: 24h)
 */
export const generateAccessToken = (payload: JWTPayload): string => {
  const expiresIn = process.env.NODE_ENV === 'production' ? '15m' : '24h';
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
  });
};

/**
 * Generate Refresh Token (dugotrajan - 7 dana)
 */
export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Ungültiger oder abgelaufener Token');
  }
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
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
