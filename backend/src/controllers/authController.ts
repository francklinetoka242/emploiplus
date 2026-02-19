import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { hashPassword, comparePassword, isValidEmail, getErrorMessage } from '../utils/helpers.js';
import { generateToken } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Utilisation dynamique du domaine de production
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://emploiplus-group.com';

/**
 * Register Admin
 */
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      nom,
      prenom,
      telephone = null,
      pays = null,
      ville = null,
      date_naissance = null,
      avatar_url = null,
      role = 'content_admin'
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe sont requis' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Format email invalide' });
    }

    const { rows: existing } = await pool.query('SELECT id FROM admins WHERE email = $1', [email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Cet email est déjà enregistré' });
    }

    const hashed = bcrypt.hashSync(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const { rows } = await pool.query(`
        INSERT INTO admins (email, password, nom, prenom, telephone, pays, ville, date_naissance, avatar_url, role, verification_token, is_verified, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false, NOW())
        RETURNING id, email, nom, prenom, role, created_at`, 
    [email.toLowerCase(), hashed, nom || '', prenom || '', telephone, pays, ville, date_naissance, avatar_url, role, verificationToken]);

    const admin = rows[0];

    // Envoi de l'email via SMTP Production
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD // Correction variable env
        }
      });

      const verifyLink = `${FRONTEND_URL}/admin/verify-email?token=${verificationToken}`;
      
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'admin@emploiplus-group.com',
        to: admin.email,
        subject: 'Confirmez votre adresse email — Emploi Plus',
        html: `
          <div style="font-family: sans-serif; line-height: 1.5;">
            <p>Bonjour ${admin.nom} ${admin.prenom},</p>
            <p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email et activer votre compte administrateur :</p>
            <p><a href="${verifyLink}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Valider mon email</a></p>
          </div>`
      });
    } catch (mailErr) {
      console.error('Erreur SMTP VPS:', mailErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Admin créé. Un email de vérification a été envoyé.',
      admin: { id: admin.id, email: admin.email, role: admin.role }
    });
  } catch (err) {
    console.error('Register admin error:', err);
    return res.status(500).json({ success: false, message: 'Erreur lors de l\'inscription' });
  }
};

/**
 * Login Admin
 */
export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { rows } = await pool.query('SELECT * FROM admins WHERE email = $1', [email.toLowerCase()]);
    const admin = rows[0];

    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    const token = generateToken(admin.id, admin.role);
    const { password: _, ...safeAdmin } = admin;

    return res.json({ success: true, token, admin: safeAdmin });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur de connexion' });
  }
};

/**
 * Register User (Candidate/Company)
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password, user_type = 'candidate', company_name = null } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    }

    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
    }

    const hashed = await hashPassword(password);
    const { rows } = await pool.query(`
        INSERT INTO users (full_name, email, password, user_type, company_name, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id, full_name, email, user_type`, 
    [full_name, email.toLowerCase(), hashed, user_type, company_name]);

    const user = rows[0];
    const token = generateToken(user.id, user.user_type);

    return res.status(201).json({ success: true, token, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur d\'inscription' });
  }
};

/**
 * Login User
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1 AND is_deleted = false', [email.toLowerCase()]);
    const user = rows[0];

    if (!user || user.is_blocked || !(await comparePassword(password, user.password))) {
      const msg = user?.is_blocked ? 'Compte bloqué' : 'Identifiants incorrects';
      return res.status(401).json({ success: false, message: msg });
    }

    const token = generateToken(user.id, user.user_type);
    const { password: _, ...safeUser } = user;

    return res.json({ success: true, token, user: safeUser });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur de connexion' });
  }
};

/**
 * Refresh Token
 */
export const refreshToken = async (req: Request, res: Response) => {
  const { userId, userRole } = (req as any);
  if (!userId) return res.status(401).json({ success: false, message: 'Non authentifié' });
  
  const token = generateToken(userId, userRole);
  return res.json({ success: true, token });
};