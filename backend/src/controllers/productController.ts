import { Request, Response } from 'express';
import * as productService from '../services/productService';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Product Controller
 * HTTP handlers za product endpoints
 */

/**
 * POST /api/v1/products
 * Create new product (ADMIN_APP only)
 */
export const createProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data: productService.CreateProductDto = req.body;

  const product = await productService.createProduct(data);

  res.status(201).json({
    success: true,
    message: 'Produkt erfolgreich erstellt',
    data: product,
  });
});

/**
 * GET /api/v1/products/:id
 * Get product by ID
 */
export const getProductById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const product = await productService.getProductById(id);

  res.status(200).json({
    success: true,
    data: product,
  });
});

/**
 * GET /api/v1/products
 * Get all products (with optional filters)
 * Query params: ?type=X&available_only=true&search=Y
 */
export const getProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const filters: productService.ProductFilters = {
    type: req.query.type as string | undefined,
    available_only: req.query.available_only === 'true',
    search: req.query.search as string | undefined,
  };

  const products = await productService.getProducts(filters);

  res.status(200).json({
    success: true,
    data: products,
    meta: {
      count: products.length,
      filters,
    },
  });
});

/**
 * GET /api/v1/products/types
 * Get all unique product types
 */
export const getProductTypes = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const types = await productService.getProductTypes();

  res.status(200).json({
    success: true,
    data: types,
    meta: {
      count: types.length,
    },
  });
});

/**
 * PUT /api/v1/products/:id
 * Update product (ADMIN_APP only)
 */
export const updateProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data: productService.UpdateProductDto = req.body;

  const product = await productService.updateProduct(id, data);

  res.status(200).json({
    success: true,
    message: 'Produkt erfolgreich aktualisiert',
    data: product,
  });
});

/**
 * PATCH /api/v1/products/:id/availability
 * Set product availability (ADMIN_APP only)
 * Body: { is_available: boolean }
 */
export const setProductAvailability = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { is_available } = req.body;

    if (typeof is_available !== 'boolean') {
      res.status(400).json({
        success: false,
        error: 'is_available muss ein Boolean sein',
      });
      return;
    }

    const result = await productService.setProductAvailability(id, is_available);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }
);

/**
 * DELETE /api/v1/products/:id
 * Delete product permanently (ADMIN_APP only)
 */
export const deleteProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const result = await productService.deleteProduct(id);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});
