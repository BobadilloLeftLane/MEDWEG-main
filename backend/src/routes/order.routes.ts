import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';
import { validate, createOrderSchema, updateOrderStatusSchema } from '../middleware/validation';
import { UserRole } from '../types';

/**
 * Order Routes
 * /api/v1/orders/*
 *
 * ADMIN_INSTITUTION and WORKER can manage their institution's orders
 * ADMIN_APPLICATION can view and manage all orders
 */
const router = Router();

router.use(authenticate);

// Admin Application specific routes (must be before authorization middleware)
// GET /api/v1/orders/all - Get all orders from all institutions
router.get(
  '/all',
  authorize([UserRole.ADMIN_APPLICATION]),
  orderController.getAllOrders
);

// PATCH /api/v1/orders/:id/confirm - Mark order as confirmed (zaprimljeno)
router.patch(
  '/:id/confirm',
  authorize([UserRole.ADMIN_APPLICATION]),
  orderController.confirmOrder
);

// PATCH /api/v1/orders/:id/admin-status - Update order status (admin only)
router.patch(
  '/:id/admin-status',
  authorize([UserRole.ADMIN_APPLICATION]),
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatusAdmin
);

// Institution/Worker routes
router.use(authorize([UserRole.ADMIN_INSTITUTION, UserRole.WORKER, UserRole.ADMIN_APPLICATION]));

// POST /api/v1/orders
router.post('/', validate(createOrderSchema), orderController.createOrder);

// GET /api/v1/orders
router.get('/', orderController.getOrders);

// GET /api/v1/orders/stats
router.get('/stats', orderController.getOrderStats);

// GET /api/v1/orders/:id
router.get('/:id', orderController.getOrderById);

// PATCH /api/v1/orders/:id/status
router.patch('/:id/status', validate(updateOrderStatusSchema), orderController.updateOrderStatus);

// DELETE /api/v1/orders/:id (only pending)
router.delete('/:id', orderController.deleteOrder);

export default router;
