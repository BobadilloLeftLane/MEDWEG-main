import * as adminRepo from '../repositories/adminRepository';
import logger from '../utils/logger';

/**
 * Admin Service
 * Business logic for admin_application dashboard and statistics
 */

/**
 * Get comprehensive dashboard statistics
 */
export const getDashboardStatistics = async (): Promise<adminRepo.DashboardStatistics> => {
  logger.info('Fetching admin dashboard statistics');

  const stats = await adminRepo.getDashboardStatistics();

  logger.info('Dashboard statistics fetched successfully', {
    institutions: stats.institutions.total,
    users: stats.users.total,
    orders: stats.orders.total,
    revenue: stats.revenue.total,
  });

  return stats;
};

/**
 * Get per-institution statistics
 */
export const getInstitutionStatistics = async (): Promise<adminRepo.InstitutionStatistics[]> => {
  logger.info('Fetching institution statistics');

  const stats = await adminRepo.getInstitutionStatistics();

  logger.info('Institution statistics fetched', {
    count: stats.length,
  });

  return stats;
};

/**
 * Get product popularity statistics
 */
export const getProductStatistics = async (): Promise<adminRepo.ProductStatistics[]> => {
  try {
    logger.info('Fetching product statistics');

    const stats = await adminRepo.getProductStatistics();

    logger.info('Product statistics fetched', {
      count: stats.length,
    });

    return stats;
  } catch (error) {
    logger.error('Error fetching product statistics:', error);
    throw error;
  }
};

/**
 * Get patients grouped by institution
 */
export const getPatientsByInstitution = async (): Promise<adminRepo.PatientsByInstitution[]> => {
  logger.info('Fetching patients by institution');

  const data = await adminRepo.getPatientsByInstitution();

  logger.info('Patients by institution fetched', {
    institutions: data.length,
    totalPatients: data.reduce((sum, inst) => sum + inst.patient_count, 0),
  });

  return data;
};
