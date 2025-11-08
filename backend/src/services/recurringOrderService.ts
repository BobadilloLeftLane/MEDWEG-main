import * as recurringRepo from '../repositories/recurringOrderRepository';
import * as patientRepo from '../repositories/patientRepository';
import * as orderRepo from '../repositories/orderRepository';
import logger from '../utils/logger';
import { ValidationError, NotFoundError, ForbiddenError } from '../types';

/**
 * Recurring Order Service
 * Business logic for automatic recurring orders
 */

export interface CreateTemplateDto {
  institution_id: string;
  patient_id: string | null; // null = apply to all patients
  name: string;
  execution_day_of_month: number; // 1-28
  delivery_day_of_month: number; // 1-28
  notification_days_before: number; // default 5
  items: Array<{
    product_id: string;
    quantity: number;
  }>;
}

/**
 * Create recurring order template
 */
export const createTemplate = async (
  data: CreateTemplateDto,
  createdByUserId: string,
  requestingInstitutionId: string
): Promise<recurringRepo.RecurringOrderTemplateWithItems> => {
  // Verify institution match
  if (data.institution_id !== requestingInstitutionId) {
    throw new ForbiddenError('Sie können nur Templates für Ihre eigene Institution erstellen');
  }

  // Validate days
  if (data.execution_day_of_month < 1 || data.execution_day_of_month > 28) {
    throw new ValidationError('Ausführungstag muss zwischen 1 und 28 sein');
  }

  if (data.delivery_day_of_month < 1 || data.delivery_day_of_month > 28) {
    throw new ValidationError('Liefertag muss zwischen 1 und 28 sein');
  }

  if (data.delivery_day_of_month <= data.execution_day_of_month) {
    throw new ValidationError('Liefertag muss nach dem Ausführungstag sein');
  }

  // Validate items
  if (!data.items || data.items.length === 0) {
    throw new ValidationError('Mindestens ein Produkt ist erforderlich');
  }

  // If patient_id specified, verify it belongs to institution
  if (data.patient_id) {
    const patient = await patientRepo.findPatientById(data.patient_id);
    if (!patient || patient.institution_id !== requestingInstitutionId) {
      throw new NotFoundError('Patient nicht gefunden');
    }
  }

  // Create template
  const template = await recurringRepo.createTemplate(
    data.institution_id,
    data.patient_id,
    data.name,
    data.execution_day_of_month,
    data.delivery_day_of_month,
    data.notification_days_before || 5,
    createdByUserId
  );

  // Add items
  const items = [];
  for (const item of data.items) {
    const templateItem = await recurringRepo.addTemplateItem(
      template.id,
      item.product_id,
      item.quantity
    );
    items.push(templateItem);
  }

  logger.info('Recurring order template created', {
    templateId: template.id,
    institutionId: data.institution_id,
    patientId: data.patient_id,
    itemCount: items.length,
  });

  return {
    ...template,
    items,
  };
};

/**
 * Get all templates for institution
 */
export const getTemplatesByInstitution = async (
  institutionId: string
): Promise<recurringRepo.RecurringOrderTemplateWithItems[]> => {
  const templates = await recurringRepo.getTemplatesByInstitution(institutionId);
  return templates;
};

/**
 * Get template by ID
 */
export const getTemplateById = async (
  templateId: string,
  requestingInstitutionId: string
): Promise<recurringRepo.RecurringOrderTemplateWithItems> => {
  const template = await recurringRepo.getTemplateById(templateId);

  if (!template) {
    throw new NotFoundError('Template nicht gefunden');
  }

  if (template.institution_id !== requestingInstitutionId) {
    throw new ForbiddenError('Keine Berechtigung für dieses Template');
  }

  return template;
};

/**
 * Toggle template active status
 */
export const toggleTemplateActive = async (
  templateId: string,
  isActive: boolean,
  requestingInstitutionId: string
): Promise<void> => {
  const template = await recurringRepo.getTemplateById(templateId);

  if (!template) {
    throw new NotFoundError('Template nicht gefunden');
  }

  if (template.institution_id !== requestingInstitutionId) {
    throw new ForbiddenError('Keine Berechtigung für dieses Template');
  }

  await recurringRepo.toggleTemplateActive(templateId, isActive);

  logger.info('Template status updated', {
    templateId,
    isActive,
  });
};

/**
 * Delete template
 */
export const deleteTemplate = async (
  templateId: string,
  requestingInstitutionId: string
): Promise<void> => {
  const template = await recurringRepo.getTemplateById(templateId);

  if (!template) {
    throw new NotFoundError('Template nicht gefunden');
  }

  if (template.institution_id !== requestingInstitutionId) {
    throw new ForbiddenError('Keine Berechtigung für dieses Template');
  }

  await recurringRepo.deleteTemplate(templateId);

  logger.info('Template deleted', { templateId });
};

/**
 * Get pending approvals for institution
 */
export const getPendingApprovals = async (
  institutionId: string
): Promise<any[]> => {
  const approvals = await recurringRepo.getPendingApprovals(institutionId);
  return approvals;
};

/**
 * Approve execution and create orders
 */
export const approveExecution = async (
  executionId: string,
  approvedByUserId: string,
  requestingInstitutionId: string
): Promise<{ ordersCreated: number }> => {
  // Get execution with template
  const execution = await recurringRepo.getTemplateById(executionId);

  if (!execution) {
    throw new NotFoundError('Execution nicht gefunden');
  }

  // Verify institution
  if (execution.institution_id !== requestingInstitutionId) {
    throw new ForbiddenError('Keine Berechtigung');
  }

  // Mark as approved
  await recurringRepo.approveExecution(executionId, approvedByUserId);

  // Prepare items with prices from template
  const orderItems = execution.items.map((item: any) => ({
    product_id: item.product_id,
    quantity: item.quantity,
    price_per_unit: Number(item.price_per_unit || 0),
  }));

  // Create orders
  const orderIds: string[] = [];

  if (execution.patient_id) {
    // Create order for specific patient
    const order = await orderRepo.createOrder({
      institution_id: execution.institution_id,
      patient_id: execution.patient_id,
      created_by_user_id: approvedByUserId,
      is_recurring: true,
      scheduled_date: new Date(), // Calculate delivery date
      items: orderItems,
    });

    orderIds.push(order.id);
  } else {
    // Create orders for ALL active patients
    const patients = await patientRepo.getPatientsByInstitution(execution.institution_id, true);

    for (const patient of patients) {
      const order = await orderRepo.createOrder({
        institution_id: execution.institution_id,
        patient_id: patient.id,
        created_by_user_id: approvedByUserId,
        is_recurring: true,
        scheduled_date: new Date(),
        items: orderItems,
      });

      orderIds.push(order.id);
    }
  }

  // Mark orders as created
  await recurringRepo.markOrdersCreated(executionId, orderIds);

  logger.info('Recurring orders created', {
    executionId,
    ordersCreated: orderIds.length,
  });

  return { ordersCreated: orderIds.length };
};
