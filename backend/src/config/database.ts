import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * PostgreSQL Database Configuration
 * Connection pool za MEDWEG bazu
 */
const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'MEDWEG',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,

  // Connection pool settings
  max: 20, // Maximum broj konekcija
  idleTimeoutMillis: 30000, // 30s idle timeout
  connectionTimeoutMillis: 10000, // 10s connection timeout (increased from 2s)
  statement_timeout: 30000, // 30s statement timeout
};

// Kreiraj connection pool
export const pool = new Pool(poolConfig);

/**
 * Test database connection
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();

    console.log('✅ Database connected successfully at:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

/**
 * Execute query with error handling
 */
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    // Log query u development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Query executed:', { text, duration, rows: result.rowCount });
    }

    return result;
  } catch (error) {
    console.error('❌ Query error:', { text, error });
    throw error;
  }
};

/**
 * Close database connection pool
 */
export const closePool = async (): Promise<void> => {
  await pool.end();
  console.log('🔌 Database pool closed');
};

// Handle process termination
process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});
