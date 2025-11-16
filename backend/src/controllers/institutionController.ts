import { Request, Response } from 'express';
import * as institutionRepo from '../repositories/institutionRepository';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

/**
 * Institution Controller
 * Admin Application only - manage institutions/customers
 */

/**
 * Get all institutions (admin_application only)
 */
export const getAllInstitutions = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const userRole = authReq.user?.role;

    // Only admin_application can access this
    if (userRole !== 'admin_application') {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    const filters: {
      isActive?: boolean;
      isVerified?: boolean;
    } = {
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      isVerified: req.query.isVerified === 'true' ? true : req.query.isVerified === 'false' ? false : undefined,
    };

    const institutions = await institutionRepo.getAllInstitutions(filters);

    res.status(200).json({
      success: true,
      data: institutions,
      meta: { count: institutions.length },
    });
  }
);

/**
 * Get institution by ID (admin_application only)
 */
export const getInstitutionById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const userRole = authReq.user?.role;
    const { id } = req.params;

    // Only admin_application can access this
    if (userRole !== 'admin_application') {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    const institution = await institutionRepo.findInstitutionById(id);

    if (!institution) {
      res.status(404).json({ success: false, error: 'Institution nicht gefunden' });
      return;
    }

    res.status(200).json({ success: true, data: institution });
  }
);

/**
 * Verify institution (admin_application only)
 */
export const verifyInstitution = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const userRole = authReq.user?.role;
    const { id } = req.params;

    // Only admin_application can verify institutions
    if (userRole !== 'admin_application') {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    await institutionRepo.verifyInstitution(id);

    res.status(200).json({
      success: true,
      message: 'Institution erfolgreich verifiziert',
    });
  }
);

/**
 * Deactivate institution (admin_application only)
 */
export const deactivateInstitution = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const userRole = authReq.user?.role;
    const { id } = req.params;

    // Only admin_application can deactivate institutions
    if (userRole !== 'admin_application') {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    await institutionRepo.deactivateInstitution(id);

    res.status(200).json({
      success: true,
      message: 'Institution erfolgreich deaktiviert',
    });
  }
);

/**
 * Reactivate institution (admin_application only)
 */
export const reactivateInstitution = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const userRole = authReq.user?.role;
    const { id } = req.params;

    // Only admin_application can reactivate institutions
    if (userRole !== 'admin_application') {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    await institutionRepo.reactivateInstitution(id);

    res.status(200).json({
      success: true,
      message: 'Institution erfolgreich reaktiviert',
    });
  }
);

/**
 * Delete institution permanently (admin_application only)
 * GDPR compliance - complete data removal
 */
export const deleteInstitution = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const userRole = authReq.user?.role;
    const { id } = req.params;

    // Only admin_application can delete institutions
    if (userRole !== 'admin_application') {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    await institutionRepo.deleteInstitution(id);

    res.status(200).json({
      success: true,
      message: 'Institution erfolgreich gelöscht',
    });
  }
);
