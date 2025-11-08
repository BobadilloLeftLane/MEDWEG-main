import { Request, Response } from 'express';
import * as patientService from '../services/patientService';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

/**
 * Patient Controller
 * HTTP handlers za patient endpoints
 */

/**
 * POST /api/v1/patients
 * Create new patient
 */
export const createPatient = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;

  // Get institution_id from authenticated user
  const institutionId = authReq.user?.institutionId;

  if (!institutionId) {
    res.status(403).json({
      success: false,
      error: 'Keine Institution zugeordnet',
    });
    return;
  }

  // Generate unique_code if not provided
  let uniqueCode = req.body.unique_code;
  if (!uniqueCode) {
    // Generate unique code: INST-{timestamp}-{random}
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    uniqueCode = `PAT-${timestamp}-${random}`;
  }

  const data: patientService.CreatePatientDto = {
    ...req.body,
    institution_id: institutionId, // Override with user's institution
    unique_code: uniqueCode,
  };

  const patient = await patientService.createPatient(data, institutionId);

  res.status(201).json({
    success: true,
    message: 'Patient erfolgreich erstellt',
    data: patient,
  });
});

/**
 * GET /api/v1/patients/:id
 * Get patient by ID
 */
export const getPatientById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { id } = req.params;

  const institutionId = authReq.user?.institutionId;

  if (!institutionId) {
    res.status(403).json({
      success: false,
      error: 'Keine Institution zugeordnet',
    });
    return;
  }

  const patient = await patientService.getPatientById(id, institutionId);

  res.status(200).json({
    success: true,
    data: patient,
  });
});

/**
 * GET /api/v1/patients
 * Get all patients for institution
 * For workers: returns only their assigned patient
 */
export const getPatients = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;

  const institutionId = authReq.user?.institutionId;
  const userRole = authReq.user?.role;
  const patientId = authReq.user?.patientId; // Worker's assigned patient

  if (!institutionId) {
    res.status(403).json({
      success: false,
      error: 'Keine Institution zugeordnet',
    });
    return;
  }

  // Query parameter: ?active_only=true/false
  const activeOnly = req.query.active_only !== 'false'; // Default true

  // If user is a worker, return only their assigned patient
  if (userRole === 'worker' && patientId) {
    const patient = await patientService.getPatientById(patientId, institutionId);
    res.status(200).json({
      success: true,
      data: [patient], // Return as array for consistency
      meta: {
        count: 1,
        active_only: activeOnly,
        worker_patient: true,
      },
    });
    return;
  }

  // For admins: return all patients for institution
  const patients = await patientService.getPatientsByInstitution(institutionId, activeOnly);

  res.status(200).json({
    success: true,
    data: patients,
    meta: {
      count: patients.length,
      active_only: activeOnly,
    },
  });
});

/**
 * PUT /api/v1/patients/:id
 * Update patient
 */
export const updatePatient = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { id } = req.params;

  const institutionId = authReq.user?.institutionId;

  if (!institutionId) {
    res.status(403).json({
      success: false,
      error: 'Keine Institution zugeordnet',
    });
    return;
  }

  const data: patientService.UpdatePatientDto = req.body;

  const patient = await patientService.updatePatient(id, data, institutionId);

  res.status(200).json({
    success: true,
    message: 'Patient erfolgreich aktualisiert',
    data: patient,
  });
});

/**
 * DELETE /api/v1/patients/:id/deactivate
 * Deactivate patient (soft delete)
 */
export const deactivatePatient = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { id } = req.params;

  const institutionId = authReq.user?.institutionId;

  if (!institutionId) {
    res.status(403).json({
      success: false,
      error: 'Keine Institution zugeordnet',
    });
    return;
  }

  const result = await patientService.deactivatePatient(id, institutionId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

/**
 * POST /api/v1/patients/:id/reactivate
 * Reactivate patient
 */
export const reactivatePatient = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { id } = req.params;

  const institutionId = authReq.user?.institutionId;

  if (!institutionId) {
    res.status(403).json({
      success: false,
      error: 'Keine Institution zugeordnet',
    });
    return;
  }

  const result = await patientService.reactivatePatient(id, institutionId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

/**
 * DELETE /api/v1/patients/:id
 * Delete patient permanently (GDPR)
 */
export const deletePatient = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { id } = req.params;

  const institutionId = authReq.user?.institutionId;

  if (!institutionId) {
    res.status(403).json({
      success: false,
      error: 'Keine Institution zugeordnet',
    });
    return;
  }

  const result = await patientService.deletePatient(id, institutionId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});
