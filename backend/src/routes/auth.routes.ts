import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/authController';
import * as refreshTokenController from '../controllers/refreshTokenController';
import { validate, registerSchema, verifyEmailSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, workerLoginSchema } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

/**
 * Rate Limiters for sensitive endpoints
 */
const resendCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Max 3 requests per 15 min
  message: 'Zu viele Anfragen. Bitte warten Sie 15 Minuten.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body.email || req.ip, // Rate limit per email
});

/**
 * Auth Routes
 * /api/v1/auth/*
 */
const router = Router();

/**
 * Public Routes (bez auth)
 */

// POST /api/v1/auth/register
router.post('/register', validate(registerSchema), authController.register);

// POST /api/v1/auth/verify-email
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);

// POST /api/v1/auth/resend-code (with rate limiting)
router.post('/resend-code', resendCodeLimiter, authController.resendCode);

// POST /api/v1/auth/login
router.post('/login', validate(loginSchema), authController.login);

// POST /api/v1/auth/worker-login
router.post('/worker-login', validate(workerLoginSchema), authController.workerLogin);

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);

// POST /api/v1/auth/reset-password
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// POST /api/v1/auth/refresh
router.post('/refresh', refreshTokenController.refreshToken);

/**
 * Protected Routes (sa auth)
 */

// POST /api/v1/auth/logout
router.post('/logout', authenticate, authController.logout);

// GET /api/v1/auth/me
router.get('/me', authenticate, authController.getCurrentUser);

export default router;
