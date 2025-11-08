import { Router } from 'express';
import * as warehouseController from '../controllers/warehouseController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

/**
 * Warehouse Routes
 * /api/v1/warehouse/*
 *
 * All routes require admin_application role
 */
const router = Router();

router.use(authenticate);
router.use(authorize([UserRole.ADMIN_APPLICATION]));

/**
 * GET /api/v1/warehouse/stock
 * Get all product stock information
 */
router.get('/stock', warehouseController.getAllProductStock);

/**
 * GET /api/v1/warehouse/low-stock
 * Get products with low stock
 */
router.get('/low-stock', warehouseController.getLowStockProducts);

/**
 * GET /api/v1/warehouse/low-stock/count
 * Get count of unacknowledged low stock alerts
 */
router.get('/low-stock/count', warehouseController.getLowStockAlertsCount);

/**
 * PATCH /api/v1/warehouse/:id/stock
 * Update stock quantity
 */
router.patch('/:id/stock', warehouseController.updateStockQuantity);

/**
 * PATCH /api/v1/warehouse/:id/increase
 * Increase stock (nova isporuka)
 */
router.patch('/:id/increase', warehouseController.increaseStock);

/**
 * PATCH /api/v1/warehouse/:id/threshold
 * Update low stock threshold
 */
router.patch('/:id/threshold', warehouseController.updateLowStockThreshold);

/**
 * PATCH /api/v1/warehouse/:id/acknowledge
 * Acknowledge low stock alert
 */
router.patch('/:id/acknowledge', warehouseController.acknowledgeLowStockAlert);

/**
 * PATCH /api/v1/warehouse/:id/purchase-price
 * Update purchase price (Einkaufspreis)
 */
router.patch('/:id/purchase-price', warehouseController.updatePurchasePrice);

/**
 * PATCH /api/v1/warehouse/:id/weight
 * Update product weight (Gewicht)
 */
router.patch('/:id/weight', warehouseController.updateWeight);

export default router;
