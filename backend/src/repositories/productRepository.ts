import { pool } from '../config/database';

/**
 * Product Repository
 * Products are managed by ADMIN_APP only
 */

export interface Product {
  id: string;
  name_de: string;
  description_de: string | null;
  type: string; // product_type ENUM: gloves, disinfectant_liquid, disinfectant_wipes
  size: string | null; // glove_size ENUM: S, M, L, XL (only for gloves)
  quantity_per_box: number;
  unit: string;
  price_per_unit: number; // Decimal(10,2)
  min_order_quantity: number;
  is_available: boolean;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Create new product (ADMIN_APP only)
 */
export const createProduct = async (data: {
  name_de: string;
  description_de?: string;
  type: string;
  size?: string;
  quantity_per_box: number;
  unit: string;
  price_per_unit: number;
  min_order_quantity: number;
  image_url?: string;
}): Promise<Product> => {
  const result = await pool.query(
    `INSERT INTO products (name_de, description_de, type, size, quantity_per_box, unit, price_per_unit, min_order_quantity, is_available, image_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9)
    RETURNING *`,
    [
      data.name_de,
      data.description_de || null,
      data.type,
      data.size || null,
      data.quantity_per_box,
      data.unit,
      data.price_per_unit,
      data.min_order_quantity,
      data.image_url || null,
    ]
  );

  return result.rows[0];
};

/**
 * Find product by ID
 */
export const findProductById = async (productId: string): Promise<Product | null> => {
  const result = await pool.query(`SELECT * FROM products WHERE id = $1`, [productId]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

/**
 * Get all products (with filters)
 */
export const getProducts = async (filters?: {
  type?: string;
  available_only?: boolean;
  search?: string;
}): Promise<Product[]> => {
  let query = `SELECT * FROM products WHERE 1=1`;
  const values: any[] = [];
  let paramCount = 1;

  // Filter by type
  if (filters?.type) {
    query += ` AND type = $${paramCount}`;
    values.push(filters.type);
    paramCount++;
  }

  // Filter by availability
  if (filters?.available_only) {
    query += ` AND is_available = true`;
  }

  // Search by name or description
  if (filters?.search) {
    query += ` AND (name_de ILIKE $${paramCount} OR description_de ILIKE $${paramCount})`;
    values.push(`%${filters.search}%`);
    paramCount++;
  }

  query += ` ORDER BY type, name_de ASC`;

  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * Get all unique product types
 */
export const getProductTypes = async (): Promise<string[]> => {
  const result = await pool.query(
    `SELECT DISTINCT type FROM products ORDER BY type ASC`
  );

  return result.rows.map((row) => row.type);
};

/**
 * Update product
 */
export const updateProduct = async (
  productId: string,
  data: {
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
): Promise<Product> => {
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (data.name_de !== undefined) {
    updates.push(`name_de = $${paramCount}`);
    values.push(data.name_de);
    paramCount++;
  }

  if (data.description_de !== undefined) {
    updates.push(`description_de = $${paramCount}`);
    values.push(data.description_de);
    paramCount++;
  }

  if (data.type !== undefined) {
    updates.push(`type = $${paramCount}`);
    values.push(data.type);
    paramCount++;
  }

  if (data.size !== undefined) {
    updates.push(`size = $${paramCount}`);
    values.push(data.size);
    paramCount++;
  }

  if (data.quantity_per_box !== undefined) {
    updates.push(`quantity_per_box = $${paramCount}`);
    values.push(data.quantity_per_box);
    paramCount++;
  }

  if (data.unit !== undefined) {
    updates.push(`unit = $${paramCount}`);
    values.push(data.unit);
    paramCount++;
  }

  if (data.price_per_unit !== undefined) {
    updates.push(`price_per_unit = $${paramCount}`);
    values.push(data.price_per_unit);
    paramCount++;
  }

  if (data.min_order_quantity !== undefined) {
    updates.push(`min_order_quantity = $${paramCount}`);
    values.push(data.min_order_quantity);
    paramCount++;
  }

  if (data.image_url !== undefined) {
    updates.push(`image_url = $${paramCount}`);
    values.push(data.image_url);
    paramCount++;
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(productId);

  const result = await pool.query(
    `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  return result.rows[0];
};

/**
 * Update quantity per box (for order processing)
 */
export const updateQuantityPerBox = async (
  productId: string,
  quantityChange: number
): Promise<Product> => {
  const result = await pool.query(
    `UPDATE products
    SET quantity_per_box = quantity_per_box + $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *`,
    [quantityChange, productId]
  );

  return result.rows[0];
};

/**
 * Mark product as available/unavailable
 */
export const setProductAvailability = async (
  productId: string,
  isAvailable: boolean
): Promise<void> => {
  await pool.query(
    `UPDATE products
    SET is_available = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2`,
    [isAvailable, productId]
  );
};

/**
 * Delete product permanently
 */
export const deleteProduct = async (productId: string): Promise<void> => {
  await pool.query(`DELETE FROM products WHERE id = $1`, [productId]);
};

/**
 * Check if product has sufficient quantity per box
 */
export const checkStock = async (
  productId: string,
  requestedQuantity: number
): Promise<boolean> => {
  const result = await pool.query(
    `SELECT quantity_per_box FROM products WHERE id = $1`,
    [productId]
  );

  if (result.rows.length === 0) {
    return false;
  }

  return result.rows[0].quantity_per_box >= requestedQuantity;
};
