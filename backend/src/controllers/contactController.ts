import { Request, Response } from 'express';
import * as emailService from '../services/emailService';
import logger from '../utils/logger';
import { ValidationError } from '../types';

/**
 * Contact Form Controller
 * Handles contact form submissions from landing page
 */

/**
 * POST /api/contact
 * Submit contact form (public endpoint - no auth required)
 */
export const submitContactForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      throw new ValidationError('Alle Felder sind erforderlich');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Ungültige E-Mail-Adresse');
    }

    // Trim inputs
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    logger.info('Contact form submission received', {
      name: trimmedName,
      email: trimmedEmail,
      subject: trimmedSubject,
    });

    // Send notification to admin (service.medwegbavaria@gmail.com)
    await emailService.sendContactFormNotification(
      trimmedName,
      trimmedEmail,
      trimmedSubject,
      trimmedMessage
    );

    // Send auto-reply to sender
    await emailService.sendContactFormAutoReply(
      trimmedName,
      trimmedEmail,
      trimmedSubject
    );

    logger.info(' Contact form processed successfully', {
      name: trimmedName,
      email: trimmedEmail,
    });

    res.status(200).json({
      success: true,
      message: 'Nachricht erfolgreich gesendet. Wir werden uns in Kürze bei Ihnen melden.',
    });
  } catch (error: any) {
    logger.error(' Contact form submission failed', {
      error: error.message,
      stack: error.stack,
    });

    if (error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Fehler beim Senden der Nachricht. Bitte versuchen Sie es später erneut.',
    });
  }
};
