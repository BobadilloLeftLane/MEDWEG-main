import { pool } from '../config/database';
import { decrypt } from '../utils/encryption';

/**
 * Recurring Order Repository
 * Database operations for recurring order templates
 */

export interface RecurringOrderTemplate {
  id: string;
  institution_id: string;
  patient_id: string | null;
  name: string;
  is_active: boolean;
  execution_day_of_month: number;
  delivery_day_of_month: number;
  notification_days_before: number;
  created_at: Date;
  updated_at: Date;
  created_by_user_id: string | null;
}

export interface RecurringOrderTemplateItem {
  id: string;
  template_id: string;
  product_id: string;
  quantity: number;
  created_at: Date;
}

export interface RecurringOrderExecution {
  id: string;
  template_id: string;
  execution_month: Date;
  notification_sent: boolean;
  notification_sent_at: Date | null;
  is_approved: boolean;
  approved_at: Date | null;
  approved_by_user_id: string | null;
  orders_created: boolean;
  orders_created_at: Date | null;
  created_order_ids: string[];
  created_at: Date;
}

export interface RecurringOrderTemplateWithItems extends RecurringOrderTemplate {
  items: RecurringOrderTemplateItem[];
  patient_name?: string;
  patient_count?: number; // If applies to all patients
}

/**
 * Create recurring order template
 */
