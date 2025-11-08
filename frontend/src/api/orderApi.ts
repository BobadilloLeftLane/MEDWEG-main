import apiClient from './client';
import { Product } from './productApi';

/**
 * Order API
 * API calls for order management
 */

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_per_unit: number;
  subtotal: number;
  created_at: string;
  product?: Product; // Populated when fetching order details
}

export interface Order {
  id: string;
  order_number: number;
  institution_id: string;
  patient_id: string | null;
  created_by_user_id: string | null;
  created_by_worker_id: string | null;
  status: OrderStatus;
  is_recurring: boolean;
  scheduled_date: string | null;
  is_confirmed: boolean;
  approved_by_admin_id: string | null;
  approved_at: string | null;
  shipped_at: string | null;
  total_amount: number;
  selected_shipping_carrier: string | null;
  selected_shipping_price: number | null;
  created_at: string;
  updated_at: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface OrderWithDetails extends OrderWithItems {
  institution_name?: string;
  patient_name?: string;
  patient_address?: string;
  created_by_user_email?: string;
  created_by_worker_username?: string;
}

export interface CreateOrderDto {
  patient_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
  }>;
  scheduled_date?: string;
  is_recurring?: boolean;
}

/**
 * Get all orders (admin_application only)
 */
export const getAllOrders = async (filters?: {
  status?: OrderStatus;
  institution_id?: string;
  page?: number;
  limit?: number;
}): Promise<{ orders: OrderWithDetails[]; total: number; totalPages: number; page: number; limit: number }> => {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.append('status', filters.status);
  }
  if (filters?.institution_id) {
    params.append('institution_id', filters.institution_id);
  }
  if (filters?.page) {
    params.append('page', filters.page.toString());
  }
  if (filters?.limit) {
    params.append('limit', filters.limit.toString());
  }

  const response = await apiClient.get(`/orders/all?${params.toString()}`);
  return {
    orders: response.data.data,
    total: response.data.meta.total,
    totalPages: response.data.meta.totalPages,
    page: response.data.meta.page,
    limit: response.data.meta.limit,
  };
};

/**
 * Get orders for current institution
 */
export const getOrders = async (filters?: {
  status?: OrderStatus;
  patient_id?: string;
}): Promise<OrderWithDetails[]> => {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.append('status', filters.status);
  }
  if (filters?.patient_id) {
    params.append('patient_id', filters.patient_id);
  }

  const response = await apiClient.get(`/orders?${params.toString()}`);
  return response.data.data;
};

/**
 * Get order by ID
 */
export const getOrderById = async (id: string): Promise<OrderWithItems> => {
  const response = await apiClient.get(`/orders/${id}`);
  return response.data.data;
};

/**
 * Create new order
 */
export const createOrder = async (data: CreateOrderDto): Promise<OrderWithItems> => {
  const response = await apiClient.post('/orders', data);
  return response.data.data;
};

/**
 * Update order status (for institutions)
 */
export const updateOrderStatus = async (
  id: string,
  status: OrderStatus
): Promise<Order> => {
  const response = await apiClient.patch(`/orders/${id}/status`, { status });
  return response.data.data;
};

/**
 * Update order status (for admin_application only)
 */
export const updateOrderStatusAdmin = async (
  id: string,
  status: OrderStatus
): Promise<Order> => {
  const response = await apiClient.patch(`/orders/${id}/admin-status`, { status });
  return response.data.data;
};

/**
 * Mark order as confirmed (zaprimljeno)
 */
export const confirmOrder = async (id: string): Promise<Order> => {
  const response = await apiClient.patch(`/orders/${id}/confirm`);
  return response.data.data;
};

/**
 * Delete order
 */
export const deleteOrder = async (id: string): Promise<void> => {
  await apiClient.delete(`/orders/${id}`);
};

/**
 * Update selected shipping option (for admin_application only)
 */
export const updateSelectedShipping = async (
  id: string,
  carrier: string,
  price: number
): Promise<Order> => {
  const response = await apiClient.patch(`/orders/${id}/shipping`, {
    carrier,
    price
  });
  return response.data.data;
};

/**
 * Download invoice PDF (for admin_application only)
 */
export const downloadInvoicePDF = async (id: string, orderNumber: number): Promise<void> => {
  const response = await apiClient.get(`/orders/${id}/invoice`, {
    responseType: 'blob',
  });

  // Create download link
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Rechnung_${orderNumber}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Download monthly report PDF (for admin_application only)
 */
export const downloadMonthlyReport = async (month: number, year: number): Promise<void> => {
  const response = await apiClient.get(`/orders/monthly-report/${year}/${month}`, {
    responseType: 'blob',
  });

  // Create download link
  const monthNames = ['', 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Monatsbericht_${monthNames[month]}_${year}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
