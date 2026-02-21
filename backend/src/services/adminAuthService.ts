import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "emploi_connect_congo_secret_2025";
const FRONTEND_URL = process.env.FRONTEND_URL || "https://emploiplus-group.com";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
});

// Helper pour l'envoi d'email (évite la répétition)
// Helper pour l'envoi d'email avec mise en forme professionnelle
const sendAdminMail = async (email: string, prenom: string, nom: string, token: string, isInvite = false) => {
  const url = `${FRONTEND_URL}/admin/verify-email?token=${token}`;
  const subject = isInvite ? "Bienvenue - Emploi Connect Congo" : "Confirmer votre email";
  
  // Couleurs basées sur le logo : Bleu (#00008B approx) et Jaune/Or (#E6A700)
  const mainBlue = "#001299"; 
  const logoGold = "#E6A700";

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
      <div style="background-color: ${mainBlue}; padding: 25px; text-align: center; border-bottom: 5px solid ${logoGold};">
        <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 1px;">EMPLOIPLUS-GROUP</h1>
      </div>

      <div style="padding: 40px 30px; background-color: #ffffff;">
        <h2 style="color: ${mainBlue}; margin-top: 0;">${isInvite ? 'Bienvenue parmi nous !' : 'Vérification de votre compte'}</h2>
        <p style="font-size: 16px;">Bonjour <strong>${prenom} ${nom}</strong>,</p>
        <p style="font-size: 15px; color: #555;">
          ${isInvite 
            ? "Un compte administrateur a été créé pour vous sur la plateforme Emploi Connect Congo. Pour commencer à gérer les opportunités, veuillez activer votre accès ci-dessous :" 
            : "Merci de votre inscription sur Emploi Connect Congo. Afin de sécuriser votre accès et finaliser la création de votre compte, merci de valider votre adresse email."
          }
        </p>

        <div style="text-align: center; margin: 35px 0;">
          <a href="${url}" style="background-color: ${logoGold}; color: ${mainBlue}; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            ${isInvite ? 'ACTIVER MON COMPTE' : 'CONFIRMER MON EMAIL'}
          </a>
        </div>

        <p style="font-size: 13px; color: #888; text-align: center;">
          Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
          <a href="${url}" style="color: ${mainBlue};">${url}</a>
        </p>
      </div>

      <div style="background-color: #f9f9f9; padding: 25px; border-top: 1px solid #eee; font-size: 13px; color: #666;">
        <div style="margin-bottom: 15px;">
          <strong>📍 Adresse :</strong> Brazzaville, République du Congo<br>
          <strong>📞 Téléphone :</strong> +242 06 731 10 33
        </div>
        <div style="border-top: 1px dashed #ccc; padding-top: 15px;">
          <strong>📧 Contact :</strong> <a href="mailto:contact@emploiplus-group.com" style="color: ${mainBlue}; text-decoration: none;">contact@emploiplus-group.com</a><br>
          <strong>🛠️ Support technique :</strong> <a href="mailto:support@emploiplus-group.com" style="color: ${mainBlue}; text-decoration: none;">support@emploiplus-group.com</a>
        </div>
        <div style="margin-top: 20px; text-align: center; font-size: 11px; color: #bbb;">
          &copy; 2026 Emploi Connect Congo. Tous droits réservés.
        </div>
      </div>
    </div>
  `;
  
  return transporter.sendMail({ from: process.env.SMTP_FROM, to: email, subject, html });
};

export const registerAdmin = async (data: any, isCreatedBySuper = false) => {
  try {
    if (data.password.length < 6) return { success: false, message: "Mot de passe trop court (min 6)" };

    const { rows: existing } = await pool.query("SELECT id FROM admins WHERE email = $1", [data.email.toLowerCase()]);
    if (existing.length > 0) return { success: false, message: "Email déjà utilisé" };

    const hashedPassword = bcrypt.hashSync(data.password, 10);
    const token = crypto.randomBytes(32).toString("hex");

    // Insertion DB
    const { rows } = await pool.query(
      `INSERT INTO public.admins (first_name, last_name, email, password, role, verification_token, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING id, email, first_name, last_name, role`,
      [data.prenom, data.nom, data.email.toLowerCase(), hashedPassword, data.role, token]
    );

    const admin = rows[0];
    await sendAdminMail(admin.email, admin.first_name, admin.last_name, token, isCreatedBySuper);

    return { success: true, message: "Admin créé, email de confirmation envoyé.", admin };
  } catch (error) {
    console.error("❌ Registration Error:", error);
    return { success: false, message: "Erreur lors de la création" };
  }
};

export const loginAdmin = async (email: string, password: string) => {
  try {
    const { rows } = await pool.query("SELECT * FROM admins WHERE email = $1", [email.toLowerCase()]);
    const admin = rows[0];

    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return { success: false, message: "Email ou mot de passe incorrect" };
    }

    if (!admin.is_verified) return { success: false, message: "Veuillez vérifier votre email" };

    const token = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: "7d" });
    const { password: _, verification_token: __, ...safeAdmin } = admin;

    return { success: true, token, admin: safeAdmin };
  } catch (error) {
    return { success: false, message: "Erreur de connexion" };
  }
};

export const verifyEmailToken = async (token: string) => {
  try {
    const { rows } = await pool.query(
      "UPDATE admins SET is_verified = true, verification_token = NULL WHERE verification_token = $1 RETURNING id",
      [token]
    );

    if (rows.length === 0) return { success: false, message: "Token invalide ou expiré" };
    return { success: true, message: "Email confirmé avec succès !" };
  } catch (error) {
    return { success: false, message: "Erreur de vérification" };
  }
};

export const createAdminBySuperAdmin = async (data: any, createdById?: number) => {
  try {
    // Delegate to registerAdmin but mark as created by super admin.
    // In future we can record `createdById` in audit logs or set different defaults.
    return await registerAdmin(data, true);
  } catch (error) {
    console.error('❌ createAdminBySuperAdmin error:', error);
    return { success: false, message: 'Erreur lors de la création par super admin' };
  }
};