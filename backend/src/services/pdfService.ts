import PDFDocument from 'pdfkit';
import { Response } from 'express';
import * as orderRepo from '../repositories/orderRepository';
import * as productRepo from '../repositories/productRepository';
import { decrypt } from '../utils/encryption';
import { pool } from '../config/database';

/**
 * PDF Invoice Generator Service
 * Generates professional invoices for shipped orders
 */

// Company info - MEDWEG
const COMPANY_INFO = {
  name: 'MEDWEG',
  address: 'Musterstraße 123',
  city: '10115 Berlin',
  country: 'Deutschland',
  phone: '+49 30 12345678',
  email: 'info@medweg.de',
  taxId: 'DE123456789',
  iban: 'DE89 3704 0044 0532 0130 00',
  bic: 'COBADEFFXXX',
};

interface InvoiceData {
  orderNumber: number;
  orderId: string;
  orderDate: Date;
  institutionName: string;
  institutionAddress?: string;
  patientName: string;
  patientAddress: string;
  items: Array<{
    productName: string;
    quantity: number;
    pricePerUnit: number;
    subtotal: number;
  }>;
  totalAmount: number;
}

/**
 * Generate PDF invoice for a shipped order
 */
export const generateInvoice = async (orderId: string, res: Response): Promise<void> => {
  try {
    // Get order with details
    const order = await orderRepo.findOrderById(orderId);
    if (!order) {
      throw new Error('Bestellung nicht gefunden');
    }

    // Get institution info
    const institutionResult = await pool.query(
      'SELECT name, address FROM institutions WHERE id = $1',
      [order.institution_id]
    );
    const institution = institutionResult.rows[0];

    // Get patient info
    let patientName = 'Unbekannt';
    let patientAddress = 'Unbekannt';
    if (order.patient_id) {
      const patientResult = await pool.query(
        'SELECT first_name, last_name, address FROM patients WHERE id = $1',
        [order.patient_id]
      );
      if (patientResult.rows.length > 0) {
        const p = patientResult.rows[0];
        const firstName = await decrypt(p.first_name);
        const lastName = await decrypt(p.last_name);
        patientName = `${firstName} ${lastName}`;
        if (p.address) {
          patientAddress = await decrypt(p.address);
        }
      }
    }

    // Get products with details
    const items = [];
    for (const item of order.items) {
      const product = await productRepo.findProductById(item.product_id);
      if (product) {
        items.push({
          productName: product.name_de,
          quantity: Number(item.quantity),
          pricePerUnit: Number(item.price_per_unit),
          subtotal: Number(item.subtotal),
        });
      }
    }

    const invoiceData: InvoiceData = {
      orderNumber: order.order_number,
      orderId: order.id,
      orderDate: order.created_at,
      institutionName: institution?.name || 'Unbekannt',
      institutionAddress: institution?.address || '',
      patientName,
      patientAddress,
      items,
      totalAmount: Number(order.total_amount),
    };

    // Generate PDF
    await createInvoicePDF(invoiceData, res);
  } catch (error) {
    throw error;
  }
};

/**
 * Create the actual PDF document
 */
