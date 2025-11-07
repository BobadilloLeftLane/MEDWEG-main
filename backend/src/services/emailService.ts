import logger from '../utils/logger';

/**
 * Email Service
 *
 * TRENUTNO: Mock verzija koja loguje u konzolu
 * KASNIJE: AWS SES integration kada bude pravi email
 */

const USE_MOCK = process.env.NODE_ENV === 'development' || !process.env.AWS_ACCESS_KEY_ID;

/**
 * Send Verification Email (6-digit code)
 * @param email - Recipient email
 * @param code - 6-digit verification code
 */
export const sendVerificationEmail = async (email: string, code: string): Promise<void> => {
  if (USE_MOCK) {
    // Mock verzija - loguj u konzolu
    logger.info('📧 [MOCK] Sending verification email', { email, code });
    console.log('\n' + '='.repeat(60));
    console.log('📧 VERIFICATION EMAIL (MOCK)');
    console.log('='.repeat(60));
    console.log(`To: ${email}`);
    console.log(`Subject: Verifizieren Sie Ihre E-Mail-Adresse`);
    console.log(`\nIhr Verifizierungscode lautet: ${code}`);
    console.log(`\nDieser Code ist 5 Minuten gültig.`);
    console.log('='.repeat(60) + '\n');
    return;
  }

  // TODO: AWS SES implementation
  // const params = {
  //   Source: process.env.SES_SENDER_EMAIL,
  //   Destination: { ToAddresses: [email] },
  //   Message: {
  //     Subject: { Data: 'Verifizieren Sie Ihre E-Mail-Adresse' },
  //     Body: {
  //       Html: { Data: `<p>Ihr Verifizierungscode lautet: <strong>${code}</strong></p>` }
  //     }
  //   }
  // };
  // await ses.sendEmail(params).promise();
};

/**
 * Send Password Reset Email
 * @param email - Recipient email
 * @param resetLink - Password reset link
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetLink: string
): Promise<void> => {
  if (USE_MOCK) {
    logger.info('📧 [MOCK] Sending password reset email', { email });
    console.log('\n' + '='.repeat(60));
    console.log('📧 PASSWORD RESET EMAIL (MOCK)');
    console.log('='.repeat(60));
    console.log(`To: ${email}`);
    console.log(`Subject: Passwort zurücksetzen`);
    console.log(`\nKlicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen:`);
    console.log(`${resetLink}`);
    console.log(`\nDieser Link ist 30 Minuten gültig.`);
    console.log('='.repeat(60) + '\n');
    return;
  }

  // TODO: AWS SES implementation
};

/**
 * Send New Order Notification (Admin App)
 * @param adminEmail - Admin email
 * @param orderDetails - Order info
 */
export const sendNewOrderNotification = async (
  adminEmail: string,
  orderDetails: {
    institutionName: string;
    patientName: string;
    orderId: string;
  }
): Promise<void> => {
  if (USE_MOCK) {
    logger.info('📧 [MOCK] Sending new order notification', { adminEmail, orderDetails });
    console.log('\n' + '='.repeat(60));
    console.log('📧 NEW ORDER NOTIFICATION (MOCK)');
    console.log('='.repeat(60));
    console.log(`To: ${adminEmail}`);
    console.log(`Subject: Neue Bestellung eingegangen`);
    console.log(`\nEinrichtung: ${orderDetails.institutionName}`);
    console.log(`Patient: ${orderDetails.patientName}`);
    console.log(`Bestell-ID: ${orderDetails.orderId}`);
    console.log(`\nZur Bestellung: http://localhost:3000/dashboard/orders/${orderDetails.orderId}`);
    console.log('='.repeat(60) + '\n');
    return;
  }

  // TODO: AWS SES implementation
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
  if (USE_MOCK) {
    logger.info('📧 [MOCK] Sending order approved notification', { email, orderDetails });
    console.log('\n' + '='.repeat(60));
    console.log('📧 ORDER APPROVED NOTIFICATION (MOCK)');
    console.log('='.repeat(60));
    console.log(`To: ${email}`);
    console.log(`Subject: Bestellung wurde genehmigt`);
    console.log(`\nIhre Bestellung für Patient ${orderDetails.patientName} wurde genehmigt.`);
    console.log(`Bestell-ID: ${orderDetails.orderId}`);
    console.log('='.repeat(60) + '\n');
    return;
  }

  // TODO: AWS SES implementation
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
  if (USE_MOCK) {
    logger.info('📧 [MOCK] Sending order reminder', { email, patientsCount: patients.length });
    console.log('\n' + '='.repeat(60));
    console.log('📧 ORDER REMINDER (MOCK)');
    console.log('='.repeat(60));
    console.log(`To: ${email}`);
    console.log(`Subject: Erinnerung: Geplante Bestellungen bestätigen`);
    console.log(`\nDie folgenden geplanten Bestellungen stehen in 10 Tagen an:\n`);
    patients.forEach((p, i) => {
      console.log(`${i + 1}. Patient: ${p.name} - Datum: ${p.scheduledDate}`);
    });
    console.log(`\nBitte bestätigen Sie die Bestellungen.`);
    console.log('='.repeat(60) + '\n');
    return;
  }

  // TODO: AWS SES implementation
};
