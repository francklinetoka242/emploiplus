import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { hashPassword, comparePassword, isValidEmail, getErrorMessage } from '../utils/helpers.js';
import { generateToken } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Utilisation stricte du domaine de production
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://emploiplus-group.com';

/**
 * Inscription Administrateur
 */
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password, nom, prenom, role = 'content_admin' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
    }

    const { rows: existing } = await pool.query('SELECT id FROM admins WHERE email = $1', [email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Cet email est déjà enregistré' });
    }

    const hashed = bcrypt.hashSync(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const { rows } = await pool.query(
      `INSERT INTO admins (email, password, nom, prenom, role, verification_token, is_verified, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, false, NOW()) RETURNING id, email`,
      [email.toLowerCase(), hashed, nom || '', prenom || '', role, verificationToken]
    );

    // Envoi Email de Validation
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
    });

    const verifyLink = `${FRONTEND_URL}/admin/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Validation Compte Admin - EmploiPlus',
      html: `<p>Bonjour, cliquez ici pour valider votre accès : <a href="${verifyLink}">Valider mon compte</a></p>`
    });

    return res.status(201).json({ success: true, message: 'Admin créé, email envoyé.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur inscription admin' });
  }
};

/**
 * Connexion Administrateur
 */
export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM admins WHERE email = $1', [email.toLowerCase()]);
    const admin = rows[0];

    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }

    const token = generateToken(admin.id, admin.role);
    const { password: _, ...safeAdmin } = admin;
    return res.json({ success: true, token, admin: safeAdmin });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur connexion admin' });
  }
};

/**
 * Inscription Utilisateur (Candidat / Entreprise)
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password, user_type = 'candidate' } = req.body;

    const hashed = await hashPassword(password);
    const { rows } = await pool.query(
      `INSERT INTO users (full_name, email, password, user_type, created_at)
       VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, user_type`,
      [full_name, email.toLowerCase(), hashed, user_type]
    );

    const user = rows[0];
    const token = generateToken(user.id, user.user_type);
    return res.status(201).json({ success: true, token, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur inscription utilisateur' });
  }
};

/**
 * Connexion Utilisateur
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1 AND is_deleted = false', [email.toLowerCase()]);
    const user = rows[0];

    if (!user || user.is_blocked || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Connexion refusée' });
    }

    const token = generateToken(user.id, user.user_type);
    const { password: _, ...safeUser } = user;
    return res.json({ success: true, token, user: safeUser });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erreur connexion' });
  }
};

/**
 * Rafraîchir le Token
 */
export const refreshToken = async (req: Request, res: Response) => {
  const { userId, userRole } = (req as any);
  if (!userId) return res.status(401).json({ success: false, message: 'Non autorisé' });
  return res.json({ success: true, token: generateToken(userId, userRole) });
};