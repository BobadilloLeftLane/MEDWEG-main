import { pool } from '../config/database';

/**
 * Fix prices on existing recurring orders
 * Updates order_items with correct prices from products table
 */
async function fixRecurringOrderPrices() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log(' Fixing recurring order prices...\n');

    // Get all recurring orders
    const ordersResult = await client.query(
      `SELECT id, order_number FROM orders WHERE is_recurring = true`
    );

    console.log(`Found ${ordersResult.rows.length} recurring orders to fix\n`);

    for (const order of ordersResult.rows) {
      console.log(`Processing Order #${order.order_number}...`);

      // Update each order item with correct price from products
      const updateResult = await client.query(
        `UPDATE order_items oi
        SET
          price_per_unit = p.price_per_unit,
          subtotal = oi.quantity * p.price_per_unit
        FROM products p
        WHERE oi.product_id = p.id
          AND oi.order_id = $1
        RETURNING oi.id, oi.quantity, oi.price_per_unit, oi.subtotal`,
        [order.id]
      );

      console.log(`  Updated ${updateResult.rows.length} items`);

      // Recalculate total_amount for the order
      const totalResult = await client.query(
        `UPDATE orders
        SET total_amount = (
          SELECT COALESCE(SUM(subtotal), 0)
          FROM order_items
          WHERE order_id = $1
        )
        WHERE id = $1
        RETURNING total_amount`,
        [order.id]
      );

      console.log(`  New total: €${Number(totalResult.rows[0].total_amount).toFixed(2)}\n`);
    }

    await client.query('COMMIT');
    console.log(' All recurring order prices fixed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(' Error fixing prices:', error);
    throw error;
  } finally {
    client.release();
    process.exit(0);
  }
}

// Run the script
fixRecurringOrderPrices();
