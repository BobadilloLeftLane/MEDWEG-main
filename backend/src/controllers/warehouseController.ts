import { Request, Response } from 'express';
import * as warehouseService from '../services/warehouseService';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

/**
 * Warehouse Controller
 * Endpoints for stock/warehouse management
 */

/**
 * GET /api/v1/warehouse/stock
 * Get all product stock information
 */
export const getAllProductStock = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const userRole = authReq.user?.role;

    if (userRole !== 'admin_application') {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    const stock = await warehouseService.getAllProductStock();

    res.status(200).json({
      success: true,
      data: stock,
      meta: { count: stock.length },
    });
  }
);

/**
 * GET /api/v1/warehouse/low-stock
 * Get products with low stock
 */
export const getLowStockProducts = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const userRole = authReq.user?.role;

    if (userRole !== 'admin_application') {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    const alerts = await warehouseService.getLowStockProducts();

    res.status(200).json({
      success: true,
      data: alerts,
      meta: { count: alerts.length },
    });
  }
);

/**
 * GET /api/v1/warehouse/low-stock/count
 * Get count of unacknowledged low stock alerts
 */
export const getLowStockAlertsCount = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const userRole = authReq.user?.role;

    if (userRole !== 'admin_application') {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    const count = await warehouseService.getLowStockAlertsCount();

    res.status(200).json({
      success: true,
      data: { count },
    });
  }
);

/**
 * PATCH /api/v1/warehouse/:id/stock
 * Update stock quantity
 */
export const updateStockQuantity = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const userRole = authReq.user?.role;

    if (userRole !== 'admin_application') {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    const { id } = req.params;
    const { quantity } = req.body;

    const product = await warehouseService.updateStockQuantity(id, quantity);

    res.status(200).json({
      success: true,
      message: 'Lagerbestand aktualisiert',
      data: product,
    });
  }
);

/**
 * PATCH /api/v1/warehouse/:id/increase
 * Increase stock (nova isporuka)
 */
export const increaseStock = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const userRole = authReq.user?.role;

    if (userRole !== 'admin_application') {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    const { id } = req.params;
    const { amount } = req.body;

    const product = await warehouseService.increaseStock(id, amount);

    res.status(200).json({
      success: true,
      message: 'Lagerbestand erhöht',
      data: product,
    });
  }
);

/**
 * PATCH /api/v1/warehouse/:id/threshold
 * Update low stock threshold
 */
export const updateLowStockThreshold = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const userRole = authReq.user?.role;

    if (userRole !== 'admin_application') {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    const { id } = req.params;
    const { threshold } = req.body;

    const product = await warehouseService.updateLowStockThreshold(id, threshold);

    res.status(200).json({
      success: true,
      message: 'Mindestschwelle aktualisiert',
      data: product,
    });
  }
);

/**
 * PATCH /api/v1/warehouse/:id/acknowledge
 * Acknowledge low stock alert
 */
export const acknowledgeLowStockAlert = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const userRole = authReq.user?.role;

    if (userRole !== 'admin_application') {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    const { id } = req.params;

    const product = await warehouseService.acknowledgeLowStockAlert(id);

    res.status(200).json({
      success: true,
      message: 'Warnung bestätigt',
      data: product,
    });
  }
);

/**
 * PATCH /api/v1/warehouse/:id/purchase-price
 * Update purchase price (Einkaufspreis)
 */
export const updatePurchasePrice = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const userRole = authReq.user?.role;

    if (userRole !== 'admin_application') {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    const { id } = req.params;
    const { purchasePrice } = req.body;

    const product = await warehouseService.updatePurchasePrice(id, purchasePrice);

    res.status(200).json({
      success: true,
      message: 'Einkaufspreis aktualisiert',
      data: product,
    });
  }
);

/**
 * PATCH /api/v1/warehouse/:id/weight
 * Update product weight (Gewicht)
 */
export const updateWeight = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthRequest;
    const userRole = authReq.user?.role;

    if (userRole !== 'admin_application') {
      res.status(403).json({ success: false, error: 'Zugriff verweigert' });
      return;
    }

    const { id } = req.params;
    const { weight, weightUnit } = req.body;

    const product = await warehouseService.updateWeight(id, weight, weightUnit);

    res.status(200).json({
      success: true,
      message: 'Gewicht aktualisiert',
      data: product,
    });
  }
);
