import { Router } from 'express';
import * as invoiceController from '../controllers/invoiceController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

/**
 * Invoice Routes
 * /api/v1/invoices/*
 *
 * Generate PDF invoices for orders
 */
const router = Router();

router.use(authenticate);
router.use(authorize([UserRole.ADMIN_INSTITUTION, UserRole.WORKER]));

// GET /api/v1/invoices/:orderId
// Download invoice PDF for a specific order
router.get('/:orderId', invoiceController.generateInvoice);

export default router;
