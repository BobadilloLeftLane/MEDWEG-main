import nodemailer from 'nodemailer';
import logger from '../utils/logger';

/**
 * Email Service
 * Gmail SMTP with professional German templates
 */

// Create Gmail transporter with App Password (2FA enabled)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // false for TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// SMTP verification DISABLED to prevent SEGFAULT crashes
// The transporter.verify() call was causing exit code 139 (SEGFAULT) in production
// Email service will still work for sending emails, we just skip the startup verification
logger.warn('[EMAIL] SMTP verification disabled - email service may not work if credentials are invalid');
logger.info('[EMAIL] Email service initialized (verification skipped)');

/**
 * Send Verification Email (6-digit code)
 * Professional German template with logo and countdown timer
 */
export const sendVerificationEmail = async (email: string, code: string): Promise<void> => {
  const expiryMinutes = process.env.EMAIL_VERIFICATION_CODE_EXPIRY_MINUTES || '10';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; }
        .header { background: linear-gradient(135deg, #009688 0%, #00BCD4 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .logo { max-width: 250px; height: auto; margin-bottom: 15px; background: white; padding: 15px; border-radius: 8px; display: block; margin-left: auto; margin-right: auto; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .code-box { background: white; border: 3px solid #009688; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0; box-shadow: 0 4px 12px rgba(0, 150, 136, 0.15); }
        .code { font-size: 36px; font-weight: bold; color: #009688; letter-spacing: 10px; font-family: 'Courier New', monospace; }
        .timer-box { background: #fff3cd; border-left: 5px solid #ffc107; padding: 18px; margin: 25px 0; border-radius: 8px; }
        .timer-text { font-size: 16px; font-weight: 600; color: #856404; margin: 0; }
        .timer-countdown { font-size: 24px; font-weight: bold; color: #d32f2f; margin: 10px 0 0 0; }
        .resend-box { background: #e3f2fd; border-left: 5px solid #2196F3; padding: 18px; margin: 25px 0; border-radius: 8px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #ddd; margin-top: 20px; }
        .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="cid:logo" alt="MEDWEG Bavaria Logo" class="logo" />
          <h1>E-Mail Verifizierung</h1>
          <p style="margin: 5px 0 0 0; font-size: 16px;">Willkommen bei MEDWEG Bavaria!</p>
        </div>

        <div class="content">
          <h2 style="color: #009688; margin-top: 0;">Herzlich Willkommen!</h2>

          <p style="font-size: 15px;">Vielen Dank für Ihre Registrierung bei <strong>MEDWEG Bavaria</strong> - Ihrem zuverlässigen Partner für medizinische Versorgung.</p>

          <p style="font-size: 15px;">Um Ihr Konto zu aktivieren, geben Sie bitte den folgenden <strong>6-stelligen Verifizierungscode</strong> in der Anwendung ein:</p>

          <div class="code-box">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Ihr Verifizierungscode:</p>
            <div class="code">${code}</div>
          </div>

          <div class="timer-box">
            <p class="timer-text">⏱ Wichtiger Hinweis:</p>
            <p class="timer-countdown">Dieser Code ist ${expiryMinutes} Minuten gültig</p>
            <p style="margin: 10px 0 0 0; font-size: 13px; color: #856404;">
              Nach Ablauf der Zeit wird der Code ungültig und Sie müssen einen neuen anfordern.
            </p>
          </div>

          <div class="resend-box">
            <p style="margin: 0; font-size: 14px; color: #1565C0;">
              <strong> Code nicht erhalten?</strong><br>
              Sie können in der Anwendung auf "Erneut senden" klicken, um einen neuen Code zu erhalten.
            </p>
          </div>

          <p style="font-size: 14px; color: #666;">Falls Sie diese E-Mail nicht angefordert haben, können Sie sie einfach ignorieren. Ihr Konto wird nicht aktiviert, ohne dass Sie den Code eingeben.</p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <div class="feature-list">
            <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #009688;">
               Was Sie bei MEDWEG erwartet:
            </p>
            <p style="color: #666; font-size: 14px; margin: 0; line-height: 1.8;">
              • Höchste Qualitätsstandards nach EU-Richtlinien<br>
              • Schnelle und zuverlässige Lieferung in ganz Deutschland<br>
              • Persönlicher Service für Ihre Einrichtung<br>
              • Automatisierte Bestellabwicklung und wiederkehrende Bestellungen<br>
              • Transparente Verwaltung über Ihr digitales Dashboard
            </p>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0 0 10px 0;"><strong>MEDWEG Bavaria</strong></p>
          <p style="margin: 5px 0;">Augsburg, Deutschland</p>
          <p style="margin: 5px 0;"> E-Mail: <a href="mailto:service.medwegbavaria@gmail.com" style="color: #009688; text-decoration: none;">service.medwegbavaria@gmail.com</a></p>
          <p style="margin-top: 20px; color: #999; font-size: 11px;">
            Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese Nachricht.<br>
            Bei Fragen wenden Sie sich bitte an unseren Support.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: email,
    subject: ' Verifizieren Sie Ihre E-Mail-Adresse - MEDWEG Bavaria',
    html: htmlContent,
    attachments: [
      {
        filename: 'medwegbavaria_logo.jpg',
        path: 'public/assets/medwegbavaria_logo.jpg',
        cid: 'logo', // same as src="cid:logo" in HTML
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(' Verification email sent', { email });
  } catch (error) {
    logger.error(' Failed to send verification email', { email, error });
    throw new Error('E-Mail konnte nicht gesendet werden');
  }
};

/**
 * Send Welcome Email (after successful verification)
 * Professional German template with next steps
 */
export const sendWelcomeEmail = async (email: string, institutionName: string): Promise<void> => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #009688 0%, #00BCD4 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 32px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-badge { background: #4CAF50; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .feature-box { background: white; border-left: 4px solid #009688; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .cta-button { background: #009688; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="cid:logo" alt="MEDWEG Bavaria Logo" style="max-width: 250px; height: auto; margin-bottom: 15px; background: white; padding: 15px; border-radius: 8px; display: block; margin-left: auto; margin-right: auto;" />
          <h1> Willkommen bei MEDWEG!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">Ihr Konto wurde erfolgreich aktiviert</p>
        </div>

        <div class="content">
          <div class="success-badge">
            <h2 style="margin: 0;"> Herzlich willkommen, ${institutionName}!</h2>
          </div>

          <p style="font-size: 16px;">Vielen Dank, dass Sie sich für MEDWEG Bavaria entschieden haben. Wir freuen uns auf die zukünftige Zusammenarbeit!</p>

          <h3 style="color: #009688; margin-top: 30px;"> Ihre nächsten Schritte:</h3>

          <div class="feature-box">
            <strong>1⃣ Dashboard erkunden</strong><br>
            Melden Sie sich an und entdecken Sie alle Funktionen Ihres persönlichen Dashboards.
          </div>

          <div class="feature-box">
            <strong>2⃣ Patienten anlegen</strong><br>
            Fügen Sie Ihre Patienten hinzu und verwalten Sie deren Bestellungen zentral.
          </div>

          <div class="feature-box">
            <strong>3⃣ Erste Bestellung aufgeben</strong><br>
            Wählen Sie aus unserem hochwertigen Sortiment medizinischer Produkte.
          </div>

          <div class="feature-box">
            <strong>4⃣ Automatisierung einrichten</strong><br>
            Nutzen Sie wiederkehrende Bestellungen für maximale Effizienz.
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login" class="cta-button">
              Jetzt anmelden →
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <h3 style="color: #009688;"> Was Sie bei uns erwartet:</h3>

          <p>
             <strong>Premium Qualität:</strong> Alle Produkte erfüllen höchste medizinische Standards<br>
             <strong>Schnelle Lieferung:</strong> Zuverlässige und pünktliche Zustellung<br>
             <strong>Persönlicher Service:</strong> Unser Team steht Ihnen jederzeit zur Verfügung<br>
             <strong>Digitale Verwaltung:</strong> Komplette Transparenz über Bestellungen und Statistiken
          </p>

          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <strong> Brauchen Sie Hilfe?</strong><br>
            Unser Support-Team ist für Sie da:<br>
            E-Mail: <a href="mailto:service.medwegbavaria@gmail.com">service.medwegbavaria@gmail.com</a>
          </div>
        </div>

        <div class="footer">
          <p><strong>MEDWEG Bavaria</strong></p>
          <p>Ihr zuverlässiger Partner für medizinische Versorgung</p>
          <p>Augsburg, Deutschland</p>
          <p style="margin-top: 15px; color: #999;">
            © ${new Date().getFullYear()} MEDWEG Bavaria. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: email,
    subject: ' Willkommen bei MEDWEG Bavaria - Ihr Konto ist aktiviert!',
    html: htmlContent,
    attachments: [
      {
        filename: 'medwegbavaria_logo.jpg',
        path: 'public/assets/medwegbavaria_logo.jpg',
        cid: 'logo',
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(' Welcome email sent', { email });
  } catch (error) {
    logger.error(' Failed to send welcome email', { email, error });
    // Don't throw - welcome email failure shouldn't block verification
  }
};

/**
 * Send Admin Notification (New User Verified)
 * Sends notification to service.medwegbavaria@gmail.com when new user verifies email
 */
export const sendAdminNewUserNotification = async (
  userName: string,
  userEmail: string
): Promise<void> => {
  const adminEmail = 'service.medwegbavaria@gmail.com';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; }
        .header { background: linear-gradient(135deg, #2196F3 0%, #00BCD4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; border-left: 4px solid #2196F3; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .user-details { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1> Neue Benutzerregistrierung</h1>
          <p style="margin: 5px 0 0 0;">Ein neuer Kunde hat sich erfolgreich verifiziert</p>
        </div>

        <div class="content">
          <div class="info-box">
            <h3 style="margin: 0 0 15px 0; color: #2196F3;"> Benutzerdetails:</h3>
            <div class="user-details">
              <p style="margin: 8px 0;"><strong>Institution:</strong> ${userName}</p>
              <p style="margin: 8px 0;"><strong>E-Mail:</strong> ${userEmail}</p>
              <p style="margin: 8px 0;"><strong>Zeitpunkt:</strong> ${new Date().toLocaleString('de-DE', {
                timeZone: 'Europe/Berlin',
                dateStyle: 'full',
                timeStyle: 'short'
              })}</p>
              <p style="margin: 8px 0;"><strong>Status:</strong> <span style="color: #4CAF50; font-weight: 600;"> E-Mail verifiziert</span></p>
            </div>
          </div>

          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 18px; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 0; color: #856404;">
              <strong> Hinweis:</strong> Der Benutzer wartet möglicherweise auf die Freischaltung durch einen Administrator im Admin-Dashboard.
            </p>
          </div>

          <p style="font-size: 14px; color: #666;">
            Diese Benachrichtigung wurde automatisch generiert, um Sie über neue Registrierungen zu informieren.
          </p>
        </div>

        <div class="footer">
          <p><strong>MEDWEG Bavaria - Admin System</strong></p>
          <p style="color: #999; font-size: 11px;">
            Diese E-Mail wurde automatisch vom MEDWEG System generiert.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: adminEmail,
    subject: ` Neue Registrierung: ${userName}`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(' Admin notification sent for new user', { userName, userEmail });
  } catch (error) {
    logger.error(' Failed to send admin notification', { userName, userEmail, error });
    // Don't throw - admin notification failure shouldn't block user verification
  }
};

/**
 * Send Password Reset Email
 */
export const sendPasswordResetEmail = async (
  email: string,
  _resetLink: string
): Promise<void> => {
  // Keep existing implementation or update later
  logger.info('Password reset email (to be implemented)', { email });
};

/**
 * Send New Order Notification (Admin App)
 * Sends notification to service.medwegbavaria@gmail.com when new order is created
 */
export const sendNewOrderNotification = async (): Promise<void> => {
  const adminEmail = 'service.medwegbavaria@gmail.com';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; }
        .header { background: linear-gradient(135deg, #FF9800 0%, #F44336 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 40px 30px; border-radius: 0 0 10px 10px; text-align: center; }
        .icon { font-size: 64px; margin: 20px 0; }
        .cta-button { background: #FF9800; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 30px 0; font-weight: bold; font-size: 16px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 32px;"> Neue Bestellung!</h1>
        </div>

        <div class="content">
          <div class="icon"></div>

          <h2 style="color: #FF9800; margin: 20px 0;">Eine neue Bestellung ist eingegangen</h2>

          <p style="font-size: 16px; color: #666; margin: 20px 0;">
            Ein Kunde hat gerade eine neue Bestellung aufgegeben.<br>
            Bitte loggen Sie sich in die Admin-Anwendung ein, um die Details zu sehen.
          </p>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/orders" class="cta-button">
               Jetzt anmelden und prüfen
            </a>
          </div>

          <p style="font-size: 14px; color: #999; margin-top: 40px;">
            Diese E-Mail wurde automatisch vom MEDWEG System generiert.
          </p>
        </div>

        <div class="footer">
          <p style="margin: 5px 0;"><strong>MEDWEG Bavaria</strong></p>
          <p style="margin: 5px 0; color: #999; font-size: 11px;">
            Ihr B2B Partner für medizinische Versorgung
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: adminEmail,
    subject: ' MEDWEG - Neue Bestellung eingegangen',
    html: htmlContent,
  };

  try {
    logger.info('Sending new order notification to admin...');

    await transporter.sendMail(mailOptions);

    logger.info(' Admin order notification sent successfully');
  } catch (error) {
    logger.error(' Failed to send admin order notification', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    // Don't throw - admin notification failure shouldn't block order creation
  }
};

/**
 * Send Order Approved Notification (Admin Institution)
 * @param email - Institution admin email
 * @param orderDetails - Order info
 */
export const sendOrderApprovedNotification = async (
  email: string,
  orderDetails: {
    patientName: string;
    orderId: string;
  }
): Promise<void> => {
  // TODO: Implement with Gmail SMTP or keep as mock for now
  logger.info(' Order approved notification', { email, orderDetails });
};

/**
 * Send Order Reminder (10 days before scheduled order)
 * @param email - Institution admin email
 * @param patients - List of patients with scheduled orders
 */
export const sendOrderReminder = async (
  email: string,
  patients: Array<{ name: string; scheduledDate: string }>
): Promise<void> => {
  // TODO: Implement with Gmail SMTP or keep as mock for now
  logger.info(' Order reminder', { email, patientsCount: patients.length });
};

/**
 * Send Contact Form Notification to Admin
 * Sends notification to service.medwegbavaria@gmail.com when someone submits contact form
 */
export const sendContactFormNotification = async (
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<void> => {
  const adminEmail = 'service.medwegbavaria@gmail.com';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; }
        .header { background: linear-gradient(135deg, #009688 0%, #00BCD4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .logo { max-width: 200px; height: auto; margin-bottom: 15px; background: white; padding: 15px; border-radius: 8px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; border-left: 4px solid #009688; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .message-box { background: #e0f2f1; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #009688; }
        .contact-details { background: #fff9e6; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="cid:logo" alt="MEDWEG Bavaria Logo" class="logo" />
          <h1 style="margin: 10px 0 0 0;"> Neue Kontaktanfrage</h1>
          <p style="margin: 5px 0 0 0;">Landing Page Kontaktformular</p>
        </div>

        <div class="content">
          <div class="info-box">
            <h3 style="margin: 0 0 15px 0; color: #009688;"> Absenderinformationen:</h3>
            <div class="contact-details">
              <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 8px 0;"><strong>E-Mail:</strong> <a href="mailto:${email}">${email}</a></p>
              <p style="margin: 8px 0;"><strong>Betreff:</strong> ${subject}</p>
              <p style="margin: 8px 0;"><strong>Zeitpunkt:</strong> ${new Date().toLocaleString('de-DE', {
                timeZone: 'Europe/Berlin',
                dateStyle: 'full',
                timeStyle: 'short'
              })}</p>
            </div>
          </div>

          <div class="message-box">
            <h3 style="margin: 0 0 15px 0; color: #009688;"> Nachricht:</h3>
            <p style="white-space: pre-wrap; margin: 0; font-size: 15px; line-height: 1.6;">${message}</p>
          </div>

          <div style="background: #e3f2fd; border-left: 4px solid #2196F3; padding: 18px; margin: 20px 0; border-radius: 8px;">
            <p style="margin: 0; color: #1565C0;">
              <strong> Hinweis:</strong> Eine automatische Bestätigungsmail wurde an ${email} gesendet.
            </p>
          </div>

          <p style="font-size: 14px; color: #666;">
            Bitte antworten Sie zeitnah auf diese Anfrage, um einen professionellen Kundenservice zu gewährleisten.
          </p>
        </div>

        <div class="footer">
          <p><strong>MEDWEG Bavaria - Kontaktsystem</strong></p>
          <p style="color: #999; font-size: 11px;">
            Diese E-Mail wurde automatisch vom MEDWEG Landing Page System generiert.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: adminEmail,
    replyTo: email, // Allow admin to reply directly to sender
    subject: ` Neue Kontaktanfrage: ${subject}`,
    html: htmlContent,
    attachments: [
      {
        filename: 'medwegbavaria_logo.jpg',
        path: 'public/assets/medwegbavaria_logo.jpg',
        cid: 'logo',
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(' Contact form notification sent to admin', { name, email, subject });
  } catch (error) {
    logger.error(' Failed to send contact form notification', { name, email, error });
    throw error; // Throw error so contact form submission fails if email can't be sent
  }
};

/**
 * Send Contact Form Auto-Reply to Sender
 * Sends automatic confirmation to person who submitted contact form
 */
export const sendContactFormAutoReply = async (
  name: string,
  email: string,
  subject: string
): Promise<void> => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; }
        .header { background: linear-gradient(135deg, #009688 0%, #00BCD4 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .logo { max-width: 250px; height: auto; margin-bottom: 15px; background: white; padding: 15px; border-radius: 8px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-box { background: #e8f5e9; border-left: 4px solid #4CAF50; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #ddd; }
        .contact-info { background: #e0f2f1; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #ddd; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="cid:logo" alt="MEDWEG Bavaria Logo" class="logo" />
          <h1 style="margin: 10px 0 0 0;">Vielen Dank für Ihre Nachricht!</h1>
          <p style="margin: 5px 0 0 0; font-size: 16px;">Wir haben Ihre Anfrage erhalten</p>
        </div>

        <div class="content">
          <p style="font-size: 16px; margin-top: 0;">Sehr geehrte/r ${name},</p>

          <div class="success-box">
            <p style="margin: 0; font-size: 15px; color: #2e7d32;">
              <strong> Ihre Nachricht wurde erfolgreich übermittelt!</strong>
            </p>
          </div>

          <p style="font-size: 15px;">
            Vielen Dank, dass Sie sich mit uns in Verbindung gesetzt haben. Wir haben Ihre Anfrage zum Thema
            "<strong>${subject}</strong>" erhalten und werden uns <strong>so schnell wie möglich</strong> bei Ihnen melden.
          </p>

          <div class="info-box">
            <h3 style="margin: 0 0 15px 0; color: #009688;">⏱ Was passiert als Nächstes?</h3>
            <p style="margin: 8px 0; font-size: 14px;">
               Unser Team prüft Ihre Anfrage<br>
               Sie erhalten in der Regel innerhalb von <strong>24 Stunden</strong> eine Antwort<br>
               Bei dringenden Anliegen kontaktieren Sie uns bitte telefonisch
            </p>
          </div>

          <div class="contact-info">
            <h3 style="margin: 0 0 15px 0; color: #009688;"> Kontaktinformationen:</h3>
            <p style="margin: 8px 0; font-size: 14px;">
              <strong>MedWeg Bavaria</strong><br>
               Augsburg, Bayern<br>
               E-Mail: <a href="mailto:medwegbavaria@gmail.com" style="color: #009688;">medwegbavaria@gmail.com</a><br>
               Telefon: +4915238941718<br>
               Öffnungszeiten: Mo-Fr, 9:00-18:00 Uhr
            </p>
          </div>

          <p style="font-size: 14px; color: #666; margin-bottom: 0;">
            Falls Sie weitere Fragen haben, zögern Sie nicht, uns erneut zu kontaktieren.
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <p style="font-size: 15px; text-align: center; color: #009688; font-weight: 600; margin: 20px 0;">
            Wir freuen uns darauf, mit Ihnen zusammenzuarbeiten!
          </p>
        </div>

        <div class="footer">
          <p style="margin: 5px 0;"><strong>MEDWEG Bavaria</strong></p>
          <p style="margin: 5px 0;">Ihr zuverlässiger Partner für medizinische Versorgung</p>
          <p style="color: #999; font-size: 11px; margin-top: 15px;">
            Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.<br>
            Bei Fragen kontaktieren Sie uns unter service.medwegbavaria@gmail.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: email,
    subject: `Bestätigung: Ihre Anfrage bei MEDWEG Bavaria`,
    html: htmlContent,
    attachments: [
      {
        filename: 'medwegbavaria_logo.jpg',
        path: 'public/assets/medwegbavaria_logo.jpg',
        cid: 'logo',
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(' Contact form auto-reply sent', { name, email });
  } catch (error) {
    logger.error(' Failed to send contact form auto-reply', { name, email, error });
    // Don't throw - auto-reply failure shouldn't block the main notification
  }
};
