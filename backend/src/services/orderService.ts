import { ValidationError, NotFoundError, ForbiddenError } from '../types';
import * as orderRepo from '../repositories/orderRepository';
import * as productRepo from '../repositories/productRepository';
import * as productService from './productService';
import logger from '../utils/logger';

/**
 * Order Service
 * Business logic za order management
 */

export interface CreateOrderDto {
  patient_id?: string;
  items: Array<{ product_id: string; quantity: number }>;
  scheduled_date?: string;
  is_recurring?: boolean;
}

/**
 * Create new order (manual)
 */
export const createOrder = async (
  data: CreateOrderDto,
  institutionId: string,
  userId: string,
  userRole: string
): Promise<orderRepo.OrderWithItems> => {
  // 1. Validate items array
  if (!data.items || data.items.length === 0) {
    throw new ValidationError('Mindestens ein Produkt ist erforderlich');
  }

  // 2. Fetch products and validate stock + get price snapshots
  const orderItems: Array<{ product_id: string; quantity: number; price_per_unit: number }> = [];

  for (const item of data.items) {
    const product = await productRepo.findProductById(item.product_id);

    if (!product) {
      throw new NotFoundError(`Produkt ${item.product_id} nicht gefunden`);
    }

    if (!product.is_available) {
      throw new ValidationError(`Produkt "${product.name_de}" ist nicht verfügbar`);
    }

    // Check stock
    const hasStock = await productRepo.checkStock(item.product_id, item.quantity);
    if (!hasStock) {
      throw new ValidationError(
        `Nicht genügend Bestand für Produkt "${product.name_de}" (verfügbar: ${product.quantity_per_box})`
      );
    }

    // Check min order quantity
    if (item.quantity < product.min_order_quantity) {
      throw new ValidationError(
        `Mindestbestellmenge für "${product.name_de}" ist ${product.min_order_quantity}`
      );
    }

    orderItems.push({
      product_id: item.product_id,
      quantity: item.quantity,
      price_per_unit: product.price_per_unit, // Save current price
    });
  }

  // 3. Create order
  logger.info('Creating order with data:', {
    institutionId,
    patient_id: data.patient_id,
    scheduled_date: data.scheduled_date,
    scheduled_date_parsed: data.scheduled_date ? new Date(data.scheduled_date) : undefined,
    is_recurring: data.is_recurring,
    userRole,
  });

  // Determine which ID field to use based on user role
  const isWorker = userRole === 'worker';

  const order = await orderRepo.createOrder({
    institution_id: institutionId,
    patient_id: data.patient_id,
    created_by_user_id: isWorker ? undefined : userId,
    created_by_worker_id: isWorker ? userId : undefined,
    items: orderItems,
    scheduled_date: data.scheduled_date ? new Date(data.scheduled_date) : undefined,
    is_recurring: data.is_recurring,
  });

  logger.info('Order created successfully', {
    orderId: order.id,
    institutionId,
    itemCount: order.items.length,
    totalAmount: order.total_amount,
    scheduled_date: order.scheduled_date,
    createdBy: isWorker ? 'worker' : 'user',
  });

  return order;
};

/**
 * Get order by ID
 */
export const getOrderById = async (
  orderId: string,
  institutionId: string
): Promise<orderRepo.OrderWithItems> => {
  const order = await orderRepo.findOrderById(orderId);

  if (!order) {
    throw new NotFoundError('Bestellung nicht gefunden');
  }

  // Verify institution ownership
  if (order.institution_id !== institutionId) {
    throw new ForbiddenError('Sie haben keine Berechtigung für diese Bestellung');
  }

  return order;
};

/**
 * Get orders for institution
 */
export const getOrdersByInstitution = async (
  institutionId: string,
  filters?: {
    status?: orderRepo.OrderStatus;
    patient_id?: string;
    is_automatic?: boolean;
  }
): Promise<orderRepo.OrderWithItems[]> => {
  const orders = await orderRepo.getOrdersByInstitution(institutionId, filters);

  logger.info('Orders fetched', {
    institutionId,
    count: orders.length,
    filters,
  });

  return orders;
};

/**
 * Update order status (with stock management)
 */
export const updateOrderStatus = async (
  orderId: string,
  newStatus: orderRepo.OrderStatus,
  institutionId: string
): Promise<orderRepo.Order> => {
  // 1. Get order and verify ownership
  const order = await orderRepo.findOrderById(orderId);

  if (!order) {
    throw new NotFoundError('Bestellung nicht gefunden');
  }

  if (order.institution_id !== institutionId) {
    throw new ForbiddenError('Sie haben keine Berechtigung für diese Bestellung');
  }

  // 2. Validate status transition
  const validTransitions: Record<orderRepo.OrderStatus, orderRepo.OrderStatus[]> = {
    [orderRepo.OrderStatus.PENDING]: [
      orderRepo.OrderStatus.CONFIRMED,
      orderRepo.OrderStatus.CANCELLED,
    ],
    [orderRepo.OrderStatus.CONFIRMED]: [
      orderRepo.OrderStatus.SHIPPED,
      orderRepo.OrderStatus.CANCELLED,
    ],
    [orderRepo.OrderStatus.SHIPPED]: [orderRepo.OrderStatus.DELIVERED],
    [orderRepo.OrderStatus.DELIVERED]: [],
    [orderRepo.OrderStatus.CANCELLED]: [],
  };

  if (!validTransitions[order.status].includes(newStatus)) {
    throw new ValidationError(
      `Statusübergang von "${order.status}" zu "${newStatus}" ist nicht erlaubt`
    );
  }

  // 3. Handle quantity updates
  if (newStatus === orderRepo.OrderStatus.CONFIRMED && order.status === orderRepo.OrderStatus.PENDING) {
    // Deduct quantity when order is confirmed
    for (const item of order.items) {
      await productService.updateProductQuantity(item.product_id, -item.quantity);
    }
    logger.info('Quantity deducted for confirmed order', {
      orderId,
    });
  }

  if (newStatus === orderRepo.OrderStatus.CANCELLED && order.status === orderRepo.OrderStatus.CONFIRMED) {
    // Return quantity when confirmed order is cancelled
    for (const item of order.items) {
      await productService.updateProductQuantity(item.product_id, item.quantity);
    }
    logger.info('Quantity returned for cancelled order', {
      orderId,
    });
  }

  // 4. Update status
  const updatedOrder = await orderRepo.updateOrderStatus(orderId, newStatus);

  logger.info('Order status updated', {
    orderId,
    oldStatus: order.status,
    newStatus,
  });

  return updatedOrder;
};

/**
 * Get order statistics for institution
 */
export const getOrderStats = async (institutionId: string) => {
  const stats = await orderRepo.getOrderStats(institutionId);

  return stats;
};

/**
 * Delete order (only pending orders)
 */
export const deleteOrder = async (orderId: string, institutionId: string): Promise<{ message: string }> => {
  const order = await orderRepo.findOrderById(orderId);

  if (!order) {
    throw new NotFoundError('Bestellung nicht gefunden');
  }

  if (order.institution_id !== institutionId) {
    throw new ForbiddenError('Sie haben keine Berechtigung für diese Bestellung');
  }

  if (order.status !== orderRepo.OrderStatus.PENDING) {
    throw new ValidationError('Nur ausstehende Bestellungen können gelöscht werden');
  }

  await orderRepo.deleteOrder(orderId);

  logger.warn('Order deleted', {
    orderId,
    institutionId,
  });

  return {
    message: 'Bestellung erfolgreich gelöscht',
  };
};
