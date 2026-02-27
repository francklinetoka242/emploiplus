import nodemailer, { Transporter } from 'nodemailer';

/**
 * Configuration SMTP pour l'envoi d'emails
 * Utilise nodemailer avec les identifiants du .env
 */

let transporter: Transporter | null = null;

/**
 * Initialiser le transporteur SMTP
 * À appeler au démarrage de l'application
 */
export async function initializeMailTransporter(): Promise<Transporter | null> {
  try {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const smtpSecure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1';

    // Vérifier que les identifiants sont configurés
    if (!smtpHost || !smtpUser || !smtpPassword) {
      console.warn('⚠️  Configuration SMTP incomplète - variables d\'environnement manquantes');
      console.warn(`   SMTP_HOST: ${smtpHost ? '✅' : '❌'}`);
      console.warn(`   SMTP_USER: ${smtpUser ? '✅' : '❌'}`);
      console.warn(`   SMTP_PASSWORD: ${smtpPassword ? '✅' : '❌'}`);
      return null;
    }

    // Créer le transporteur
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
      // Options supplémentaires
      pool: {
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 4000,
        rateLimit: 14,
      },
      logger: process.env.NODE_ENV === 'development',
      debug: process.env.NODE_ENV === 'development',
    } as any);

    // Vérifier la connexion
    try {
      await transporter.verify();
      console.log('✅ Configuration SMTP vérifiée avec succès');
      console.log(`   Host: ${smtpHost}:${smtpPort}`);
      console.log(`   User: ${smtpUser}`);
      console.log(`   Secure: ${smtpSecure}`);
    } catch (verifyError) {
      console.warn('⚠️  Erreur de vérification SMTP (mais le service continuera):');
      console.warn(`   ${verifyError instanceof Error ? verifyError.message : 'Unknown error'}`);
      // Ne pas retourner null - laisser le transporter tenter de se connecter plus tard
    }

    return transporter;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation du transporteur SMTP:', error);
    return null;
  }
}

/**
 * Obtenir le transporteur SMTP
 * @returns Le transporteur nodemailer ou null si pas configuré
 */
export function getMailTransporter(): Transporter | null {
  return transporter;
}

/**
 * Interface pour les options d'email
 */
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Envoyer un email
 * @param options Options d'email
 * @returns Info de l'email envoyé ou null si erreur
 */
export async function sendEmail(options: EmailOptions) {
  try {
    if (!transporter) {
      console.warn('⚠️  Transporteur SMTP non disponible - tentative de réinitialisation');
      await initializeMailTransporter();
      if (!transporter) {
        throw new Error('Transporteur SMTP non configuré');
      }
    }

    const mailOptions = {
      from: options.from || process.env.SMTP_FROM || 'noreply@emploiplus-group.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Email envoyé:');
      console.log(`   À: ${options.to}`);
      console.log(`   Sujet: ${options.subject}`);
      console.log(`   Message ID: ${info.messageId}`);
    }

    return info;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Erreur lors de l\'envoi d\'email:', message);
    throw error;
  }
}

export default {
  initializeMailTransporter,
  getMailTransporter,
  sendEmail,
};
