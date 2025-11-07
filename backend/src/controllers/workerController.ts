import { Request, Response } from 'express';
import * as workerService from '../services/workerService';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';

/**
 * Worker Controller
 * HTTP handlers za worker endpoints
 */

/**
 * POST /api/v1/workers/generate/:patientId
 * Generate worker credentials for patient
 */
export const generateWorkerForPatient = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { patientId } = req.params;

  // Get institution_id from authenticated user
  const institutionId = authReq.user?.institutionId;
  const adminUserId = authReq.user?.userId;

  if (!institutionId) {
    res.status(403).json({
      success: false,
      error: 'Keine Institution zugeordnet',
    });
    return;
  }

  if (!adminUserId) {
    res.status(403).json({
      success: false,
      error: 'Keine Benutzer-ID gefunden',
    });
    return;
  }

  logger.info(`Admin ${adminUserId} generating worker for patient ${patientId}`);

  // Generate worker credentials
  const credentials = await workerService.createWorkerForPatient(
    patientId,
    institutionId,
    adminUserId
  );

  res.status(201).json({
    success: true,
    message: 'Worker-Zugangsdaten erfolgreich generiert',
    data: credentials,
  });
});

/**
 * GET /api/v1/workers
 * Get all workers for institution
 */
export const getWorkers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;

  const institutionId = authReq.user?.institutionId;

  if (!institutionId) {
    res.status(403).json({
      success: false,
      error: 'Keine Institution zugeordnet',
    });
    return;
  }

  const workers = await workerService.getWorkersByInstitution(institutionId);

  res.status(200).json({
    success: true,
    data: workers,
    meta: {
      count: workers.length,
    },
  });
});

/**
 * DELETE /api/v1/workers/:id
 * Deactivate worker (soft delete)
 */
export const deactivateWorker = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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

  await workerService.deactivateWorker(id, institutionId);

  res.status(200).json({
    success: true,
    message: 'Worker erfolgreich deaktiviert',
  });
});

/**
 * PATCH /api/v1/workers/:id/reset-password
 * Reset worker password
 */
export const resetWorkerPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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

  const newPassword = await workerService.resetWorkerPassword(id, institutionId);

  res.status(200).json({
    success: true,
    message: 'Passwort erfolgreich zurückgesetzt',
    data: {
      newPassword,
    },
  });
});

/**
 * GET /api/v1/workers/patient/:patientId
 * Get worker by patient ID
 */
export const getWorkerByPatientId = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { patientId } = req.params;

  const institutionId = authReq.user?.institutionId;

  if (!institutionId) {
    res.status(403).json({
      success: false,
      error: 'Keine Institution zugeordnet',
    });
    return;
  }

  const worker = await workerService.getWorkerByPatientId(patientId, institutionId);

  if (!worker) {
    res.status(404).json({
      success: false,
      error: 'Kein Worker für diesen Patienten gefunden',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: worker,
  });
});
