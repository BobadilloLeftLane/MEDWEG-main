import { pool } from '../config/database';
import { decrypt } from '../utils/encryption';

/**
 * Order Repository
 * Handles orders and order_items tables
 */

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface Order {
  id: string;
  institution_id: string;
  patient_id: string | null;
  created_by_user_id: string | null;
  created_by_worker_id: string | null;
  status: OrderStatus;
  is_recurring: boolean;
  scheduled_date: Date | null;
  is_confirmed: boolean;
  approved_by_admin_id: string | null;
  approved_at: Date | null;
  shipped_at: Date | null;
  total_amount: number;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_per_unit: number; // Price at time of order
  subtotal: number;
  created_at: Date;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

/**
 * Extended Order interface with related data for frontend
 */
export interface OrderWithDetails extends OrderWithItems {
  institution_name?: string;
  patient_name?: string;
  patient_address?: string;
  created_by_user_email?: string;
  created_by_worker_username?: string;
}

/**
 * Create new order with items
 */
export const createOrder = async (data: {
  institution_id: string;
  patient_id?: string;
  created_by_user_id?: string;
  created_by_worker_id?: string;
  items: Array<{ product_id: string; quantity: number; price_per_unit: number }>;
  scheduled_date?: Date;
  is_recurring?: boolean;
}): Promise<OrderWithItems> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Calculate total amount
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.quantity * item.price_per_unit,
      0
    );

    console.log('📅 Repository - scheduled_date received:', data.scheduled_date);
    console.log('📅 Repository - scheduled_date type:', typeof data.scheduled_date);
    console.log('📅 Repository - scheduled_date value to insert:', data.scheduled_date || null);

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (
        institution_id, patient_id, created_by_user_id, created_by_worker_id,
        status, is_recurring, scheduled_date, is_confirmed, total_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        data.institution_id,
        data.patient_id || null,
        data.created_by_user_id || null,
        data.created_by_worker_id || null,
        OrderStatus.PENDING,
        data.is_recurring || false,
        data.scheduled_date || null,
        false,
        totalAmount,
      ]
    );

    console.log('📅 Repository - Order created, scheduled_date in DB:', orderResult.rows[0].scheduled_date);

    const order = orderResult.rows[0];

    // Create order items
    const items: OrderItem[] = [];
    for (const item of data.items) {
      const subtotal = item.quantity * item.price_per_unit;
      const itemResult = await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, subtotal)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [order.id, item.product_id, item.quantity, item.price_per_unit, subtotal]
      );
      items.push(itemResult.rows[0]);
    }

    await client.query('COMMIT');

    return {
      ...order,
      items,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Find order by ID (with items)
 */
export const findOrderById = async (orderId: string): Promise<OrderWithItems | null> => {
  const orderResult = await pool.query(`SELECT * FROM orders WHERE id = $1`, [orderId]);

  if (orderResult.rows.length === 0) {
    return null;
  }

  const order = orderResult.rows[0];

  // Get order items
  const itemsResult = await pool.query(`SELECT * FROM order_items WHERE order_id = $1`, [orderId]);

  return {
    ...order,
    items: itemsResult.rows,
  };
};

/**
 * Get all orders (for admin_application) with details
 */
export const getAllOrdersWithDetails = async (filters?: {
  status?: OrderStatus;
  institution_id?: string;
}): Promise<OrderWithDetails[]> => {
  let query = `
    SELECT
      o.*,
      i.name as institution_name,
      u.email as created_by_user_email,
      w.username as created_by_worker_username
    FROM orders o
    LEFT JOIN institutions i ON o.institution_id = i.id
    LEFT JOIN users u ON o.created_by_user_id = u.id
    LEFT JOIN workers w ON o.created_by_worker_id = w.id
    WHERE 1=1
  `;
  const values: any[] = [];
  let paramCount = 1;

  if (filters?.status) {
    query += ` AND o.status = $${paramCount}`;
    values.push(filters.status);
    paramCount++;
  }

  if (filters?.institution_id) {
    query += ` AND o.institution_id = $${paramCount}`;
    values.push(filters.institution_id);
    paramCount++;
  }

  query += ` ORDER BY o.created_at DESC`;

  const orderResult = await pool.query(query, values);

  // Get items and patient info for all orders
  const orders: OrderWithDetails[] = await Promise.all(
    orderResult.rows.map(async (order) => {
      const itemsResult = await pool.query(`SELECT * FROM order_items WHERE order_id = $1`, [
        order.id,
      ]);

      let patient_name = null;
      let patient_address = null;
      if (order.patient_id) {
        const patientResult = await pool.query(
          `SELECT first_name, last_name, address FROM patients WHERE id = $1`,
          [order.patient_id]
        );
        if (patientResult.rows.length > 0) {
          const p = patientResult.rows[0];
          // Decrypt patient data
          const firstName = await decrypt(p.first_name);
          const lastName = await decrypt(p.last_name);
          patient_name = `${firstName} ${lastName}`;

          if (p.address) {
            patient_address = await decrypt(p.address);
          }
        }
      }

      return {
        ...order,
        items: itemsResult.rows,
        patient_name,
        patient_address,
      };
    })
  );

  return orders;
};

/**
 * Get orders for institution (with optional filters)
 */
export const getOrdersByInstitution = async (
  institutionId: string,
  filters?: {
    status?: OrderStatus;
    patient_id?: string;
    is_automatic?: boolean;
  }
): Promise<OrderWithItems[]> => {
  let query = `SELECT * FROM orders WHERE institution_id = $1`;
  const values: any[] = [institutionId];
  let paramCount = 2;

  if (filters?.status) {
    query += ` AND status = $${paramCount}`;
    values.push(filters.status);
    paramCount++;
  }

  if (filters?.patient_id) {
    query += ` AND patient_id = $${paramCount}`;
    values.push(filters.patient_id);
    paramCount++;
  }

  if (filters?.is_automatic !== undefined) {
    query += ` AND is_automatic = $${paramCount}`;
    values.push(filters.is_automatic);
    paramCount++;
  }

  query += ` ORDER BY created_at DESC`;

  const orderResult = await pool.query(query, values);

  // Get items for all orders
  const orders: OrderWithItems[] = await Promise.all(
    orderResult.rows.map(async (order) => {
      const itemsResult = await pool.query(`SELECT * FROM order_items WHERE order_id = $1`, [
        order.id,
      ]);

      return {
        ...order,
        items: itemsResult.rows,
      };
    })
  );

  return orders;
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<Order> => {
  const timestampField = status === OrderStatus.SHIPPED ? 'shipped_at' : null;

  let query = `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP`;

  if (timestampField) {
    query += `, ${timestampField} = CURRENT_TIMESTAMP`;
  }

  query += ` WHERE id = $2 RETURNING *`;

  const result = await pool.query(query, [status, orderId]);

  return result.rows[0];
};

/**
 * Mark order as confirmed (zaprimljeno)
 * Also updates status to 'confirmed'
 */
export const confirmOrder = async (
  orderId: string,
  adminId: string
): Promise<Order> => {
  const result = await pool.query(
    `UPDATE orders
     SET is_confirmed = true,
         status = $3,
         approved_by_admin_id = $1,
         approved_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [adminId, orderId, OrderStatus.CONFIRMED]
  );

  return result.rows[0];
};

/**
 * Get order items
 */
export const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  const result = await pool.query(`SELECT * FROM order_items WHERE order_id = $1`, [orderId]);

  return result.rows;
};

/**
 * Get order statistics for institution
 */
export const getOrderStats = async (
  institutionId: string
): Promise<{
  total_orders: number;
  pending_orders: number;
  confirmed_orders: number;
  total_amount: number;
}> => {
  const result = await pool.query(
    `SELECT
      COUNT(*) as total_orders,
      COUNT(*) FILTER (WHERE status = $2) as pending_orders,
      COUNT(*) FILTER (WHERE is_confirmed = true) as confirmed_orders,
      COALESCE(SUM(total_amount), 0) as total_amount
    FROM orders
    WHERE institution_id = $1`,
    [institutionId, OrderStatus.PENDING]
  );

  return result.rows[0];
};

/**
 * Delete order (cascade deletes order_items)
 */
export const deleteOrder = async (orderId: string): Promise<void> => {
  await pool.query(`DELETE FROM orders WHERE id = $1`, [orderId]);
};
