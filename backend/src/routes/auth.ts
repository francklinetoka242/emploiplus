/**
 * Authentication Routes
 * 
 * Handles:
 * - Admin registration and login
 * - User registration and login
 * - Token refresh
 * - Password reset
 * 
 * This file demonstrates the modular pattern for route organization.
 * Extract from server.ts lines 442-500+ and adapt as needed.
 */

import { Router, Request, Response } from 'express';
import { pool } from '../config/database.js';
import { hashPassword, comparePassword, isValidEmail } from '../utils/helpers.js';
import { authenticateToken } from '../middleware/auth.js';
import { registerAdmin } from '../services/adminAuthService.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';

/**
 * Route STATUS (La pièce manquante pour le Dashboard)
 * GET /api/auth/status
 */
router.get('/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    // @ts-ignore
    const userRole = req.user.role;

    // Chercher dans les admins ou les users selon le rôle
    let userData;
    if (userRole === 'admin' || userRole === 'super_admin') {
      const { rows } = await pool.query('SELECT id, email, first_name, last_name, role FROM admins WHERE id = $1', [userId]);
      userData = rows[0];
    } else {
      const { rows } = await pool.query('SELECT id, email, first_name, last_name, user_type FROM users WHERE id = $1', [userId]);
      userData = rows[0];
    }

    if (!userData) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    res.json({
      success: true,
      user: userData
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur status' });
  }
});

/**
 * Admin Registration
 */
router.post('/admin/register', async (req: Request, res: Response) => {
  try {
    const { email, password, first_name, last_name, role = 'admin' } = req.body;
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ success: false, message: 'Champs requis manquants' });
    }
    const result = await registerAdmin({ email, password, prenom: first_name, nom: last_name, role });
    if (!result.success) return res.status(400).json(result);
    
    const token = jwt.sign({ id: result.admin.id, role: result.admin.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, admin: result.admin });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur inscription admin' });
  }
});

/**
 * Admin Login
 */
router.post('/admin/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM public.admins WHERE email = $1', [email]);
    const admin = rows[0];

    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }

    const token = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safeAdmin } = admin;
    res.json({ success: true, token, admin: safeAdmin });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur connexion admin' });
  }
});

/**
 * User Registration
 */
router.post('/user/register', async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, password, user_type = 'candidate' } = req.body;
    const hashed = await hashPassword(password);
    const { rows } = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password, user_type, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, first_name, last_name, email, user_type',
      [first_name, last_name, email.toLowerCase(), hashed, user_type]
    );
    const user = rows[0];
    const token = jwt.sign({ id: user.id, role: user.user_type }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur inscription user' });
  }
});

/**
 * User Login
 */
router.post('/user/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }
    const token = jwt.sign({ id: user.id, role: user.user_type }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _p, ...safeUser } = user;
    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur connexion user' });
  }
});

export default router;