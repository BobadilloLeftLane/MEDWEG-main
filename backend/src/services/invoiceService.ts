import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import * as orderRepo from '../repositories/orderRepository';
import * as institutionRepo from '../repositories/institutionRepository';
import * as patientRepo from '../repositories/patientRepository';
import * as productRepo from '../repositories/productRepository';
import { NotFoundError, ForbiddenError, Institution } from '../types';
import logger from '../utils/logger';
import { decrypt } from '../utils/encryption';

/**
 * Invoice Service
 * Generisanje PDF računa za porudžbine
 */

export interface OrderItemWithProduct extends orderRepo.OrderItem {
  product_name: string;
}

export interface OrderWithItemsAndProducts extends Omit<orderRepo.OrderWithItems, 'items'> {
  items: OrderItemWithProduct[];
}

export interface InvoiceData {
  order: OrderWithItemsAndProducts;
  institution: Institution;
  patient?: patientRepo.PatientDecrypted;
}

/**
 * Generate invoice PDF for an order
 */
export const generateInvoicePDF = async (
  orderId: string,
  institutionId: string
): Promise<{ stream: Readable; filename: string }> => {
  // 1. Fetch order data
  const order = await orderRepo.findOrderById(orderId);

  if (!order) {
    throw new NotFoundError('Bestellung nicht gefunden');
  }

  if (order.institution_id !== institutionId) {
    throw new ForbiddenError('Sie haben keine Berechtigung für diese Bestellung');
  }

  // 2. Fetch institution data
  const institution = await institutionRepo.findInstitutionById(institutionId);

  if (!institution) {
    throw new NotFoundError('Institution nicht gefunden');
  }

  // 3. Fetch patient data (if applicable)
  let patient: patientRepo.PatientDecrypted | undefined;
  if (order.patient_id) {
    const fetchedPatient = await patientRepo.findPatientById(order.patient_id);
    patient = fetchedPatient || undefined;
  }

  // 4. Fetch product names for order items
  const itemsWithProducts: OrderItemWithProduct[] = [];
  for (const item of order.items) {
    const product = await productRepo.findProductById(item.product_id);
    itemsWithProducts.push({
      ...item,
      product_name: product?.name_de || 'Unknown Product',
    });
  }

  const orderWithProducts: OrderWithItemsAndProducts = {
    ...order,
    items: itemsWithProducts,
  };

  // 5. Generate PDF
  const invoiceData: InvoiceData = {
    order: orderWithProducts,
    institution,
    patient,
  };

  const pdfStream = await createInvoicePDF(invoiceData);
  const filename = `Rechnung_${order.id}.pdf`;

  logger.info('Invoice PDF generated', {
    orderId,
    institutionId,
  });

  return { stream: pdfStream, filename };
};

/**
 * Create PDF document from invoice data
 */
const createInvoicePDF = async (data: InvoiceData): Promise<Readable> => {
  // Decrypt institution address first
  const institutionStreet = await decrypt(data.institution.address_street);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Rechnung ${data.order.id}`,
          Author: 'MEDWEG',
          Subject: 'Bestellungsrechnung',
        },
      });

      const stream = new Readable();
      stream._read = () => {};

      doc.on('data', (chunk) => stream.push(chunk));
      doc.on('end', () => {
        stream.push(null);
        resolve(stream);
      });
      doc.on('error', reject);

      // === HEADER ===
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('RECHNUNG', { align: 'center' })
        .moveDown(0.5);

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Bestellungs-ID: ${data.order.id}`, { align: 'center' })
        .text(`Datum: ${formatDate(data.order.created_at)}`, { align: 'center' })
        .moveDown(2);

      // === INSTITUTION INFO (Left) ===

      doc.fontSize(12).font('Helvetica-Bold').text('Lieferant:', 50, doc.y);
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(data.institution.name, 50, doc.y)
        .text(institutionStreet, 50, doc.y)
        .text(`${data.institution.address_plz} ${data.institution.address_city}`, 50, doc.y);

      // === PATIENT INFO (Right) - If available ===
      if (data.patient) {
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Patient:', 300, doc.y - 60);

        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`${data.patient.first_name} ${data.patient.last_name}`, 300, doc.y)
          .text(`Patientennummer: ${data.patient.unique_code}`, 300, doc.y)
          .text(`Adresse: ${data.patient.address}`, 300, doc.y);
      }

      doc.moveDown(3);

      // === ORDER ITEMS TABLE ===
      const tableTop = doc.y;
      const col1 = 50;
      const col2 = 250;
      const col3 = 350;
      const col4 = 450;

      // Table Header
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Produkt', col1, tableTop)
        .text('Menge', col2, tableTop)
        .text('Einzelpreis', col3, tableTop)
        .text('Gesamt', col4, tableTop);

      doc
        .moveTo(col1, tableTop + 15)
        .lineTo(540, tableTop + 15)
        .stroke();

      // Table Rows
      let yPosition = tableTop + 25;

      for (const item of data.order.items) {
        const itemTotal = item.quantity * item.price_per_unit;

        doc
          .fontSize(9)
          .font('Helvetica')
          .text(item.product_name, col1, yPosition, { width: 180 })
          .text(item.quantity.toString(), col2, yPosition)
          .text(`€ ${item.price_per_unit.toFixed(2)}`, col3, yPosition)
          .text(`€ ${itemTotal.toFixed(2)}`, col4, yPosition);

        yPosition += 25;
      }

      // Separator line
      doc
        .moveTo(col1, yPosition)
        .lineTo(540, yPosition)
        .stroke();

      yPosition += 15;

      // === TOTAL ===
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Gesamtbetrag:', col3, yPosition)
        .text(`€ ${data.order.total_amount.toFixed(2)}`, col4, yPosition);

      yPosition += 40;

      // === ORDER INFO ===
      doc.fontSize(10).font('Helvetica-Bold').text('Bestellinformationen:', 50, yPosition);
      yPosition += 15;

      doc
        .fontSize(9)
        .font('Helvetica')
        .text(`Status: ${translateOrderStatus(data.order.status)}`, 50, yPosition);
      yPosition += 15;

      // === FOOTER ===
      doc
        .fontSize(8)
        .font('Helvetica')
        .text('MEDWEG - Medizinischer Großhandel', 50, 750, { align: 'center' })
        .text('Vielen Dank für Ihre Bestellung!', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Helper: Format date to DD.MM.YYYY
 */
const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

/**
 * Helper: Translate order status to German
 */
const translateOrderStatus = (status: orderRepo.OrderStatus): string => {
  const translations: Record<orderRepo.OrderStatus, string> = {
    [orderRepo.OrderStatus.PENDING]: 'Ausstehend',
    [orderRepo.OrderStatus.CONFIRMED]: 'Bestätigt',
    [orderRepo.OrderStatus.SHIPPED]: 'Versendet',
    [orderRepo.OrderStatus.DELIVERED]: 'Geliefert',
    [orderRepo.OrderStatus.CANCELLED]: 'Storniert',
  };

  return translations[status] || status;
};
