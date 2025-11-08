import { pool } from '../config/database';

/**
 * Warehouse Repository
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
 * Get all products with stock information
 */
export const getAllProductStock = async (): Promise<ProductStock[]> => {
  const result = await pool.query(`
    SELECT
      id, name_de, type, size, stock_quantity, low_stock_threshold,
      low_stock_alert_acknowledged, unit, quantity_per_box,
      price_per_unit, purchase_price, weight, weight_unit,
      is_available, created_at, updated_at
    FROM products
    WHERE is_available = true
    ORDER BY name_de ASC
  `);

  return result.rows;
};

/**
 * Get products with low stock (alerts)
 */
export const getLowStockProducts = async (): Promise<LowStockAlert[]> => {
  const result = await pool.query(`
    SELECT
      id as product_id,
      name_de as product_name,
      stock_quantity,
      low_stock_threshold,
      (low_stock_threshold - stock_quantity) as shortage
    FROM products
    WHERE stock_quantity < low_stock_threshold
      AND is_available = true
    ORDER BY shortage DESC, name_de ASC
  `);

  return result.rows;
};

/**
 * Get count of unacknowledged low stock alerts
 */
export const getLowStockAlertsCount = async (): Promise<number> => {
  const result = await pool.query(`
    SELECT COUNT(*) as count
    FROM products
    WHERE stock_quantity < low_stock_threshold
      AND low_stock_alert_acknowledged = false
      AND is_available = true
  `);

  return parseInt(result.rows[0].count);
};

/**
 * Update stock quantity for a product
 */
export const updateStockQuantity = async (
  productId: string,
  newQuantity: number
): Promise<ProductStock> => {
  const result = await pool.query(
    `UPDATE products
     SET stock_quantity = $1,
         low_stock_alert_acknowledged = CASE
           WHEN $1 < low_stock_threshold THEN false
           ELSE true
         END,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [newQuantity, productId]
  );

  if (result.rows.length === 0) {
    throw new Error('Product not found');
  }

  return result.rows[0];
};

/**
 * Increase stock (npr. kada dobijemo novu isporuku)
 */
export const increaseStock = async (
  productId: string,
  amount: number
): Promise<ProductStock> => {
  const result = await pool.query(
    `UPDATE products
     SET stock_quantity = stock_quantity + $1,
         low_stock_alert_acknowledged = CASE
           WHEN (stock_quantity + $1) < low_stock_threshold THEN false
           ELSE true
         END,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [amount, productId]
  );

  if (result.rows.length === 0) {
    throw new Error('Product not found');
  }

  return result.rows[0];
};

/**
 * Decrease stock (automatski poziva se kada je order shipped)
 */
export const decreaseStock = async (
  productId: string,
  amount: number
): Promise<ProductStock> => {
  const result = await pool.query(
    `UPDATE products
     SET stock_quantity = GREATEST(stock_quantity - $1, 0),
         low_stock_alert_acknowledged = CASE
           WHEN (stock_quantity - $1) < low_stock_threshold THEN false
           ELSE low_stock_alert_acknowledged
         END,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [amount, productId]
  );

  if (result.rows.length === 0) {
    throw new Error('Product not found');
  }

  return result.rows[0];
};

/**
 * Update low stock threshold
 */
export const updateLowStockThreshold = async (
  productId: string,
  threshold: number
): Promise<ProductStock> => {
  const result = await pool.query(
    `UPDATE products
     SET low_stock_threshold = $1,
         low_stock_alert_acknowledged = CASE
           WHEN stock_quantity < $1 THEN false
           ELSE true
         END,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [threshold, productId]
  );

  if (result.rows.length === 0) {
    throw new Error('Product not found');
  }

  return result.rows[0];
};

/**
 * Acknowledge low stock alert (čekiraj upozorenje)
 */
export const acknowledgeLowStockAlert = async (
  productId: string
): Promise<ProductStock> => {
  const result = await pool.query(
    `UPDATE products
     SET low_stock_alert_acknowledged = true,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [productId]
  );

  if (result.rows.length === 0) {
    throw new Error('Product not found');
  }

  return result.rows[0];
};

/**
 * Update purchase price (Einkaufspreis)
 */
export const updatePurchasePrice = async (
  productId: string,
  purchasePrice: number
): Promise<ProductStock> => {
  const result = await pool.query(
    `UPDATE products
     SET purchase_price = $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [purchasePrice, productId]
  );

  if (result.rows.length === 0) {
    throw new Error('Product not found');
  }

  return result.rows[0];
};

/**
 * Update product weight (Gewicht)
 */
export const updateWeight = async (
  productId: string,
  weight: number,
  weightUnit: string
): Promise<ProductStock> => {
  const result = await pool.query(
    `UPDATE products
     SET weight = $1,
         weight_unit = $2,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING *`,
    [weight, weightUnit, productId]
  );

  if (result.rows.length === 0) {
    throw new Error('Product not found');
  }

  return result.rows[0];
};
