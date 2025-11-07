import { Request, Response } from 'express';
import * as authService from '../services/authService';
import { asyncHandler } from '../middleware/errorHandler';
import { RegisterDto, VerifyEmailDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from '../types';

/**
 * Auth Controller
 * HTTP Request Handlers za autentifikaciju
 */

/**
 * POST /api/v1/auth/register
 * Registracija Admin Einrichtung
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const data: RegisterDto = req.body;
  const result = await authService.register(data);

  res.status(201).json({
    success: true,
    message: result.message,
    data: { email: result.email },
  });
});

/**
 * POST /api/v1/auth/verify-email
 * Verifikacija email-a sa 6-digit kodom
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const data: VerifyEmailDto = req.body;
  const result = await authService.verifyEmail(data);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

/**
 * POST /api/v1/auth/resend-code
 * Ponovno slanje verifikacionog koda
 */
export const resendCode = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await authService.resendVerificationCode(email);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

/**
 * POST /api/v1/auth/login
 * Login (Admin App & Admin Institution)
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const data: LoginDto = req.body;
  const result = await authService.login(data);

  // Set HTTP-Only cookies
  res.cookie('accessToken', result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 min
  });

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({
    success: true,
    message: 'Anmeldung erfolgreich',
    data: {
      user: result.user,
      accessToken: result.accessToken, // Pošalji i u response-u (za mobile)
      refreshToken: result.refreshToken,
    },
  });
});

/**
 * POST /api/v1/auth/logout
 * Logout
 */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(200).json({
    success: true,
    message: 'Erfolgreich abgemeldet',
  });
});

/**
 * POST /api/v1/auth/forgot-password
 * Zaboravljena lozinka
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const data: ForgotPasswordDto = req.body;
  const result = await authService.forgotPassword(data);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

/**
 * POST /api/v1/auth/reset-password
 * Reset lozinke
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const data: ResetPasswordDto = req.body;
  const result = await authService.resetPassword(data);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

/**
 * GET /api/v1/auth/me
 * Get current user info (protected route)
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  // req.user postoji ako je authenticate middleware prošao
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

/**
 * POST /api/v1/auth/worker-login
 * Worker login (username/password)
 */
export const workerLogin = asyncHandler(async (req: Request, res: Response) => {
  const data: any = req.body; // WorkerLoginDto
  const result = await authService.workerLogin(data);

  // Set HTTP-Only cookies
  res.cookie('accessToken', result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 min
  });

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({
    success: true,
    message: 'Anmeldung erfolgreich',
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});
