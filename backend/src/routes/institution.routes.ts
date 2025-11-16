import { Router } from 'express';
import * as institutionController from '../controllers/institutionController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

/**
 * Institution Routes
 * /api/v1/institutions/*
 *
 * Only ADMIN_APPLICATION can access institutions (customers)
 */
const router = Router();

router.use(authenticate);
router.use(authorize([UserRole.ADMIN_APPLICATION]));

// GET /api/v1/institutions
router.get('/', institutionController.getAllInstitutions);

// GET /api/v1/institutions/:id
router.get('/:id', institutionController.getInstitutionById);

// PATCH /api/v1/institutions/:id/verify
router.patch('/:id/verify', institutionController.verifyInstitution);

// PATCH /api/v1/institutions/:id/deactivate
router.patch('/:id/deactivate', institutionController.deactivateInstitution);

// PATCH /api/v1/institutions/:id/reactivate
router.patch('/:id/reactivate', institutionController.reactivateInstitution);

// DELETE /api/v1/institutions/:id
router.delete('/:id', institutionController.deleteInstitution);

export default router;
