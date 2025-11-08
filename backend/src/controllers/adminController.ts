import { Request, Response } from 'express';
import * as adminService from '../services/adminService';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

/**
 * Admin Controller
 * Endpoints for admin_application dashboard and statistics
 */

/**
 * GET /api/v1/admin/statistics
 * Get comprehensive dashboard statistics
 */
export const getDashboardStatistics = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const userRole = authReq.user?.role;

    // Only admin_application can access
    if (userRole !== 'admin_application') {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    const stats = await adminService.getDashboardStatistics();

    res.status(200).json({
      success: true,
      data: stats,
    });
  }
);

/**
 * GET /api/v1/admin/statistics/institutions
 * Get per-institution statistics (orders, revenue, patients)
 */
export const getInstitutionStatistics = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const userRole = authReq.user?.role;

    // Only admin_application can access
    if (userRole !== 'admin_application') {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    const stats = await adminService.getInstitutionStatistics();

    res.status(200).json({
      success: true,
      data: stats,
      meta: {
        count: stats.length,
      },
    });
  }
);

/**
 * GET /api/v1/admin/statistics/products
 * Get product popularity statistics
 */
export const getProductStatistics = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const userRole = authReq.user?.role;

    // Only admin_application can access
    if (userRole !== 'admin_application') {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    const stats = await adminService.getProductStatistics();

    res.status(200).json({
      success: true,
      data: stats,
      meta: {
        count: stats.length,
      },
    });
  }
);

/**
 * GET /api/v1/admin/patients-by-institution
 * Get patients grouped by institution (for CustomersPage)
 */
export const getPatientsByInstitution = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const userRole = authReq.user?.role;

    // Only admin_application can access
    if (userRole !== 'admin_application') {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    const data = await adminService.getPatientsByInstitution();

    res.status(200).json({
      success: true,
      data,
      meta: {
        count: data.length,
      },
    });
  }
);
