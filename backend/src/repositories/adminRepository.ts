import { pool } from '../config/database';
import { decrypt } from '../utils/encryption';

/**
 * Admin Repository
 * Database queries for admin_application dashboard statistics
 */

export interface DashboardStatistics {
  institutions: {
    total: number;
    new_this_week: number;
    new_this_month: number;
    verified: number;
    active: number;
  };
  users: {
    total: number;
    new_this_week: number;
    new_this_month: number;
    by_role: {
      admin_application: number;
      admin_institution: number;
      worker: number;
    };
  };
  orders: {
    total: number;
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    this_month: number;
    last_month: number;
    percent_change: number;
  };
}

export interface InstitutionStatistics {
  institution_id: string;
  institution_name: string;
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  confirmed_orders: number;
  patient_count: number;
}

export interface ProductStatistics {
  product_id: string;
  product_name: string;
  type: string;
  times_ordered: number;
  total_quantity: number;
  total_revenue: number;
}

export interface PatientsByInstitution {
  institution_id: string;
  institution_name: string;
  patient_count: number;
  patients: Array<{
    id: string;
    first_name: string;
    last_name: string;
    address: string;
    date_of_birth: string;
  }>;
}

/**
 * Get comprehensive dashboard statistics
 */
export const getDashboardStatistics = async (): Promise<DashboardStatistics> => {
  // Institutions statistics
  const institutionsResult = await pool.query(`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_this_week,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_this_month,
      COUNT(*) FILTER (WHERE is_verified = true) as verified,
      COUNT(*) FILTER (WHERE is_active = true) as active
    FROM institutions
  `);

  // Users statistics
  const usersResult = await pool.query(`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_this_week,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_this_month,
      COUNT(*) FILTER (WHERE role = 'admin_application') as admin_application,
      COUNT(*) FILTER (WHERE role = 'admin_institution') as admin_institution
    FROM users
  `);

  // Workers count
  const workersResult = await pool.query(`
    SELECT COUNT(*) as worker_count FROM workers
  `);

  // Orders statistics
  const ordersResult = await pool.query(`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
      COUNT(*) FILTER (WHERE status = 'shipped') as shipped,
      COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
      COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
    FROM orders
  `);

  // Revenue statistics
  const revenueResult = await pool.query(`
    SELECT
      COALESCE(SUM(total_amount), 0) as total,
      COALESCE(SUM(total_amount) FILTER (WHERE created_at >= DATE_TRUNC('month', NOW())), 0) as this_month,
      COALESCE(SUM(total_amount) FILTER (WHERE created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month') AND created_at < DATE_TRUNC('month', NOW())), 0) as last_month
    FROM orders
    WHERE status != 'cancelled'
  `);

  const revenue = revenueResult.rows[0];
  const percentChange =
    revenue.last_month > 0
      ? ((revenue.this_month - revenue.last_month) / revenue.last_month) * 100
      : 0;

  return {
    institutions: {
      total: parseInt(institutionsResult.rows[0].total),
      new_this_week: parseInt(institutionsResult.rows[0].new_this_week),
      new_this_month: parseInt(institutionsResult.rows[0].new_this_month),
      verified: parseInt(institutionsResult.rows[0].verified),
      active: parseInt(institutionsResult.rows[0].active),
    },
    users: {
      total:
        parseInt(usersResult.rows[0].total) +
        parseInt(workersResult.rows[0].worker_count),
      new_this_week: parseInt(usersResult.rows[0].new_this_week),
      new_this_month: parseInt(usersResult.rows[0].new_this_month),
      by_role: {
        admin_application: parseInt(usersResult.rows[0].admin_application),
        admin_institution: parseInt(usersResult.rows[0].admin_institution),
        worker: parseInt(workersResult.rows[0].worker_count),
      },
    },
    orders: {
      total: parseInt(ordersResult.rows[0].total),
      pending: parseInt(ordersResult.rows[0].pending),
      confirmed: parseInt(ordersResult.rows[0].confirmed),
      shipped: parseInt(ordersResult.rows[0].shipped),
      delivered: parseInt(ordersResult.rows[0].delivered),
      cancelled: parseInt(ordersResult.rows[0].cancelled),
    },
    revenue: {
      total: parseFloat(revenue.total),
      this_month: parseFloat(revenue.this_month),
      last_month: parseFloat(revenue.last_month),
      percent_change: Math.round(percentChange * 10) / 10, // Round to 1 decimal
    },
  };
};

