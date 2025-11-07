import { ValidationError, NotFoundError } from '../types';
import * as productRepo from '../repositories/productRepository';
import logger from '../utils/logger';

/**
 * Product Service
 * Business logic za product CRUD operations
 * Products can be managed by ADMIN_APP only
 * All users can view products
 */

export interface CreateProductDto {
  name_de: string;
  description_de?: string;
  type: string; // product_type ENUM
  size?: string; // glove_size ENUM (only for gloves)
  quantity_per_box: number;
  unit: string;
  price_per_unit: number;
  min_order_quantity: number;
  image_url?: string;
}

export interface UpdateProductDto {
  name_de?: string;
  description_de?: string;
  type?: string;
  size?: string;
  quantity_per_box?: number;
  unit?: string;
  price_per_unit?: number;
  min_order_quantity?: number;
  image_url?: string;
}

export interface ProductFilters {
  type?: string;
  available_only?: boolean;
  search?: string;
}

/**
 * Create new product (ADMIN_APP only)
 */
export const createProduct = async (data: CreateProductDto): Promise<productRepo.Product> => {
  // Validate price
  if (data.price_per_unit < 0) {
    throw new ValidationError('Preis muss mindestens 0 sein');
  }

  // Validate quantities
  if (data.quantity_per_box < 0) {
    throw new ValidationError('Menge pro Box muss mindestens 0 sein');
  }

  if (data.min_order_quantity < 1) {
    throw new ValidationError('Mindestbestellmenge muss mindestens 1 sein');
  }

  // Create product
  const product = await productRepo.createProduct(data);

  logger.info('Product created', {
    productId: product.id,
    name: product.name_de,
    type: product.type,
  });

  return product;
};

/**
 * Get product by ID
 */
export const getProductById = async (productId: string): Promise<productRepo.Product> => {
  const product = await productRepo.findProductById(productId);

  if (!product) {
    throw new NotFoundError('Produkt nicht gefunden');
  }

  return product;
};

/**
 * Get all products (with optional filters)
 */
export const getProducts = async (filters?: ProductFilters): Promise<productRepo.Product[]> => {
  const products = await productRepo.getProducts(filters);

  logger.info('Products fetched', {
    count: products.length,
    filters,
  });

  return products;
};

/**
 * Get all unique product types
 */
export const getProductTypes = async (): Promise<string[]> => {
  const types = await productRepo.getProductTypes();

  return types;
};

/**
 * Update product (ADMIN_APP only)
 */
export const updateProduct = async (
  productId: string,
  data: UpdateProductDto
): Promise<productRepo.Product> => {
  // Find product
  const existingProduct = await productRepo.findProductById(productId);

  if (!existingProduct) {
    throw new NotFoundError('Produkt nicht gefunden');
  }

  // Validate price if provided
  if (data.price_per_unit !== undefined && data.price_per_unit < 0) {
    throw new ValidationError('Preis muss mindestens 0 sein');
  }

  // Validate quantities if provided
  if (data.quantity_per_box !== undefined && data.quantity_per_box < 0) {
    throw new ValidationError('Menge pro Box muss mindestens 0 sein');
  }

  if (data.min_order_quantity !== undefined && data.min_order_quantity < 1) {
    throw new ValidationError('Mindestbestellmenge muss mindestens 1 sein');
  }

  // Update product
  const updatedProduct = await productRepo.updateProduct(productId, data);

  logger.info('Product updated', {
    productId,
    updatedFields: Object.keys(data),
  });

  return updatedProduct;
};

/**
 * Set product availability (ADMIN_APP only)
 */
export const setProductAvailability = async (
  productId: string,
  isAvailable: boolean
): Promise<{ message: string }> => {
  const product = await productRepo.findProductById(productId);

  if (!product) {
    throw new NotFoundError('Produkt nicht gefunden');
  }

  await productRepo.setProductAvailability(productId, isAvailable);

  logger.info('Product availability changed', {
    productId,
    isAvailable,
  });

  return {
    message: isAvailable
      ? 'Produkt erfolgreich aktiviert'
      : 'Produkt erfolgreich deaktiviert',
  };
};

/**
 * Delete product permanently (ADMIN_APP only)
 */
export const deleteProduct = async (productId: string): Promise<{ message: string }> => {
  const product = await productRepo.findProductById(productId);

  if (!product) {
    throw new NotFoundError('Produkt nicht gefunden');
  }

  await productRepo.deleteProduct(productId);

  logger.warn('Product permanently deleted', {
    productId,
    name: product.name_de,
  });

  return {
    message: 'Produkt wurde dauerhaft gelöscht',
  };
};

/**
 * Check if product has sufficient stock
 */
export const checkProductStock = async (
  productId: string,
  requestedQuantity: number
): Promise<boolean> => {
  const hasStock = await productRepo.checkStock(productId, requestedQuantity);

  return hasStock;
};

/**
 * Update product quantity per box (for order processing)
 * Internal use - called by order service
 */
export const updateProductQuantity = async (
  productId: string,
  quantityChange: number
): Promise<productRepo.Product> => {
  const product = await productRepo.findProductById(productId);

  if (!product) {
    throw new NotFoundError('Produkt nicht gefunden');
  }

  // Check if quantity would go negative
  if (product.quantity_per_box + quantityChange < 0) {
    throw new ValidationError('Nicht genügend Menge verfügbar');
  }

  const updatedProduct = await productRepo.updateQuantityPerBox(productId, quantityChange);

  logger.info('Product quantity updated', {
    productId,
    quantityChange,
    newQuantity: updatedProduct.quantity_per_box,
  });

  return updatedProduct;
};
