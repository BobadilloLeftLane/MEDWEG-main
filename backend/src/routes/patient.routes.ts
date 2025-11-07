import { Router } from 'express';
import * as patientController from '../controllers/patientController';
import { authenticate, authorize } from '../middleware/auth';
import { validate, createPatientSchema, updatePatientSchema } from '../middleware/validation';
import { UserRole } from '../types';

/**
 * Patient Routes
 * /api/v1/patients/*
 *
 * Only ADMIN_INSTITUTION and WORKER can access these routes
 */
const router = Router();

// All patient routes require authentication
router.use(authenticate);

// Only ADMIN_INSTITUTION and WORKER can manage patients
router.use(authorize([UserRole.ADMIN_INSTITUTION, UserRole.WORKER]));

/**
 * Patient CRUD Endpoints
 */

// POST /api/v1/patients
router.post('/', validate(createPatientSchema), patientController.createPatient);

// GET /api/v1/patients
router.get('/', patientController.getPatients);

// GET /api/v1/patients/:id
router.get('/:id', patientController.getPatientById);

// PUT /api/v1/patients/:id
router.put('/:id', validate(updatePatientSchema), patientController.updatePatient);

// DELETE /api/v1/patients/:id/deactivate (soft delete)
router.delete('/:id/deactivate', patientController.deactivatePatient);

// POST /api/v1/patients/:id/reactivate
router.post('/:id/reactivate', patientController.reactivatePatient);

// DELETE /api/v1/patients/:id (permanent delete - GDPR)
// Only ADMIN_INSTITUTION can permanently delete
router.delete(
  '/:id',
  authorize([UserRole.ADMIN_INSTITUTION]),
  patientController.deletePatient
);

export default router;
