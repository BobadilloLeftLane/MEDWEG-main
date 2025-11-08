import { pool } from '../config/database';

/**
 * Fix Product Images Script
 * Updates all product image URLs to match their type
 */

const fixProductImages = async () => {
  const client = await pool.connect();

  try {
    console.log('🔧 Fixing product images...\n');

    await client.query('BEGIN');

    // Update gloves products
    const glovesResult = await client.query(
      `UPDATE products
       SET image_url = '/images/products/ppe-gloves@2x.png'
       WHERE type = 'gloves'
       RETURNING id, name_de`
    );
    console.log(`✅ Updated ${glovesResult.rowCount} gloves products`);

    // Update disinfectant liquid products
    const liquidResult = await client.query(
      `UPDATE products
       SET image_url = '/images/products/ppe-sanitizer@2x.png'
       WHERE type = 'disinfectant_liquid'
       RETURNING id, name_de`
    );
    console.log(`✅ Updated ${liquidResult.rowCount} disinfectant liquid products`);

    // Update disinfectant wipes products
    const wipesResult = await client.query(
      `UPDATE products
       SET image_url = '/images/products/disinfecting-wipes@2x.png'
       WHERE type = 'disinfectant_wipes'
       RETURNING id, name_de`
    );
    console.log(`✅ Updated ${wipesResult.rowCount} disinfectant wipes products`);

    await client.query('COMMIT');

    console.log('\n📊 Current products:');
    const productsResult = await client.query(
      `SELECT id, name_de, type, image_url
       FROM products
       ORDER BY type, name_de`
    );

    for (const product of productsResult.rows) {
      console.log(`\n  ${product.name_de}`);
      console.log(`  Type: ${product.type}`);
      console.log(`  Image: ${product.image_url}`);
    }

    console.log(`\n✨ Successfully fixed ${(glovesResult.rowCount || 0) + (liquidResult.rowCount || 0) + (wipesResult.rowCount || 0)} products!`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error fixing product images:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run the script
fixProductImages()
  .then(() => {
    console.log('\n✅ Product images fixed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to fix product images:', error);
    process.exit(1);
  });
