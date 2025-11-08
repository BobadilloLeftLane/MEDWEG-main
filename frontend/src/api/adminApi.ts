import apiClient from './client';

/**
 * Admin API
 * API calls for admin_application dashboard and statistics
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
  const response = await apiClient.get('/admin/statistics');
  return response.data.data;
};

/**
 * Get per-institution statistics
 */
export const getInstitutionStatistics = async (): Promise<InstitutionStatistics[]> => {
  const response = await apiClient.get('/admin/statistics/institutions');
  return response.data.data;
};

/**
 * Get product popularity statistics
 */
export const getProductStatistics = async (): Promise<ProductStatistics[]> => {
  const response = await apiClient.get('/admin/statistics/products');
  return response.data.data;
};

/**
 * Get patients grouped by institution
 */
export const getPatientsByInstitution = async (): Promise<PatientsByInstitution[]> => {
  const response = await apiClient.get('/admin/patients-by-institution');
  return response.data.data;
};
