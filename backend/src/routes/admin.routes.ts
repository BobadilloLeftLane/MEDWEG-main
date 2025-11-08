import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

/**
 * Admin Routes
 * /api/v1/admin/*
 *
 * All routes require admin_application role
 */
const router = Router();

// All routes require authentication and admin_application role
router.use(authenticate);
router.use(authorize([UserRole.ADMIN_APPLICATION]));

/**
 * GET /api/v1/admin/statistics
 * Get comprehensive dashboard statistics
 */
router.get('/statistics', adminController.getDashboardStatistics);

/**
 * GET /api/v1/admin/statistics/institutions
 * Get per-institution statistics (orders, revenue, patients)
 */
router.get('/statistics/institutions', adminController.getInstitutionStatistics);

/**
 * GET /api/v1/admin/statistics/products
 * Get product popularity statistics
 */
router.get('/statistics/products', adminController.getProductStatistics);

/**
 * GET /api/v1/admin/patients-by-institution
 * Get patients grouped by institution
 */
router.get('/patients-by-institution', adminController.getPatientsByInstitution);

export default router;
