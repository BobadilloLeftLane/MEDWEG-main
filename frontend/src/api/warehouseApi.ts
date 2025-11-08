import apiClient from './client';

/**
 * Warehouse API
 * Stock management and warehouse operations
 */

export interface ProductStock {
  id: string;
  name_de: string;
  type: string;
  size?: string;
  stock_quantity: number;
  low_stock_threshold: number;
  low_stock_alert_acknowledged: boolean;
  unit: string;
  quantity_per_box: number;
  price_per_unit: number;
  purchase_price: number;
  weight: number;
  weight_unit: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface LowStockAlert {
  product_id: string;
  product_name: string;
  stock_quantity: number;
  low_stock_threshold: number;
  shortage: number;
}

/**
 * Get all product stock information
 */
export const getAllProductStock = async (): Promise<ProductStock[]> => {
  const response = await apiClient.get('/warehouse/stock');
  return response.data.data;
};

/**
 * Get products with low stock
 */
export const getLowStockProducts = async (): Promise<LowStockAlert[]> => {
  const response = await apiClient.get('/warehouse/low-stock');
  return response.data.data;
};

/**
 * Get count of unacknowledged low stock alerts
 */
export const getLowStockAlertsCount = async (): Promise<number> => {
  const response = await apiClient.get('/warehouse/low-stock/count');
  return response.data.data.count;
};

/**
 * Update stock quantity
 */
export const updateStockQuantity = async (
  productId: string,
  quantity: number
): Promise<ProductStock> => {
  const response = await apiClient.patch(`/warehouse/${productId}/stock`, { quantity });
  return response.data.data;
};

/**
 * Increase stock (nova isporuka)
 */
export const increaseStock = async (
  productId: string,
  amount: number
): Promise<ProductStock> => {
  const response = await apiClient.patch(`/warehouse/${productId}/increase`, { amount });
  return response.data.data;
};

/**
 * Update low stock threshold
 */
export const updateLowStockThreshold = async (
  productId: string,
  threshold: number
): Promise<ProductStock> => {
  const response = await apiClient.patch(`/warehouse/${productId}/threshold`, { threshold });
  return response.data.data;
};

/**
 * Acknowledge low stock alert
 */
export const acknowledgeLowStockAlert = async (productId: string): Promise<ProductStock> => {
  const response = await apiClient.patch(`/warehouse/${productId}/acknowledge`);
  return response.data.data;
};

/**
 * Update purchase price (Einkaufspreis)
 */
export const updatePurchasePrice = async (
  productId: string,
  purchasePrice: number
): Promise<ProductStock> => {
  const response = await apiClient.patch(`/warehouse/${productId}/purchase-price`, { purchasePrice });
  return response.data.data;
};

/**
 * Update product weight (Gewicht)
 */
export const updateWeight = async (
  productId: string,
  weight: number,
  weightUnit: string
): Promise<ProductStock> => {
  const response = await apiClient.patch(`/warehouse/${productId}/weight`, { weight, weightUnit });
  return response.data.data;
};
