import * as cron from 'node-cron';
import * as recurringRepo from '../repositories/recurringOrderRepository';
import * as patientRepo from '../repositories/patientRepository';
import * as orderRepo from '../repositories/orderRepository';
import logger from '../utils/logger';

/**
 * Scheduled Order Service
 * Automatically creates orders from recurring templates at 13:00 daily
 */

/**
 * Check and create orders from templates
 * Runs daily at 13:00
 */
export const checkAndCreateOrders = async () => {
  try {
    const now = new Date();
    const todayDayOfMonth = now.getDate();

    logger.info(' Running scheduled order creation check', {
      time: now.toISOString(),
      dayOfMonth: todayDayOfMonth,
    });

    // Get templates that need execution today
    const templates = await recurringRepo.getTemplatesNeedingExecution(todayDayOfMonth);

    if (templates.length === 0) {
      logger.info(' No templates to execute today');
      return;
    }

    logger.info(` Found ${templates.length} templates to execute`);

    let totalOrdersCreated = 0;

    for (const template of templates) {
      try {
        // Calculate delivery date based on delivery_day_of_month
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const deliveryDate = new Date(currentYear, currentMonth, template.delivery_day_of_month);

        // Prepare items with prices from template
        const orderItems = template.items.map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price_per_unit: Number(item.price_per_unit || 0),
        }));

        const orderIds: string[] = [];

        if (template.patient_id) {
          // Create order for specific patient
          const order = await orderRepo.createOrder({
            institution_id: template.institution_id,
            patient_id: template.patient_id,
            created_by_user_id: template.created_by_user_id || undefined,
            is_recurring: true,
            scheduled_date: deliveryDate,
            items: orderItems,
          });

          orderIds.push(order.id);
          logger.info(` Created recurring order for patient`, {
            orderId: order.id,
            templateId: template.id,
            patientId: template.patient_id,
          });
        } else {
          // Create orders for ALL active patients
          const patients = await patientRepo.getPatientsByInstitution(template.institution_id, true);

          logger.info(` Creating orders for ${patients.length} patients`, {
            templateId: template.id,
            institutionId: template.institution_id,
          });

          for (const patient of patients) {
            const order = await orderRepo.createOrder({
              institution_id: template.institution_id,
              patient_id: patient.id,
              created_by_user_id: template.created_by_user_id || undefined,
              is_recurring: true,
              scheduled_date: deliveryDate,
              items: orderItems,
            });

            orderIds.push(order.id);
          }

          logger.info(` Created ${orderIds.length} recurring orders for all patients`, {
            templateId: template.id,
          });
        }

        totalOrdersCreated += orderIds.length;

        // Create execution record
        const executionMonth = new Date(currentYear, currentMonth, 1);
        const execution = await recurringRepo.createExecution(template.id, executionMonth);

        // Mark as approved and orders created automatically
        if (execution) {
          await recurringRepo.approveExecution(execution.id, template.created_by_user_id || '');
          await recurringRepo.markOrdersCreated(execution.id, orderIds);
        }
      } catch (error) {
        logger.error(' Error creating orders for template', {
          templateId: template.id,
          error: error instanceof Error ? error.message : error,
        });
      }
    }

    logger.info(` Scheduled order creation completed`, {
      templatesProcessed: templates.length,
      totalOrdersCreated,
    });
  } catch (error) {
    logger.error(' Error in scheduled order creation', {
      error: error instanceof Error ? error.message : error,
    });
  }
};

/**
 * Start the scheduled job
 * Runs every day at 13:00
 */
export const startScheduledJobs = () => {
  // Run at 13:00 every day
  cron.schedule('0 13 * * *', async () => {
    logger.info('⏰ Scheduled job triggered at 13:00');
    await checkAndCreateOrders();
  });

  logger.info(' Scheduled jobs initialized - Daily order creation at 13:00');
};
