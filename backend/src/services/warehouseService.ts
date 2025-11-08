import * as warehouseRepo from '../repositories/warehouseRepository';
import logger from '../utils/logger';
import { ValidationError } from '../types';

/**
 * Warehouse Service
 * Business logic for stock management
 */

/**
 * Get all product stock information
 */
export const getAllProductStock = async (): Promise<warehouseRepo.ProductStock[]> => {
  logger.info('Fetching all product stock');
  const stock = await warehouseRepo.getAllProductStock();
  return stock;
};

/**
 * Get low stock alerts
 */
export const getLowStockProducts = async (): Promise<warehouseRepo.LowStockAlert[]> => {
  logger.info('Fetching low stock alerts');
  const alerts = await warehouseRepo.getLowStockProducts();
  return alerts;
};

/**
 * Get count of unacknowledged low stock alerts
 */
export const getLowStockAlertsCount = async (): Promise<number> => {
  const count = await warehouseRepo.getLowStockAlertsCount();
  return count;
};

/**
 * Update stock quantity (allows negative values for debt tracking)
 */
export const updateStockQuantity = async (
  productId: string,
  newQuantity: number
): Promise<warehouseRepo.ProductStock> => {
  // Allow negative values to track stock debt/shortage
  logger.info('Updating stock quantity', { productId, newQuantity });
  const product = await warehouseRepo.updateStockQuantity(productId, newQuantity);
  return product;
};

/**
 * Increase stock (kada dobijemo novu isporuku)
 */
export const increaseStock = async (
  productId: string,
  amount: number
): Promise<warehouseRepo.ProductStock> => {
  if (amount <= 0) {
    throw new ValidationError('Amount must be positive');
  }

  logger.info('Increasing stock', { productId, amount });
  const product = await warehouseRepo.increaseStock(productId, amount);
  return product;
};

/**
 * Decrease stock (automatski se poziva kada je order shipped)
 */
export const decreaseStock = async (
  productId: string,
  amount: number
): Promise<warehouseRepo.ProductStock> => {
  if (amount <= 0) {
    throw new ValidationError('Amount must be positive');
  }

  logger.info('Decreasing stock', { productId, amount });
  const product = await warehouseRepo.decreaseStock(productId, amount);
  return product;
};

/**
 * Update low stock threshold
 */
export const updateLowStockThreshold = async (
  productId: string,
  threshold: number
): Promise<warehouseRepo.ProductStock> => {
  if (threshold < 0) {
    throw new ValidationError('Threshold cannot be negative');
  }

  logger.info('Updating low stock threshold', { productId, threshold });
  const product = await warehouseRepo.updateLowStockThreshold(productId, threshold);
  return product;
};

/**
 * Acknowledge low stock alert
 */
export const acknowledgeLowStockAlert = async (
  productId: string
): Promise<warehouseRepo.ProductStock> => {
  logger.info('Acknowledging low stock alert', { productId });
  const product = await warehouseRepo.acknowledgeLowStockAlert(productId);
  return product;
};

/**
 * Update purchase price (Einkaufspreis)
 */
export const updatePurchasePrice = async (
  productId: string,
  purchasePrice: number
): Promise<warehouseRepo.ProductStock> => {
  if (purchasePrice < 0) {
    throw new ValidationError('Purchase price cannot be negative');
  }

  logger.info('Updating purchase price', { productId, purchasePrice });
  const product = await warehouseRepo.updatePurchasePrice(productId, purchasePrice);
  return product;
};

/**
 * Update product weight (Gewicht)
 */
export const updateWeight = async (
  productId: string,
  weight: number,
  weightUnit: string
): Promise<warehouseRepo.ProductStock> => {
  if (weight < 0) {
    throw new ValidationError('Weight cannot be negative');
  }

  if (!['kg', 'g'].includes(weightUnit)) {
    throw new ValidationError('Weight unit must be kg or g');
  }

  logger.info('Updating product weight', { productId, weight, weightUnit });
  const product = await warehouseRepo.updateWeight(productId, weight, weightUnit);
  return product;
};
