import apiClient, { ApiResponse } from './client';

/**
 * Recurring Order API
 * API calls for recurring order templates
 */

export interface RecurringOrderTemplateItem {
  id: string;
  template_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  name_de?: string;
  size?: string;
  price_per_unit?: number;
}

export interface RecurringOrderTemplate {
  id: string;
  institution_id: string;
  patient_id: string | null;
  name: string;
  is_active: boolean;
  execution_day_of_month: number;
  delivery_day_of_month: number;
  notification_days_before: number;
  created_at: string;
  updated_at: string;
  created_by_user_id: string | null;
  items: RecurringOrderTemplateItem[];
  patient_name?: string;
  patient_count?: number;
}

export interface CreateTemplateRequest {
  patient_id: string | null; // null = all patients
  name: string;
  execution_day_of_month: number;
  delivery_day_of_month: number;
  notification_days_before: number;
  items: Array<{
    product_id: string;
    quantity: number;
  }>;
}

export interface PendingApproval {
  id: string;
  template_id: string;
  template_name: string;
  execution_month: string;
  notification_sent: boolean;
  notification_sent_at: string | null;
  is_approved: boolean;
  patient_id: string | null;
  patient_name?: string;
  created_at: string;
}

/**
 * Create new recurring order template
 */
export const createTemplate = async (data: CreateTemplateRequest): Promise<RecurringOrderTemplate> => {
  const response = await apiClient.post<ApiResponse<RecurringOrderTemplate>>(
    '/recurring-orders/templates',
    data
  );
  return response.data.data;
};

/**
 * Get all templates for current institution
 */
export const getTemplates = async (): Promise<RecurringOrderTemplate[]> => {
  const response = await apiClient.get<ApiResponse<RecurringOrderTemplate[]>>(
    '/recurring-orders/templates'
  );
  return response.data.data;
};

/**
 * Get template by ID
 */
export const getTemplateById = async (id: string): Promise<RecurringOrderTemplate> => {
  const response = await apiClient.get<ApiResponse<RecurringOrderTemplate>>(
    `/recurring-orders/templates/${id}`
  );
  return response.data.data;
};

/**
 * Toggle template active status
 */
export const toggleTemplateActive = async (id: string, isActive: boolean): Promise<void> => {
  await apiClient.patch(`/recurring-orders/templates/${id}/toggle`, {
    is_active: isActive,
  });
};

/**
 * Delete template
 */
export const deleteTemplate = async (id: string): Promise<void> => {
  await apiClient.delete(`/recurring-orders/templates/${id}`);
};

/**
 * Get pending approvals
 */
export const getPendingApprovals = async (): Promise<PendingApproval[]> => {
  const response = await apiClient.get<ApiResponse<PendingApproval[]>>(
    '/recurring-orders/pending-approvals'
  );
  return response.data.data;
};

/**
 * Approve execution and create orders
 */
export const approveExecution = async (
  executionId: string
): Promise<{ ordersCreated: number }> => {
  const response = await apiClient.post<ApiResponse<{ ordersCreated: number }>>(
    `/recurring-orders/executions/${executionId}/approve`
  );
  return response.data.data;
};
