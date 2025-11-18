import { pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

/**
 * Seed Script: Create Orders for All Patients
 * Each patient gets an order with:
 * - At least 3 cartons of each glove type
 * - At least 2 of each disinfectant liquid
 * - At least 2 of each disinfectant wipes
 */

const seedOrders = async () => {
  const client = await pool.connect();

  try {
    console.log(' Starting order seeding...\n');

    await client.query('BEGIN');

    // Get all products by type
    const productsResult = await client.query(
      'SELECT id, name_de, type, price_per_unit FROM products ORDER BY type, name_de'
    );

    const products = productsResult.rows;
    const gloves = products.filter(p => p.type === 'gloves');
    const liquids = products.filter(p => p.type === 'disinfectant_liquid');
    const wipes = products.filter(p => p.type === 'disinfectant_wipes');

    console.log(` Found products:`);
    console.log(`   - ${gloves.length} glove products`);
    console.log(`   - ${liquids.length} disinfectant liquid products`);
    console.log(`   - ${wipes.length} disinfectant wipes products\n`);

    // Get all institutions
    const institutionsResult = await client.query(
      'SELECT id, name FROM institutions ORDER BY created_at'
    );
    const institutions = institutionsResult.rows;

    console.log(` Found ${institutions.length} institutions\n`);

    let totalOrders = 0;
    let totalItems = 0;

    for (const institution of institutions) {
      // Get patients for this institution
      const patientsResult = await client.query(
        'SELECT id FROM patients WHERE institution_id = $1 AND is_active = true',
        [institution.id]
      );

      const patients = patientsResult.rows;

      if (patients.length === 0) {
        console.log(`    ${institution.name}: No patients, skipping`);
        continue;
      }

      let institutionOrders = 0;

      for (const patient of patients) {
        try {
          // Create order
          const orderId = uuidv4();

          // Get next order number
          const orderNumberResult = await client.query(
            'SELECT COALESCE(MAX(order_number), 0) + 1 as next_number FROM orders'
          );
          const orderNumber = orderNumberResult.rows[0].next_number;

          const orderItems: Array<{
            product_id: string;
            quantity: number;
            price_per_unit: number;
            subtotal: number;
          }> = [];

          // Add gloves (3-5 cartons of each type)
          for (const glove of gloves) {
            const quantity = Math.floor(Math.random() * 3) + 3; // 3-5 cartons
            const pricePerUnit = Number(glove.price_per_unit);
            const subtotal = quantity * pricePerUnit;

            orderItems.push({
              product_id: glove.id,
              quantity,
              price_per_unit: pricePerUnit,
              subtotal,
            });
          }

          // Add disinfectant liquids (2-4 bottles of each)
          for (const liquid of liquids) {
            const quantity = Math.floor(Math.random() * 3) + 2; // 2-4 bottles
            const pricePerUnit = Number(liquid.price_per_unit);
            const subtotal = quantity * pricePerUnit;

            orderItems.push({
              product_id: liquid.id,
              quantity,
              price_per_unit: pricePerUnit,
              subtotal,
            });
          }

          // Add disinfectant wipes (2-4 packs of each)
          for (const wipe of wipes) {
            const quantity = Math.floor(Math.random() * 3) + 2; // 2-4 packs
            const pricePerUnit = Number(wipe.price_per_unit);
            const subtotal = quantity * pricePerUnit;

            orderItems.push({
              product_id: wipe.id,
              quantity,
              price_per_unit: pricePerUnit,
              subtotal,
            });
          }

          // Calculate total
          const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

          // Generate random scheduled date (1-30 days from now)
          const daysAhead = Math.floor(Math.random() * 30) + 1;
          const scheduledDate = new Date();
          scheduledDate.setDate(scheduledDate.getDate() + daysAhead);

          // Insert order
          await client.query(
            `INSERT INTO orders (
              id,
              order_number,
              institution_id,
              patient_id,
              status,
              total_amount,
              scheduled_date,
              created_at,
              updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [
              orderId,
              orderNumber,
              institution.id,
              patient.id,
              'pending',
              totalAmount,
              scheduledDate,
            ]
          );

          // Insert order items
          for (const item of orderItems) {
            await client.query(
              `INSERT INTO order_items (
                id,
                order_id,
                product_id,
                quantity,
                price_per_unit,
                subtotal
              ) VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                uuidv4(),
                orderId,
                item.product_id,
                item.quantity,
                item.price_per_unit,
                item.subtotal,
              ]
            );
          }

          institutionOrders++;
          totalOrders++;
          totalItems += orderItems.length;

        } catch (error: any) {
          console.error(`   Error creating order for patient in ${institution.name}:`, error.message);
        }
      }

      console.log(`   ${institution.name}: ${institutionOrders} orders created`);
    }

    await client.query('COMMIT');

    console.log(`\n Successfully created ${totalOrders} orders!`);
    console.log(` Total order items: ${totalItems}`);
    console.log(` Average items per order: ${Math.round(totalItems / totalOrders)}`);

    // Show some statistics
    const statsResult = await client.query(
      `SELECT
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_order_value,
        MIN(total_amount) as min_order,
        MAX(total_amount) as max_order
       FROM orders`
    );

    const stats = statsResult.rows[0];
    console.log(`\n Order Statistics:`);
    console.log(`   Total Orders: ${stats.total_orders}`);
    console.log(`   Total Revenue: €${Number(stats.total_revenue).toFixed(2)}`);
    console.log(`   Average Order Value: €${Number(stats.avg_order_value).toFixed(2)}`);
    console.log(`   Min Order: €${Number(stats.min_order).toFixed(2)}`);
    console.log(`   Max Order: €${Number(stats.max_order).toFixed(2)}`);

    // Show example orders
    console.log('\n Example orders:');
    const examplesResult = await client.query(
      `SELECT
        o.order_number,
        i.name as institution_name,
        o.total_amount,
        COUNT(oi.id) as item_count
       FROM orders o
       JOIN institutions i ON o.institution_id = i.id
       LEFT JOIN order_items oi ON o.id = oi.id
       GROUP BY o.id, o.order_number, i.name, o.total_amount
       ORDER BY o.created_at DESC
       LIMIT 5`
    );

    for (const order of examplesResult.rows) {
      console.log(`\n  Order #${order.order_number}`);
      console.log(`  Institution: ${order.institution_name}`);
      console.log(`  Items: ${order.item_count}`);
      console.log(`  Total: €${Number(order.total_amount).toFixed(2)}`);
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(' Error seeding orders:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run the script
seedOrders()
  .then(() => {
    console.log('\n Order seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error(' Order seeding failed:', error);
    process.exit(1);
  });
