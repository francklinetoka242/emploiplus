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
const sendAdminMail = async (email: string, prenom: string, nom: string, token: string, isInvite = false) => {
  const url = `${FRONTEND_URL}/admin/verify-email?token=${token}`;
  const subject = isInvite ? "Bienvenue - Emploi Connect Congo" : "Confirmer votre email";
  const html = `<h2>${isInvite ? 'Bienvenue' : 'Confirmation'}</h2>
                <p>Bonjour ${prenom} ${nom}, merci de valider votre email :</p>
                <a href="${url}" style="background:#4CAF50;color:white;padding:10px;text-decoration:none;">Confirmer mon compte</a>`;
  
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
      `INSERT INTO public.admins (last_name, first_name, email, password, role, verification_token, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING id, email, last_name, first_name, role`,
      [data.nom, data.prenom, data.email.toLowerCase(), hashedPassword, data.role, token]
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