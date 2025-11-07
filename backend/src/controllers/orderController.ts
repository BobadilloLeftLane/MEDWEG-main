import { Request, Response } from 'express';
import * as orderService from '../services/orderService';
import * as orderRepo from '../repositories/orderRepository';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

/**
 * Order Controller
 */

export const createOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const institutionId = authReq.user?.institutionId;
  const userId = authReq.user?.userId;
  const userRole = authReq.user?.role;

  if (!institutionId || !userId || !userRole) {
    res.status(403).json({ success: false, error: 'Keine Institution zugeordnet' });
    return;
  }

  const data: orderService.CreateOrderDto = req.body;
  const order = await orderService.createOrder(data, institutionId, userId, userRole);

  res.status(201).json({
    success: true,
    message: 'Bestellung erfolgreich erstellt',
    data: order,
  });
});

export const getOrderById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { id } = req.params;
  const institutionId = authReq.user?.institutionId;

  if (!institutionId) {
    res.status(403).json({ success: false, error: 'Keine Institution zugeordnet' });
    return;
  }

  const order = await orderService.getOrderById(id, institutionId);

  res.status(200).json({ success: true, data: order });
});

export const getOrders = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const institutionId = authReq.user?.institutionId;

  if (!institutionId) {
    res.status(403).json({ success: false, error: 'Keine Institution zugeordnet' });
    return;
  }

  const filters: {
    status?: orderRepo.OrderStatus;
    patient_id?: string;
    is_automatic?: boolean;
  } = {
    status: req.query.status as orderRepo.OrderStatus | undefined,
    patient_id: req.query.patient_id as string | undefined,
    is_automatic: req.query.is_automatic === 'true' ? true : undefined,
  };

  const orders = await orderService.getOrdersByInstitution(institutionId, filters);

  res.status(200).json({ success: true, data: orders, meta: { count: orders.length } });
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { id } = req.params;
  const { status } = req.body;
  const institutionId = authReq.user?.institutionId;

  if (!institutionId) {
    res.status(403).json({ success: false, error: 'Keine Institution zugeordnet' });
    return;
  }

  const order = await orderService.updateOrderStatus(id, status, institutionId);

  res.status(200).json({ success: true, message: 'Status aktualisiert', data: order });
});

export const getOrderStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const institutionId = authReq.user?.institutionId;

  if (!institutionId) {
    res.status(403).json({ success: false, error: 'Keine Institution zugeordnet' });
    return;
  }

  const stats = await orderService.getOrderStats(institutionId);

  res.status(200).json({ success: true, data: stats });
});

export const deleteOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { id } = req.params;
  const institutionId = authReq.user?.institutionId;

  if (!institutionId) {
    res.status(403).json({ success: false, error: 'Keine Institution zugeordnet' });
    return;
  }

  const result = await orderService.deleteOrder(id, institutionId);

  res.status(200).json({ success: true, message: result.message });
});

/**
 * Get all orders (admin_application only)
 */
export const getAllOrders = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const userRole = authReq.user?.role;

  // Only admin_application can access this
  if (userRole !== 'admin_application') {
    res.status(403).json({ success: false, error: 'Zugriff verweigert' });
    return;
  }

  const filters: {
    status?: orderRepo.OrderStatus;
    institution_id?: string;
  } = {
    status: req.query.status as orderRepo.OrderStatus | undefined,
    institution_id: req.query.institution_id as string | undefined,
  };

  const orders = await orderRepo.getAllOrdersWithDetails(filters);

  res.status(200).json({ success: true, data: orders, meta: { count: orders.length } });
});

/**
 * Confirm order (admin_application only)
 */
export const confirmOrder = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { id } = req.params;
  const userRole = authReq.user?.role;
  const userId = authReq.user?.userId;

  // Only admin_application can confirm orders
  if (userRole !== 'admin_application') {
    res.status(403).json({ success: false, error: 'Zugriff verweigert' });
    return;
  }

  if (!userId) {
    res.status(403).json({ success: false, error: 'Benutzer-ID nicht gefunden' });
    return;
  }

  const order = await orderRepo.confirmOrder(id, userId);

  res.status(200).json({
    success: true,
    message: 'Bestellung als zaprimljeno markiert',
    data: order,
  });
});

/**
 * Update order status (admin_application only - for shipped, delivered, etc.)
 */
export const updateOrderStatusAdmin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { id } = req.params;
  const { status } = req.body;
  const userRole = authReq.user?.role;

  // Only admin_application can update order status
  if (userRole !== 'admin_application') {
    res.status(403).json({ success: false, error: 'Zugriff verweigert' });
    return;
  }

  const order = await orderRepo.updateOrderStatus(id, status);

  res.status(200).json({
    success: true,
    message: 'Status aktualisiert',
    data: order,
  });
});
