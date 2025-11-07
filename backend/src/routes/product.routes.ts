import { Router } from 'express';
import * as productController from '../controllers/productController';
import { authenticate, authorize } from '../middleware/auth';
import { validate, createProductSchema, updateProductSchema } from '../middleware/validation';
import { UserRole } from '../types';

/**
 * Product Routes
 * /api/v1/products/*
 *
 * - Viewing products: All authenticated users
 * - Managing products: ADMIN_APP only
 */
const router = Router();

// All product routes require authentication
router.use(authenticate);

/**
 * Public Product Endpoints (all authenticated users)
 */

// GET /api/v1/products/types
router.get('/types', productController.getProductTypes);

// GET /api/v1/products
router.get('/', productController.getProducts);

// GET /api/v1/products/:id
router.get('/:id', productController.getProductById);

/**
 * Admin Product Endpoints (ADMIN_APP only)
 */

// POST /api/v1/products
router.post(
  '/',
  authorize([UserRole.ADMIN_APPLICATION]),
  validate(createProductSchema),
  productController.createProduct
);

// PUT /api/v1/products/:id
router.put(
  '/:id',
  authorize([UserRole.ADMIN_APPLICATION]),
  validate(updateProductSchema),
  productController.updateProduct
);

// PATCH /api/v1/products/:id/availability
router.patch(
  '/:id/availability',
  authorize([UserRole.ADMIN_APPLICATION]),
  productController.setProductAvailability
);

// DELETE /api/v1/products/:id
router.delete('/:id', authorize([UserRole.ADMIN_APPLICATION]), productController.deleteProduct);

export default router;