const createInvoicePDF = async (data: InvoiceData, res: Response): Promise<void> => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=Rechnung_${data.orderNumber}.pdf`
  );

  // Pipe PDF to response
  doc.pipe(res);

  // Header - Company Logo Area
  doc.fontSize(20).fillColor('#2563EB').text('MEDWEG', 50, 50);
  doc.fontSize(10).fillColor('#6B7280').text('Medizinische Versorgung', 50, 75);

  // Company Info (right side)
  doc.fontSize(9)
    .fillColor('#374151')
    .text(COMPANY_INFO.name, 350, 50)
    .text(COMPANY_INFO.address, 350, 65)
    .text(COMPANY_INFO.city, 350, 80)
    .text(`Tel: ${COMPANY_INFO.phone}`, 350, 95)
    .text(COMPANY_INFO.email, 350, 110);

  // Invoice Title
  doc.fontSize(24)
    .fillColor('#1F2937')
    .text('RECHNUNG', 50, 140);

  // Invoice Info
  doc.fontSize(10)
    .fillColor('#6B7280')
    .text(`Rechnungsnummer: ${data.orderNumber}`, 50, 175)
    .text(`Bestellungs-ID: ${data.orderId.substring(0, 8)}`, 50, 190)
    .text(`Datum: ${new Date(data.orderDate).toLocaleDateString('de-DE')}`, 50, 205);

  // Divider
  doc.moveTo(50, 230).lineTo(545, 230).stroke('#E5E7EB');

  // Bill To Section
  doc.fontSize(11)
    .fillColor('#1F2937')
    .text('Rechnung an:', 50, 250);

  doc.fontSize(10)
    .fillColor('#374151')
    .text(data.institutionName, 50, 270)
    .text(data.institutionAddress || '', 50, 285);

  // Patient Info
  doc.fontSize(11)
    .fillColor('#1F2937')
    .text('Patient:', 50, 315);

  doc.fontSize(10)
    .fillColor('#374151')
    .text(data.patientName, 50, 335)
    .text(data.patientAddress, 50, 350);

  // Items Table
  const tableTop = 390;

  // Table Header
  doc.fontSize(10)
    .fillColor('#FFFFFF')
    .rect(50, tableTop, 495, 25)
    .fill('#2563EB');

  doc.fillColor('#FFFFFF')
    .text('Artikel', 60, tableTop + 8)
    .text('Menge', 300, tableTop + 8)
    .text('Preis', 380, tableTop + 8)
    .text('Gesamt', 460, tableTop + 8);

  // Table Rows
  let yPosition = tableTop + 35;
  doc.fillColor('#374151');

  data.items.forEach((item, index) => {
    const bgColor = index % 2 === 0 ? '#F9FAFB' : '#FFFFFF';
    doc.rect(50, yPosition - 5, 495, 25).fill(bgColor);

    doc.fillColor('#374151')
      .fontSize(9)
      .text(item.productName, 60, yPosition, { width: 220 })
      .text(item.quantity.toString(), 300, yPosition)
      .text(`€${item.pricePerUnit.toFixed(2)}`, 380, yPosition)
      .text(`€${item.subtotal.toFixed(2)}`, 460, yPosition);

    yPosition += 30;
  });

  // Total Section
  yPosition += 20;
  doc.moveTo(50, yPosition).lineTo(545, yPosition).stroke('#E5E7EB');

  yPosition += 15;
  doc.fontSize(12)
    .fillColor('#1F2937')
    .text('Gesamtbetrag:', 380, yPosition)
    .fontSize(14)
    .fillColor('#2563EB')
    .text(`€${data.totalAmount.toFixed(2)}`, 460, yPosition);

  // Footer - Payment Info
  const footerTop = 700;
  doc.fontSize(8)
    .fillColor('#6B7280')
    .text('Zahlungsinformationen', 50, footerTop)
    .text(`IBAN: ${COMPANY_INFO.iban}`, 50, footerTop + 15)
    .text(`BIC: ${COMPANY_INFO.bic}`, 50, footerTop + 30)
    .text(`Steuernummer: ${COMPANY_INFO.taxId}`, 50, footerTop + 45);

  // Thank you note
  doc.fontSize(9)
    .fillColor('#10B981')
    .text('Vielen Dank für Ihr Vertrauen!', 350, footerTop + 20);

  // Finalize PDF
  doc.end();
};

/**
 * Generate Monthly Report PDF
 */
export const generateMonthlyReport = async (year: number, month: number, res: Response): Promise<void> => {
  try {
    // Get all orders for the specified month
    const startDate = new Date(year, month - 1, 1); // Month is 0-indexed in Date
    const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of the month

    const ordersResult = await pool.query(
      `SELECT o.*, i.name as institution_name
       FROM orders o
       LEFT JOIN institutions i ON o.institution_id = i.id
       WHERE o.created_at >= $1 AND o.created_at <= $2
       AND (o.status = 'confirmed' OR o.status = 'shipped' OR o.status = 'delivered')
       ORDER BY o.created_at DESC`,
      [startDate, endDate]
    );

    const orders = ordersResult.rows;

    if (orders.length === 0) {
      // Create empty report
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      res.setHeader('Content-Type', 'application/pdf');
      const monthNames = ['', 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                          'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=Monatsbericht_${monthNames[month]}_${year}.pdf`
      );
      doc.pipe(res);

      doc.fontSize(20).fillColor('#2563EB').text('MEDWEG', 50, 50);
      doc.fontSize(16).fillColor('#1F2937').text(`Monatsbericht ${monthNames[month]} ${year}`, 50, 150);
      doc.fontSize(12).fillColor('#6B7280').text('Keine Bestellungen in diesem Monat.', 50, 200);

      doc.end();
      return;
    }

    // Calculate totals
    let totalRevenue = 0;
    let totalShippingCost = 0;
    let totalPurchaseCost = 0;

    for (const order of orders) {
      totalRevenue += Number(order.total_amount || 0);
      totalShippingCost += Number(order.selected_shipping_price || 0);

      // Get items for purchase cost calculation
      const itemsResult = await pool.query(
        'SELECT product_id, quantity, price_per_unit FROM order_items WHERE order_id = $1',
        [order.id]
      );

      for (const item of itemsResult.rows) {
        const productResult = await pool.query(
          'SELECT purchase_price FROM products WHERE id = $1',
          [item.product_id]
        );
        if (productResult.rows.length > 0) {
          totalPurchaseCost += Number(productResult.rows[0].purchase_price || 0) * Number(item.quantity);
        }
      }
    }

    const totalProfit = totalRevenue - totalPurchaseCost - totalShippingCost;

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    const monthNames = ['', 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Monatsbericht_${monthNames[month]}_${year}.pdf`
    );

    doc.pipe(res);

    // Header
    doc.fontSize(20).fillColor('#2563EB').text('MEDWEG', 50, 50);
    doc.fontSize(10).fillColor('#6B7280').text('Medizinische Versorgung', 50, 75);

    // Company Info (right side)
    doc.fontSize(9)
      .fillColor('#374151')
      .text(COMPANY_INFO.name, 350, 50)
      .text(COMPANY_INFO.address, 350, 65)
      .text(COMPANY_INFO.city, 350, 80);

    // Title
    doc.fontSize(24)
      .fillColor('#1F2937')
      .text(`Monatsbericht ${monthNames[month]} ${year}`, 50, 120);

    // Summary Box
    doc.fontSize(10).fillColor('#6B7280').text(`Zeitraum: ${startDate.toLocaleDateString('de-DE')} - ${endDate.toLocaleDateString('de-DE')}`, 50, 160);

    // Statistics
    const statsY = 200;

    // Revenue
    doc.rect(50, statsY, 240, 60).fill('#F0FDF4');
    doc.fontSize(12).fillColor('#10B981').text('Gesamtumsatz', 60, statsY + 15);
    doc.fontSize(20).fillColor('#059669').text(`€${totalRevenue.toFixed(2)}`, 60, statsY + 35);

    // Costs
    doc.rect(305, statsY, 240, 60).fill('#FEF2F2');
    doc.fontSize(12).fillColor('#EF4444').text('Gesamtkosten', 315, statsY + 15);
    doc.fontSize(20).fillColor('#DC2626').text(`€${(totalPurchaseCost + totalShippingCost).toFixed(2)}`, 315, statsY + 35);

    // Profit
    const profitY = statsY + 80;
    doc.rect(50, profitY, 495, 60).fill(totalProfit >= 0 ? '#DBEAFE' : '#FEE2E2');
    doc.fontSize(14).fillColor(totalProfit >= 0 ? '#1E40AF' : '#DC2626').text('Gewinn', 60, profitY + 15);
    doc.fontSize(24).fillColor(totalProfit >= 0 ? '#2563EB' : '#EF4444').text(`€${totalProfit.toFixed(2)}`, 60, profitY + 35);

    // Orders Table
    const tableTop = profitY + 100;
    doc.fontSize(14).fillColor('#1F2937').text('Bestellungen', 50, tableTop);

    // Table Header
    const tableHeaderY = tableTop + 30;
    doc.fontSize(9)
      .fillColor('#FFFFFF')
      .rect(50, tableHeaderY, 495, 20)
      .fill('#2563EB');

    doc.fillColor('#FFFFFF')
      .text('Bestellung #', 60, tableHeaderY + 6)
      .text('Datum', 150, tableHeaderY + 6)
      .text('Institution', 250, tableHeaderY + 6)
      .text('Betrag', 400, tableHeaderY + 6)
      .text('Status', 470, tableHeaderY + 6);

    // Table Rows
    let yPosition = tableHeaderY + 25;
    doc.fillColor('#374151');

    for (let i = 0; i < Math.min(orders.length, 20); i++) {
      const order = orders[i];
      const bgColor = i % 2 === 0 ? '#F9FAFB' : '#FFFFFF';
      doc.rect(50, yPosition, 495, 20).fill(bgColor);

      doc.fillColor('#374151')
        .fontSize(8)
        .text(`#${order.order_number}`, 60, yPosition + 6)
        .text(new Date(order.created_at).toLocaleDateString('de-DE'), 150, yPosition + 6)
        .text((order.institution_name || 'Unbekannt').substring(0, 25), 250, yPosition + 6)
        .text(`€${Number(order.total_amount).toFixed(2)}`, 400, yPosition + 6)
        .text(getStatusLabel(order.status), 470, yPosition + 6);

      yPosition += 20;

      // Check if we need a new page
      if (yPosition > 700 && i < orders.length - 1) {
        doc.addPage();
        yPosition = 50;
      }
    }

    if (orders.length > 20) {
      yPosition += 10;
      doc.fontSize(9).fillColor('#6B7280').text(`+ ${orders.length - 20} weitere Bestellungen`, 50, yPosition);
    }

    // Footer
    doc.fontSize(8).fillColor('#9CA3AF').text(
      `Bericht erstellt am: ${new Date().toLocaleDateString('de-DE')}`,
      50,
      750
    );

    doc.end();
  } catch (error) {
    throw error;
  }
};

// Helper function for status labels
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Gesendet',
    confirmed: 'Empfangen',
    shipped: 'Versandt',
    delivered: 'Geliefert',
    cancelled: 'Storniert',
  };
  return labels[status] || status;
}
