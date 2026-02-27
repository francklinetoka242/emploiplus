import { sendEmail } from '@config/mail.js';

/**
 * Service d'envoi d'emails
 * Gère l'envoi de différents types d'emails
 * Isolation: Si l'email échoue, cela doit être loggé mais ne pas affecter la logique métier
 */

/**
 * Envoyer un email de confirmation à un nouvel admin
 * @param adminEmail Email du nouvel admin
 * @param temporaryPassword Password temporaire généré
 * @param adminName Nom complet de l'admin
 */
export async function sendAdminConfirmation(
  adminEmail: string,
  temporaryPassword: string,
  adminName: string = 'Administrateur'
): Promise<boolean> {
  try {
    // Vérifier que les paramètres sont valides
    if (!adminEmail || !temporaryPassword) {
      console.error('❌ Erreur sendAdminConfirmation: Email ou password manquant');
      return false;
    }

    const backendUrl = process.env.BACKEND_URL || 'https://api.emploiplus-group.com';
    const loginUrl = `${backendUrl}/admin/login`;

    // Template HTML pour l'email
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="fr" style="margin: 0; padding: 0;">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 8px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 30px;
      color: #333333;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .greeting strong {
      color: #667eea;
    }
    .info-box {
      background-color: #f0f4ff;
      border-left: 4px solid #667eea;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-box .label {
      font-size: 12px;
      color: #666666;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .info-box .value {
      font-size: 14px;
      color: #333333;
      font-weight: 500;
      font-family: 'Courier New', monospace;
      word-break: break-all;
    }
    .password-warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
      font-size: 14px;
      color: #856404;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 12px 32px;
      border-radius: 4px;
      font-weight: 600;
      margin: 20px 0;
    }
    .instructions {
      background-color: #f9f9f9;
      border: 1px solid #e0e0e0;
      padding: 16px;
      border-radius: 4px;
      font-size: 14px;
      margin: 20px 0;
    }
    .instructions ol {
      margin: 10px 0;
      padding-left: 20px;
    }
    .instructions li {
      margin: 8px 0;
      line-height: 1.6;
    }
    .footer {
      background-color: #f4f4f4;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666666;
      border-top: 1px solid #e0e0e0;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background-color: #e0e0e0;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1>🔐 Nouvel Accès Administrateur</h1>
      <p>Emploi Connect Congo - Portail d'Administration</p>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">
        Bienvenue <strong>${escapeHtml(adminName)}</strong>,
      </div>

      <p>
        Votre compte administrateur a été créé avec succès sur la plateforme Emploi Connect Congo.
        Vous trouverez ci-dessous vos identifiants d'accès temporaires.
      </p>

      <!-- Credentials Box -->
      <div class="info-box">
        <div class="label">Email d'accès</div>
        <div class="value">${escapeHtml(adminEmail)}</div>
      </div>

      <div class="info-box">
        <div class="label">Mot de passe temporaire</div>
        <div class="value">${escapeHtml(temporaryPassword)}</div>
      </div>

      <!-- Warning -->
      <div class="password-warning">
        <strong>⚠️ Important:</strong> Ce mot de passe est temporaire. Vous devrez le changer immédiatement après votre première connexion.
      </div>

      <!-- Instructions -->
      <div class="instructions">
        <strong>📋 Étapes pour accéder à votre compte:</strong>
        <ol>
          <li>
            Allez sur le
            <a href="${escapeHtml(loginUrl)}" style="color: #667eea; text-decoration: none;">
              portail de connexion administrateur
            </a>
          </li>
          <li>Entrez votre email: <strong>${escapeHtml(adminEmail)}</strong></li>
          <li>Entrez le mot de passe temporaire ci-dessus</li>
          <li>Changez immédiatement votre mot de passe pour un mot de passe sécurisé</li>
          <li>Accédez au tableau de bord d'administration</li>
        </ol>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center;">
        <a href="${escapeHtml(loginUrl)}" class="cta-button">
          Accéder au portail
        </a>
      </div>

      <!-- Security Notice -->
      <div class="divider"></div>

      <div style="background-color: #f0f0f0; padding: 16px; border-radius: 4px; font-size: 13px; color: #555;">
        <strong>🔒 Recommandations de sécurité:</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Ne partagez jamais vos identifiants de connexion</li>
          <li>Utilisez un mot de passe fort et unique</li>
          <li>Activez l'authentification à deux facteurs si disponible</li>
          <li>Gardez votre navigateur à jour</li>
          <li>Ne vous connectez que depuis des appareils de confiance</li>
        </ul>
      </div>

      <!-- Support -->
      <p style="font-size: 14px; margin-top: 20px;">
        <strong>Besoin d'aide?</strong><br>
        Si vous rencontrez des problèmes pour accéder à votre compte, contactez l'équipe de support:
        <br>
        📧 <a href="mailto:support@emploiplus-group.com" style="color: #667eea; text-decoration: none;">support@emploiplus-group.com</a>
        <br>
        📞 <strong>${process.env.COMPANY_CONTACT || '+242 06 731 10 33'}</strong>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 0;">
        © 2026 Emploi Connect Congo. Tous droits réservés.
      </p>
      <p style="margin: 8px 0 0 0; font-size: 11px;">
        Cet email a été envoyé automatiquement. Veuillez ne pas répondre à cet email.
      </p>
      <p style="margin: 8px 0 0 0;">
        <a href="https://emploiplus-group.com" style="color: #667eea; text-decoration: none;">www.emploiplus-group.com</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Template texte simple
    const textTemplate = `
Nouvel Accès Administrateur
===========================

Bienvenue ${adminName},

Votre compte administrateur a été créé avec succès.

Vos identifiants:
- Email: ${adminEmail}
- Password temporaire: ${temporaryPassword}

IMPORTANT: Ce mot de passe est temporaire. Changez-le immédiatement après votre première connexion.

Accédez au portail: ${loginUrl}

Étapes:
1. Allez sur le portail de connexion
2. Entrez votre email: ${adminEmail}
3. Entrez le mot de passe temporaire
4. Changez votre mot de passe
5. Accédez au tableau de bord

Sécurité:
- Ne partagez jamais vos identifiants
- Utilisez un mot de passe fort et unique
- Gardez votre navigateur à jour

Support: support@emploiplus-group.com
Tel: ${process.env.COMPANY_CONTACT || '+242 06 731 10 33'}

---
© 2026 Emploi Connect Congo
    `;

    // Envoyer l'email
    const result = await sendEmail({
      to: adminEmail,
      subject: '🔐 Vos identifiants administrateur - Emploi Connect Congo',
      html: htmlTemplate,
      text: textTemplate,
      replyTo: 'support@emploiplus-group.com',
    });

    console.log(`✅ Email de confirmation envoyé à ${adminEmail}`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Erreur lors de l'envoi de l'email de confirmation à ${adminEmail}:`, message);
    // Important: On retourne false mais on ne lève pas d'erreur
    // Cela permet à la création d'admin de réussir même si l'email échoue
    return false;
  }
}

/**
 * Envoyer un email de réinitialisation de mot de passe
 * @param adminEmail Email de l'admin
 * @param resetToken Token de réinitialisation
 * @param adminName Nom de l'admin
 */
export async function sendPasswordResetEmail(
  adminEmail: string,
  resetToken: string,
  adminName: string = 'Administrateur'
): Promise<boolean> {
  try {
    if (!adminEmail || !resetToken) {
      console.error('❌ Erreur sendPasswordResetEmail: Email ou resetToken manquant');
      return false;
    }

    const backendUrl = process.env.BACKEND_URL || 'https://api.emploiplus-group.com';
    const resetUrl = `${backendUrl}/admin/reset-password/${resetToken}`;

    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; }
    .header { color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    .content { padding: 20px 0; color: #333; }
    .button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 32px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
    .footer { font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Réinitialisation du mot de passe</h1>
    </div>
    <div class="content">
      <p>Bonjour ${escapeHtml(adminName)},</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
      <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe:</p>
      <a href="${escapeHtml(resetUrl)}" class="button">Réinitialiser le mot de passe</a>
      <p>Ce lien expire dans 24 heures.</p>
      <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
    </div>
    <div class="footer">
      <p>© 2026 Emploi Connect Congo</p>
    </div>
  </div>
</body>
</html>
    `;

    await sendEmail({
      to: adminEmail,
      subject: 'Réinitialisation de votre mot de passe - Emploi Connect Congo',
      html: htmlTemplate,
      replyTo: 'support@emploiplus-group.com',
    });

    console.log(`✅ Email de réinitialisation envoyé à ${adminEmail}`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Erreur lors de l'envoi du reset email à ${adminEmail}:`, message);
    return false;
  }
}

/**
 * Fonction utilitaire pour échapper les caractères HTML
 */
function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default {
  sendAdminConfirmation,
  sendPasswordResetEmail,
};
