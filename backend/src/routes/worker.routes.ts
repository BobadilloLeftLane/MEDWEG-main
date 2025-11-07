import { Router } from 'express';
import * as workerController from '../controllers/workerController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

/**
 * Worker Routes
 * /api/v1/workers/*
 *
 * Only ADMIN_INSTITUTION can access these routes
 */
const router = Router();

// All worker routes require authentication
router.use(authenticate);

// Only ADMIN_INSTITUTION can manage workers
router.use(authorize([UserRole.ADMIN_INSTITUTION]));

/**
 * Worker Management Endpoints
 */

// POST /api/v1/workers/generate/:patientId
// Generate worker credentials for a patient
router.post('/generate/:patientId', workerController.generateWorkerForPatient);

// GET /api/v1/workers/patient/:patientId
// Get worker by patient ID
router.get('/patient/:patientId', workerController.getWorkerByPatientId);

// GET /api/v1/workers
// Get all workers for institution
router.get('/', workerController.getWorkers);

// DELETE /api/v1/workers/:id
// Deactivate worker (soft delete)
router.delete('/:id', workerController.deactivateWorker);

// PATCH /api/v1/workers/:id/reset-password
// Reset worker password
router.patch('/:id/reset-password', workerController.resetWorkerPassword);

export default router;