/**
 * Get per-institution statistics
 */
export const getInstitutionStatistics = async (): Promise<InstitutionStatistics[]> => {
  const result = await pool.query(`
    SELECT
      i.id as institution_id,
      i.name as institution_name,
      COUNT(DISTINCT o.id) as total_orders,
      COALESCE(SUM(o.total_amount), 0) as total_revenue,
      COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'pending') as pending_orders,
      COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'confirmed') as confirmed_orders,
      COUNT(DISTINCT p.id) as patient_count
    FROM institutions i
    LEFT JOIN orders o ON o.institution_id = i.id
    LEFT JOIN patients p ON p.institution_id = i.id AND p.is_active = true
    GROUP BY i.id, i.name
    ORDER BY total_revenue DESC
  `);

  return result.rows.map((row: any) => ({
    institution_id: row.institution_id,
    institution_name: row.institution_name,
    total_orders: parseInt(row.total_orders),
    total_revenue: parseFloat(row.total_revenue),
    pending_orders: parseInt(row.pending_orders),
    confirmed_orders: parseInt(row.confirmed_orders),
    patient_count: parseInt(row.patient_count),
  }));
};

/**
 * Get product popularity statistics
 */
export const getProductStatistics = async (): Promise<ProductStatistics[]> => {
  const result = await pool.query(`
    SELECT
      p.id as product_id,
      p.name_de as product_name,
      p.type,
      COUNT(DISTINCT CASE WHEN o.status != 'cancelled' THEN oi.order_id END) as times_ordered,
      COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN oi.quantity ELSE 0 END), 0) as total_quantity,
      COALESCE(SUM(CASE WHEN o.status != 'cancelled' THEN oi.subtotal ELSE 0 END), 0) as total_revenue
    FROM products p
    LEFT JOIN order_items oi ON oi.product_id = p.id
    LEFT JOIN orders o ON o.id = oi.order_id
    WHERE p.is_available = true
    GROUP BY p.id, p.name_de, p.type
    ORDER BY times_ordered DESC, total_quantity DESC
  `);

  return result.rows.map((row: any) => ({
    product_id: row.product_id,
    product_name: row.product_name,
    type: row.type,
    times_ordered: parseInt(row.times_ordered) || 0,
    total_quantity: parseInt(row.total_quantity) || 0,
    total_revenue: parseFloat(row.total_revenue) || 0,
  }));
};

/**
 * Get patients grouped by institution (with decrypted data)
 */
export const getPatientsByInstitution = async (): Promise<PatientsByInstitution[]> => {
  const result = await pool.query(`
    SELECT
      i.id as institution_id,
      i.name as institution_name,
      COUNT(p.id) as patient_count,
      json_agg(
        json_build_object(
          'id', p.id,
          'first_name', p.first_name,
          'last_name', p.last_name,
          'address', p.address,
          'date_of_birth', p.date_of_birth
        ) ORDER BY p.last_name, p.first_name
      ) FILTER (WHERE p.id IS NOT NULL) as patients
    FROM institutions i
    LEFT JOIN patients p ON p.institution_id = i.id AND p.is_active = true
    GROUP BY i.id, i.name
    ORDER BY i.name
  `);

  // Decrypt patient data
  const institutionsWithPatients = await Promise.all(
    result.rows.map(async (row: any) => {
      const patients = row.patients || [];

      const decryptedPatients = await Promise.all(
        patients.map(async (patient: any) => ({
          id: patient.id,
          first_name: await decrypt(patient.first_name),
          last_name: await decrypt(patient.last_name),
          address: patient.address ? await decrypt(patient.address) : '',
          date_of_birth: patient.date_of_birth,
        }))
      );

      return {
        institution_id: row.institution_id,
        institution_name: row.institution_name,
        patient_count: parseInt(row.patient_count),
        patients: decryptedPatients,
      };
    })
  );

  return institutionsWithPatients;
};
