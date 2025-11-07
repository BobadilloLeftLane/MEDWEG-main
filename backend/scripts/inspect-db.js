const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'MEDWEG',
  user: 'postgres',
  password: 'Baba1994'
});

const tables = [
  'institutions',
  'patients',
  'workers',
  'products',
  'orders',
  'order_items',
  'invoices',
  'audit_logs',
  'push_subscriptions'
];

async function inspectDatabase() {
  try {
    for (const tableName of tables) {
      const result = await pool.query(`
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      console.log(`\n${'='.repeat(60)}`);
      console.log(`TABLE: ${tableName.toUpperCase()}`);
      console.log('='.repeat(60));
      console.log(JSON.stringify(result.rows, null, 2));
    }

    // Get ENUM types
    console.log(`\n${'='.repeat(60)}`);
    console.log('ENUM TYPES');
    console.log('='.repeat(60));
    const enumResult = await pool.query(`
      SELECT t.typname, string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY t.typname
      ORDER BY t.typname
    `);
    console.log(JSON.stringify(enumResult.rows, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
}

inspectDatabase();
