import { Router } from 'express';
import * as authController from '../controllers/authController';
import * as refreshTokenController from '../controllers/refreshTokenController';
import { validate, registerSchema, verifyEmailSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, workerLoginSchema } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

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

// POST /api/v1/auth/resend-code
router.post('/resend-code', authController.resendCode);

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
