// backend/src/services/adminAuthService.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";
import nodemailer from "nodemailer";
import crypto from "crypto";


const JWT_SECRET = process.env.JWT_SECRET || "emploi_connect_congo_secret_2025";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Configure nodemailer with exclusive env vars for production
// All configuration comes from environment variables (process.env)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates on VPS
  },
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export interface AdminRegistrationData {
  email: string;
  password: string;
  nom: string;           // Frontend sends as "nom" → maps to last_name
  prenom: string;        // Frontend sends as "prenom" → maps to first_name
  phone?: string;
  country?: string;
  city?: string;
  birth_date?: string;
  avatar_url?: string;
  role: "super_admin" | "content_admin" | "admin_offres" | "admin_users" | "admin";
}

/**
 * Register a new admin with email verification
 * Maps: nom→last_name, prenom→first_name
 * PostgreSQL auto-increments id, doesn't require UUID
 */
export const registerAdmin = async (data: AdminRegistrationData) => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, message: "Format email invalide" };
    }

    // Check if email already exists
    const { rows: existing } = await pool.query(
      "SELECT id FROM admins WHERE email = $1",
      [data.email]
    );

    if (existing.length > 0) {
      return { success: false, message: "Cet email est déjà utilisé" };
    }

    // Validate password length
    if (data.password.length < 6) {
      return { success: false, message: "Le mot de passe doit contenir au moins 6 caractères" };
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(data.password, 10);

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Prepare data for database insertion
    const last_name = data.nom;
    const first_name = data.prenom;
    const email = data.email;
    const password = hashedPassword;
    const role = data.role;

    // Debug log before database insert
    console.log('   📝 Données envoyées à la DB:', { last_name, first_name, email, role });

    // Minimal INSERT: only essential columns
    // PostgreSQL will auto-generate id (SERIAL)
    const { rows } = await pool.query(
      `INSERT INTO public.admins (last_name, first_name, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [last_name, first_name, email, password, role]
    );

    console.log('   ✅ INSERT successful, returned admin:', rows[0]);

    const admin = rows[0];

    // Send verification email
    const verificationUrl = `${FRONTEND_URL}/admin/verify-email?token=${verificationToken}`;
    const emailContent = `
      <h2>Confirmation de création d'administrateur</h2>
      <p>Bienvenue, ${data.prenom} ${data.nom}!</p>
      <p>Veuillez confirmer votre email en cliquant sur le lien ci-dessous:</p>
      <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Confirmer votre email
      </a>
      <p>Ou copiez ce lien: ${verificationUrl}</p>
      <p>Ce lien expire dans 24 heures.</p>
      <p>Emploi Connect Congo</p>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@emploi-connect.congo",
      to: data.email,
      subject: "Confirmer votre email - Emploi Connect Congo",
      html: emailContent,
    });

    return {
      success: true,
      message: "Admin créé! Un email de confirmation a été envoyé.",
      admin: {
        id: admin.id,
        email: admin.email,
        last_name: admin.last_name,
        first_name: admin.first_name,
        role: admin.role,
      },
    };
  } catch (error) {
    console.error("❌ Admin registration error:", error);
    if (error instanceof Error) {
      console.error("   SQL Error Message:", error.message);
      console.error("   Error Details:", {
        code: (error as any).code,
        detail: (error as any).detail,
        message: error.message
      });
    }
    return {
      success: false,
      message: "Erreur lors de la création de l'admin",
    };
  }
};

/**
 * Verify email token
 */
export const verifyEmailToken = async (token: string) => {
  try {
    if (!token) {
      return { success: false, message: "Token invalide" };
    }

    // Find admin by token and check expiration
    const { rows } = await pool.query(
      `SELECT id, email, verification_token_expires_at 
       FROM admins 
       WHERE verification_token = $1 
       AND verification_token_expires_at > NOW()
       AND is_verified = false`,
      [token]
    );

    if (rows.length === 0) {
      return { success: false, message: "Token invalide ou expiré" };
    }

    const admin = rows[0];

    // Update verification status
    await pool.query(
      `UPDATE admins 
       SET is_verified = true, 
           verification_token = NULL
       WHERE id = $1`,
      [admin.id]
    );

    return {
      success: true,
      message: "Email confirmé avec succès!",
      admin: { id: admin.id, email: admin.email },
    };
  } catch (error) {
    console.error("❌ Email verification error:", error);
    if (error instanceof Error) {
      console.error("   SQL Error Message:", error.message);
    }
    return {
      success: false,
      message: "Erreur lors de la vérification",
    };
  }
};

