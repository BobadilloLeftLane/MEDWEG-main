import { Router } from 'express';
import * as recurringOrderController from '../controllers/recurringOrderController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

/**
 * Recurring Order Routes
 * /api/v1/recurring-orders/*
 *
 * ADMIN_INSTITUTION can manage recurring order templates
 */
const router = Router();

router.use(authenticate);
router.use(authorize([UserRole.ADMIN_INSTITUTION]));

// POST /api/v1/recurring-orders/templates
router.post('/templates', recurringOrderController.createTemplate);

// GET /api/v1/recurring-orders/templates
router.get('/templates', recurringOrderController.getTemplates);

// GET /api/v1/recurring-orders/templates/:id
router.get('/templates/:id', recurringOrderController.getTemplateById);

// PATCH /api/v1/recurring-orders/templates/:id/toggle
router.patch('/templates/:id/toggle', recurringOrderController.toggleTemplateActive);

// DELETE /api/v1/recurring-orders/templates/:id
router.delete('/templates/:id', recurringOrderController.deleteTemplate);

// GET /api/v1/recurring-orders/pending-approvals
router.get('/pending-approvals', recurringOrderController.getPendingApprovals);

// POST /api/v1/recurring-orders/executions/:id/approve
router.post('/executions/:id/approve', recurringOrderController.approveExecution);

// POST /api/v1/recurring-orders/test-schedule (for testing)
router.post('/test-schedule', recurringOrderController.testScheduledCreation);

export default router;
