/**
 * Authentication Controller
 * 
 * Handles all authentication-related business logic
 * This separates route handlers from business logic for better testability
 */

import { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { hashPassword, comparePassword, isValidEmail, getErrorMessage } from '../utils/helpers.js';
import { generateToken } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Environment variables for email verification links
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

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

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email invalide',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères',
      });
    }

    // Check if admin already exists
    const { rows: existing } = await pool.query('SELECT id FROM admins WHERE email = $1', [email.toLowerCase()]);

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà enregistré',
      });
    }

    // Hash password
    const hashed = bcrypt.hashSync(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create admin (not verified yet)
    const { rows } = await pool.query(`INSERT INTO admins (email, password, nom, prenom, telephone, pays, ville, date_naissance, avatar_url, role, verification_token, is_verified, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,false,NOW())
       RETURNING id, email, nom, prenom, role, created_at`, [
      email.toLowerCase(),
      hashed,
      nom || '',
      prenom || '',
      telephone,
      pays,
      ville,
      date_naissance || null,
      avatar_url || null,
      role,
      verificationToken,
    ]);

    const admin = rows[0];

    // Send verification email
    try {
      const transporter = (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
        ? nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true',
            tls: {
              rejectUnauthorized: false // Allow self-signed certificates on VPS
            },
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          })
        : null;

      if (transporter) {
        // Use FRONTEND_URL for email verification link (not backend URL)
        const verifyLink = `${FRONTEND_URL}/admin/verify-email?token=${verificationToken}`;
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || 'admin@emploiplus-group.com',
          to: admin.email,
          subject: 'Confirmez votre adresse email — Emploi Plus',
          html: `<p>Bonjour ${admin.nom || ''} ${admin.prenom || ''},</p>
                 <p>Merci de vous être inscrit. Cliquez sur le lien ci-dessous pour vérifier votre adresse email :</p>
                 <p><a href="${verifyLink}">Valider mon email</a></p>
                 <p>Si vous n'avez pas demandé cette inscription, ignorez ce message.</p>`
        });
      } else {
        console.warn('No SMTP transporter configured — verification email not sent');
      }
    } catch (mailErr) {
      console.error('Error sending verification email:', mailErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Admin créé. Un email de vérification a été envoyé.',
      admin: {
        id: admin.id,
        email: admin.email,
        nom: admin.nom,
        prenom: admin.prenom,
        role: admin.role,
        created_at: admin.created_at,
      },
    });
  } catch (err) {
    console.error('Register admin error:', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription de l\'admin',
      error: process.env.NODE_ENV === 'development' ? getErrorMessage(err) : undefined,
    });
  }
};

/**
 * Login Admin
 */
export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis',
      });
    }

    // Get admin by email
    const { rows } = await pool.query(
      'SELECT * FROM admins WHERE email = $1',
      [email.toLowerCase()]
    );

    const admin = rows[0];

    // Check if admin exists
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      });
    }

    // Verify password
    const passwordMatch = bcrypt.compareSync(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      });
    }

    // Generate token
    const token = generateToken(admin.id, admin.role);

    // Return safe admin (without password)
    const { password: _, ...safeAdmin } = admin;

    return res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      admin: safeAdmin,
    });
  } catch (err) {
    console.error('Login admin error:', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: process.env.NODE_ENV === 'development' ? getErrorMessage(err) : undefined,
    });
  }
};

/**
 * Register User (Candidate or Company)
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password, user_type = 'candidate', company_name = null } = req.body;

    // Validation
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être complétés',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email invalide',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères',
      });
    }

    if (!['candidate', 'company'].includes(user_type)) {
      return res.status(400).json({
        success: false,
        message: 'Type d\'utilisateur invalide',
      });
    }

    // Check if user already exists
    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà enregistré',
      });
    }

    // Hash password
    const hashed = await hashPassword(password);

    // Create user
    const { rows } = await pool.query(
      `INSERT INTO users (full_name, email, password, user_type, company_name, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, full_name, email, user_type, company_name, created_at`,
      [full_name, email.toLowerCase(), hashed, user_type, company_name]
    );

    const user = rows[0];

    // Generate token
    const token = generateToken(user.id, user.user_type);

    return res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        user_type: user.user_type,
        company_name: user.company_name,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Register user error:', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: process.env.NODE_ENV === 'development' ? getErrorMessage(err) : undefined,
    });
  }
};

/**
 * Login User
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis',
      });
    }

    // Get user by email
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_deleted = false',
      [email.toLowerCase()]
    );

    const user = rows[0];

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      });
    }

    // Check if user is blocked
    if (user.is_blocked) {
      return res.status(403).json({
        success: false,
        message: 'Ce compte a été bloqué',
      });
    }

    // Verify password
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      });
    }

    // Generate token
    const token = generateToken(user.id, user.user_type);

    // Return safe user (without password)
    const { password: _, ...safeUser } = user;

    return res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error('Login user error:', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: process.env.NODE_ENV === 'development' ? getErrorMessage(err) : undefined,
    });
  }
};

/**
 * Refresh Token
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { userId, userRole } = (req as any);

    if (!userId || !userRole) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    // Generate new token
    const token = generateToken(userId, userRole);

    return res.json({
      success: true,
      message: 'Token rafraîchi',
      token,
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du rafraîchissement du token',
    });
  }
};