export const createTemplate = async (
  institutionId: string,
  patientId: string | null,
  name: string,
  executionDay: number,
  deliveryDay: number,
  notificationDaysBefore: number,
  createdByUserId: string
): Promise<RecurringOrderTemplate> => {
  const result = await pool.query(
    `INSERT INTO recurring_order_templates
    (institution_id, patient_id, name, execution_day_of_month, delivery_day_of_month, notification_days_before, created_by_user_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [institutionId, patientId, name, executionDay, deliveryDay, notificationDaysBefore, createdByUserId]
  );

  return result.rows[0];
};

/**
 * Add item to template
 */
export const addTemplateItem = async (
  templateId: string,
  productId: string,
  quantity: number
): Promise<RecurringOrderTemplateItem> => {
  const result = await pool.query(
    `INSERT INTO recurring_order_template_items (template_id, product_id, quantity)
    VALUES ($1, $2, $3)
    RETURNING *`,
    [templateId, productId, quantity]
  );

  return result.rows[0];
};

/**
 * Get all templates for institution
 */
export const getTemplatesByInstitution = async (
  institutionId: string
): Promise<RecurringOrderTemplateWithItems[]> => {
  const templatesResult = await pool.query(
    `SELECT
      t.*,
      p.first_name,
      p.last_name,
      (SELECT COUNT(*) FROM patients WHERE institution_id = t.institution_id AND is_active = true) as patient_count
    FROM recurring_order_templates t
    LEFT JOIN patients p ON t.patient_id = p.id
    WHERE t.institution_id = $1
    ORDER BY t.created_at DESC`,
    [institutionId]
  );

  const templates: RecurringOrderTemplateWithItems[] = [];

  for (const template of templatesResult.rows) {
    // Get items for this template
    const itemsResult = await pool.query(
      `SELECT ti.*, pr.name_de, pr.size, pr.price_per_unit
      FROM recurring_order_template_items ti
      JOIN products pr ON ti.product_id = pr.id
      WHERE ti.template_id = $1
      ORDER BY pr.name_de`,
      [template.id]
    );

    // Decrypt patient name if exists
    let patientName: string | undefined = undefined;
    if (template.first_name && template.last_name) {
      const firstName = await decrypt(template.first_name);
      const lastName = await decrypt(template.last_name);
      patientName = `${firstName} ${lastName}`;
    }

    templates.push({
      id: template.id,
      institution_id: template.institution_id,
      patient_id: template.patient_id,
      name: template.name,
      is_active: template.is_active,
      execution_day_of_month: template.execution_day_of_month,
      delivery_day_of_month: template.delivery_day_of_month,
      notification_days_before: template.notification_days_before,
      created_at: template.created_at,
      updated_at: template.updated_at,
      created_by_user_id: template.created_by_user_id,
      items: itemsResult.rows,
      patient_name: patientName,
      patient_count: template.patient_id ? undefined : parseInt(template.patient_count),
    });
  }

  return templates;
};

/**
 * Get template by ID with items
 */
export const getTemplateById = async (
  templateId: string
): Promise<RecurringOrderTemplateWithItems | null> => {
  const templateResult = await pool.query(
    `SELECT t.*, p.first_name, p.last_name
    FROM recurring_order_templates t
    LEFT JOIN patients p ON t.patient_id = p.id
    WHERE t.id = $1`,
    [templateId]
  );

  if (templateResult.rows.length === 0) {
    return null;
  }

  const template = templateResult.rows[0];

  const itemsResult = await pool.query(
    `SELECT ti.*, pr.name_de, pr.size, pr.price_per_unit
    FROM recurring_order_template_items ti
    JOIN products pr ON ti.product_id = pr.id
    WHERE ti.template_id = $1`,
    [templateId]
  );

  // Decrypt patient name if exists
  let patientName: string | undefined = undefined;
  if (template.first_name && template.last_name) {
    const firstName = await decrypt(template.first_name);
    const lastName = await decrypt(template.last_name);
    patientName = `${firstName} ${lastName}`;
  }

  return {
    id: template.id,
    institution_id: template.institution_id,
    patient_id: template.patient_id,
    name: template.name,
    is_active: template.is_active,
    execution_day_of_month: template.execution_day_of_month,
    delivery_day_of_month: template.delivery_day_of_month,
    notification_days_before: template.notification_days_before,
    created_at: template.created_at,
    updated_at: template.updated_at,
    created_by_user_id: template.created_by_user_id,
    items: itemsResult.rows,
    patient_name: patientName,
  };
};

/**
 * Update template active status
 */
export const toggleTemplateActive = async (
  templateId: string,
  isActive: boolean
): Promise<void> => {
  await pool.query(
    `UPDATE recurring_order_templates
    SET is_active = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2`,
    [isActive, templateId]
  );
};

/**
 * Delete template
 */
export const deleteTemplate = async (templateId: string): Promise<void> => {
  await pool.query(`DELETE FROM recurring_order_templates WHERE id = $1`, [templateId]);
};

/**
 * Get active templates that need notification
 * Returns templates where notification should be sent today
 */
export const getTemplatesNeedingNotification = async (
  todayDayOfMonth: number
): Promise<RecurringOrderTemplateWithItems[]> => {
  // Find templates where:
  // (execution_day_of_month - notification_days_before) == today
  const templatesResult = await pool.query(
    `SELECT t.*,
      p.first_name,
      p.last_name,
      (SELECT COUNT(*) FROM patients WHERE institution_id = t.institution_id AND is_active = true) as patient_count
    FROM recurring_order_templates t
    LEFT JOIN patients p ON t.patient_id = p.id
    WHERE t.is_active = true
      AND (t.execution_day_of_month - t.notification_days_before) = $1`,
    [todayDayOfMonth]
  );

  const templates: RecurringOrderTemplateWithItems[] = [];

  for (const template of templatesResult.rows) {
    const itemsResult = await pool.query(
      `SELECT ti.*, pr.name_de, pr.size, pr.price_per_unit
      FROM recurring_order_template_items ti
      JOIN products pr ON ti.product_id = pr.id
      WHERE ti.template_id = $1`,
      [template.id]
    );

    templates.push({
      ...template,
      items: itemsResult.rows,
      patient_name: template.first_name ? `${template.first_name} ${template.last_name}` : undefined,
      patient_count: template.patient_id ? undefined : parseInt(template.patient_count),
    });
  }

  return templates;
};

/**
 * Get active templates that need execution
 * Returns templates where orders should be created today
 */
export const getTemplatesNeedingExecution = async (
  todayDayOfMonth: number
): Promise<RecurringOrderTemplateWithItems[]> => {
  const templatesResult = await pool.query(
    `SELECT t.*,
      p.first_name,
      p.last_name,
      (SELECT COUNT(*) FROM patients WHERE institution_id = t.institution_id AND is_active = true) as patient_count
    FROM recurring_order_templates t
    LEFT JOIN patients p ON t.patient_id = p.id
    WHERE t.is_active = true
      AND t.execution_day_of_month = $1`,
    [todayDayOfMonth]
  );

  const templates: RecurringOrderTemplateWithItems[] = [];

  for (const template of templatesResult.rows) {
    const itemsResult = await pool.query(
      `SELECT ti.*, pr.name_de, pr.size, pr.price_per_unit
      FROM recurring_order_template_items ti
      JOIN products pr ON ti.product_id = pr.id
      WHERE ti.template_id = $1`,
      [template.id]
    );

    templates.push({
      ...template,
      items: itemsResult.rows,
      patient_name: template.first_name ? `${template.first_name} ${template.last_name}` : undefined,
      patient_count: template.patient_id ? undefined : parseInt(template.patient_count),
    });
  }

  return templates;
};

/**
 * Create execution record for notification
 */
export const createExecution = async (
  templateId: string,
  executionMonth: Date
): Promise<RecurringOrderExecution> => {
  const result = await pool.query(
    `INSERT INTO recurring_order_executions (template_id, execution_month)
    VALUES ($1, $2)
    ON CONFLICT (template_id, execution_month) DO NOTHING
    RETURNING *`,
    [templateId, executionMonth]
  );

  return result.rows[0];
};

/**
 * Mark notification as sent
 */
export const markNotificationSent = async (executionId: string): Promise<void> => {
  await pool.query(
    `UPDATE recurring_order_executions
    SET notification_sent = true, notification_sent_at = CURRENT_TIMESTAMP
    WHERE id = $1`,
    [executionId]
  );
};

/**
 * Approve execution
 */
export const approveExecution = async (
  executionId: string,
  approvedByUserId: string
): Promise<void> => {
  await pool.query(
    `UPDATE recurring_order_executions
    SET is_approved = true, approved_at = CURRENT_TIMESTAMP, approved_by_user_id = $1
    WHERE id = $2`,
    [approvedByUserId, executionId]
  );
};

/**
 * Mark orders as created
 */
export const markOrdersCreated = async (
  executionId: string,
  orderIds: string[]
): Promise<void> => {
  await pool.query(
    `UPDATE recurring_order_executions
    SET orders_created = true, orders_created_at = CURRENT_TIMESTAMP, created_order_ids = $1
    WHERE id = $2`,
    [orderIds, executionId]
  );
};

/**
 * Get pending approvals for institution
 */
export const getPendingApprovals = async (
  institutionId: string
): Promise<any[]> => {
  const result = await pool.query(
    `SELECT e.*, t.name as template_name, t.patient_id, p.first_name, p.last_name
    FROM recurring_order_executions e
    JOIN recurring_order_templates t ON e.template_id = t.id
    LEFT JOIN patients p ON t.patient_id = p.id
    WHERE t.institution_id = $1
      AND e.notification_sent = true
      AND e.is_approved = false
      AND e.orders_created = false
    ORDER BY e.created_at DESC`,
    [institutionId]
  );

  return result.rows;
};
