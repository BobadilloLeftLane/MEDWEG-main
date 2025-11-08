import { Request, Response } from 'express';
import * as recurringService from '../services/recurringOrderService';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { checkAndCreateOrders } from '../services/scheduledOrderService';

/**
 * Recurring Order Controller
 * HTTP handlers for recurring order templates
 */

/**
 * POST /api/v1/recurring-orders/templates
 * Create new recurring order template
 */
export const createTemplate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;

  const institutionId = authReq.user?.institutionId;
  const userId = authReq.user?.userId;

  if (!institutionId || !userId) {
    res.status(403).json({
      success: false,
      error: 'Keine Berechtigung',
    });
    return;
  }

  const data: recurringService.CreateTemplateDto = {
    ...req.body,
    institution_id: institutionId, // Override from JWT
  };

  const template = await recurringService.createTemplate(data, userId, institutionId);

  res.status(201).json({
    success: true,
    message: 'Recurring order template erfolgreich erstellt',
    data: template,
  });
});

/**
 * GET /api/v1/recurring-orders/templates
 * Get all templates for institution
 */
export const getTemplates = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;

  const institutionId = authReq.user?.institutionId;

  if (!institutionId) {
    res.status(403).json({
      success: false,
      error: 'Keine Berechtigung',
    });
    return;
  }

  const templates = await recurringService.getTemplatesByInstitution(institutionId);

  res.status(200).json({
    success: true,
    data: templates,
  });
});

/**
 * GET /api/v1/recurring-orders/templates/:id
 * Get template by ID
 */
export const getTemplateById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { id } = req.params;

  const institutionId = authReq.user?.institutionId;

  if (!institutionId) {
    res.status(403).json({
      success: false,
      error: 'Keine Berechtigung',
    });
    return;
  }

  const template = await recurringService.getTemplateById(id, institutionId);

  res.status(200).json({
    success: true,
    data: template,
  });
});

/**
 * PATCH /api/v1/recurring-orders/templates/:id/toggle
 * Toggle template active status
 */
export const toggleTemplateActive = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { id } = req.params;
  const { is_active } = req.body;

  const institutionId = authReq.user?.institutionId;

  if (!institutionId) {
    res.status(403).json({
      success: false,
      error: 'Keine Berechtigung',
    });
    return;
  }

  await recurringService.toggleTemplateActive(id, is_active, institutionId);

  res.status(200).json({
    success: true,
    message: is_active ? 'Template aktiviert' : 'Template deaktiviert',
  });
});

/**
 * DELETE /api/v1/recurring-orders/templates/:id
 * Delete template
 */
export const deleteTemplate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { id } = req.params;

  const institutionId = authReq.user?.institutionId;

  if (!institutionId) {
    res.status(403).json({
      success: false,
      error: 'Keine Berechtigung',
    });
    return;
  }

  await recurringService.deleteTemplate(id, institutionId);

  res.status(200).json({
    success: true,
    message: 'Template erfolgreich gelöscht',
  });
});

/**
 * GET /api/v1/recurring-orders/pending-approvals
 * Get pending approvals for institution
 */
export const getPendingApprovals = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;

  const institutionId = authReq.user?.institutionId;

  if (!institutionId) {
    res.status(403).json({
      success: false,
      error: 'Keine Berechtigung',
    });
    return;
  }

  const approvals = await recurringService.getPendingApprovals(institutionId);

  res.status(200).json({
    success: true,
    data: approvals,
  });
});

/**
 * POST /api/v1/recurring-orders/executions/:id/approve
 * Approve execution and create orders
 */
export const approveExecution = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { id } = req.params;

  const institutionId = authReq.user?.institutionId;
  const userId = authReq.user?.userId;

  if (!institutionId || !userId) {
    res.status(403).json({
      success: false,
      error: 'Keine Berechtigung',
    });
    return;
  }

  const result = await recurringService.approveExecution(id, userId, institutionId);

  res.status(200).json({
    success: true,
    message: `${result.ordersCreated} Bestellungen erfolgreich erstellt`,
    data: result,
  });
});

/**
 * POST /api/v1/recurring-orders/test-schedule
 * Manually trigger scheduled order creation (for testing)
 */
export const testScheduledCreation = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  await checkAndCreateOrders();

  res.status(200).json({
    success: true,
    message: 'Scheduled order creation executed successfully',
  });
});