/**
 * Login admin
 */
export const loginAdmin = async (email: string, password: string) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM admins WHERE email = $1",
      [email]
    );

    const admin = rows[0];

    if (!admin) {
      return { success: false, message: "Email ou mot de passe incorrect" };
    }

    // Check verification status
    if (!admin.is_verified) {
      return { 
        success: false, 
        message: "Veuillez vérifier votre email avant de vous connecter" 
      };
    }

    // Verify password
    const passwordMatch = bcrypt.compareSync(password, admin.password);
    if (!passwordMatch) {
      return { success: false, message: "Email ou mot de passe incorrect" };
    }

    // Generate token
    const token = jwt.sign(
      { id: admin.id, role: admin.role, email: admin.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return safe admin
    const { password: _, verification_token: __, ...safeAdmin } = admin;

    return {
      success: true,
      token,
      admin: safeAdmin,
    };
  } catch (error) {
    console.error("Admin login error:", error);
    return {
      success: false,
      message: "Erreur lors de la connexion",
    };
  }
};

/**
 * Create admin by super admin
 * Maps: nom→last_name, prenom→first_name
 * Forces role to 'content_admin' or 'super_admin' as specified
 */
export const createAdminBySuperAdmin = async (
  data: AdminRegistrationData,
  createdBy: number
) => {
  try {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, message: "Format email invalide" };
    }

    // Check if email exists
    const { rows: existing } = await pool.query(
      "SELECT id FROM admins WHERE email = $1",
      [data.email]
    );

    if (existing.length > 0) {
      return { success: false, message: "Cet email est déjà utilisé" };
    }

    // Validate password
    if (data.password.length < 6) {
      return { success: false, message: "Le mot de passe doit contenir au moins 6 caractères" };
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(data.password, 10);

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Prepare data for database insertion
    const last_name = data.nom;
    const first_name = data.prenom;
    const email = data.email;
    const password = hashedPassword;
    const role = data.role;

    // Debug log before database insert
    console.log('   📝 Données envoyées à la DB:', { last_name, first_name, email, role });

    // Minimal INSERT: only essential columns
    // PostgreSQL will auto-generate id (SERIAL)
    const { rows } = await pool.query(
      `INSERT INTO public.admins (last_name, first_name, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [last_name, first_name, email, password, role]
    );

    console.log('   ✅ INSERT successful, returned admin:', rows[0]);

    const admin = rows[0];

    // Send verification email
    const verificationUrl = `${FRONTEND_URL}/admin/verify-email?token=${verificationToken}`;
    const emailContent = `
      <h2>Bienvenue à Emploi Connect Congo</h2>
      <p>Bonjour ${data.prenom} ${data.nom},</p>
      <p>Un administrateur vous a créé un compte. Veuillez confirmer votre email:</p>
      <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Confirmer votre email
      </a>
      <p>Ce lien expire dans 24 heures.</p>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@emploi-connect.congo",
      to: data.email,
      subject: "Bienvenue - Emploi Connect Congo",
      html: emailContent,
    });

    return {
      success: true,
      message: "Admin créé et email de confirmation envoyé",
      admin: {
        id: admin.id,
        email: admin.email,
        last_name: admin.last_name,
        first_name: admin.first_name,
        role: admin.role,
      },
    };
  } catch (error) {
    console.error("❌ Create admin error:", error);
    if (error instanceof Error) {
      console.error("   SQL Error Message:", error.message);
      console.error("   Error Details:", error);
    }
    return {
      success: false,
      message: "Erreur lors de la création de l'admin",
    };
  }
};
