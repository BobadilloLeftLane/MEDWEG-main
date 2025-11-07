import { Request, Response } from 'express';
import * as invoiceService from '../services/invoiceService';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';

/**
 * Invoice Controller
 * HTTP handlers za generisanje računa
 */

/**
 * GET /api/v1/invoices/:orderId
 * Generate and download invoice PDF for an order
 */
export const generateInvoice = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthRequest;
  const { orderId } = req.params;
  const institutionId = authReq.user?.institutionId;

  if (!institutionId) {
    res.status(403).json({ success: false, error: 'Keine Institution zugeordnet' });
    return;
  }

  logger.info('Generating invoice PDF', { orderId, institutionId });

  // Generate PDF
  const { stream, filename } = await invoiceService.generateInvoicePDF(orderId, institutionId);

  // Set response headers for PDF download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  // Pipe PDF stream to response
  stream.pipe(res);

  stream.on('end', () => {
    logger.info('Invoice PDF sent successfully', { orderId, filename });
  });

  stream.on('error', (error) => {
    logger.error('Error streaming invoice PDF', { orderId, error });
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Fehler beim Generieren der Rechnung' });
    }
  });
});
