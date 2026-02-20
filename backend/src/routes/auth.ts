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
import { generateToken } from '../middleware/auth.js';
import { registerAdmin } from '../services/adminAuthService.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';

/**
 * Admin Registration
 * POST /api/auth/admin/register
 */
router.post('/admin/register', async (req: Request, res: Response) => {
  console.log('👉 Requête reçue sur la route d\'inscription admin (auth.ts /admin/register)');
  try {
    const { email, password, first_name, last_name, role = 'admin' } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis',
      });
    }

    if (!first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'Prénom et nom sont requis',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email invalide',
      });
    }

    // Use the registerAdmin service for consistency
    const result = await registerAdmin({
      email,
      password,
      prenom: first_name,
      nom: last_name,
      role, // Will be 'admin' by default if not provided
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    const admin = result.admin;
    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error('Admin registration error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: process.env.NODE_ENV === 'development' ? String(err) : undefined,
    });
  }
});

/**
 * Super Admin Registration
 * POST /api/auth/super-admin/register
 * Accepts { nom, prenom, email, password }
 * Maps: nom→last_name, prenom→first_name in database
 */
router.post('/super-admin/register', async (req: Request, res: Response) => {
  console.log('👉 Requête reçue sur la route d\'inscription Super Admin (auth.ts /super-admin/register)');
  console.log('📥 Données reçues pour inscription:', JSON.stringify(req.body, null, 2));
  
  // SECURITY: Role is determined by the route, NOT by user input
  const role = 'super_admin';
  console.log('✅ Role forced by route:', role);
  
  try {
    const { email, password } = req.body;
    // Flexible extraction: accept both lastName/firstName and nom/prenom formats
    const lastName = req.body.lastName || req.body.nom;
    const firstName = req.body.firstName || req.body.prenom;

    console.log('🔍 Champs extraits:');
    console.log('   firstName:', firstName);
    console.log('   lastName:', lastName);
    console.log('   email:', email);
    console.log('   password:', password ? '***' : 'MANQUANT');

    if (!lastName || !firstName || !email || !password) {
      console.log('❌ Validation échouée - champs manquants');
      return res.status(400).json({ 
        success: false, 
        message: 'Tous les champs sont requis (firstName/nom, lastName/prenom, email, password)',
        received: { firstName, lastName, email, password: password ? 'defined' : 'missing' }
      });
    }

    console.log('📤 Appel au service registerAdmin avec:');
    console.log('   email:', email);
    console.log('   nom:', lastName);
    console.log('   prenom:', firstName);
    console.log('   role:', role);

    const result = await registerAdmin({
      email,
      password,
      nom: lastName,
      prenom: firstName,
      role, // Force role from route, not from user input
    } as any);

    console.log('📋 Résultat du service:', { success: result.success, message: result.message });

    if (result.success) {
      console.log('✅ Inscription super admin réussie!');
      return res.json(result);
    }

    console.log('⚠️ Inscription super admin échouée:', result.message);
    return res.status(400).json(result);
  } catch (err) {
    console.error('❌ Super admin registration error:', err);
    if (err instanceof Error) {
      console.error('   SQL Error:', err.message);
      console.error('   Error code:', (err as any).code);
      console.error('   Error detail:', (err as any).detail);
      console.error('   Stack:', err.stack);
    }
    return res.status(500).json({ success: false, message: 'Erreur serveur', error: process.env.NODE_ENV === 'development' ? String(err) : undefined });
  }
});

/**
 * Admin Login
 * POST /api/auth/admin/login
 */
router.post('/admin/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe sont requis',
      });
    }

    // Get admin from public.admins table
    const { rows } = await pool.query(
      'SELECT * FROM public.admins WHERE email = $1',
      [email]
    );

    const admin = rows[0];

    // Verify password
    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects',
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return safe admin (without password)
    const { password: _, ...safeAdmin } = admin;

    res.json({
      success: true,
      token,
      admin: safeAdmin,
    });
  } catch (err) {
    console.error('❌ Admin login error:', err);
    if (err instanceof Error) {
      console.error('   SQL Error:', err.message);
    }
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: process.env.NODE_ENV === 'development' ? String(err) : undefined,
    });
  }
});

/**
 * User Registration
 * POST /api/auth/user/register
 * 
 * TODO: Implement from server.ts
 */
router.post('/user/register', async (req: Request, res: Response) => {
  try {
    const { full_name, email, password, user_type = 'candidate' } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Format email invalide' });
    }

    // Check if user already exists
    const { rows: existing } = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });
    }

    // Hash password
    const hashed = await hashPassword(password);

    // Insert user
    const insertQuery = `
      INSERT INTO users (full_name, email, password, user_type, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, full_name, email, user_type, created_at, updated_at
    `;

    const { rows } = await pool.query(insertQuery, [full_name, email, hashed, user_type]);
    const user = rows[0];

    // Generate JWT
    const token = jwt.sign({ id: user.id, role: user.user_type || 'candidate' }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ success: true, token, user });
  } catch (err) {
    console.error('User registration error:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'inscription', error: String(err) });
  }
});

/**
 * User Login
 * POST /api/auth/user/login
 * 
 * TODO: Implement from server.ts
 */
router.post('/user/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe sont requis' });
    }

    // Find user
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }

    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }

    const token = jwt.sign({ id: user.id, role: user.user_type || 'candidate' }, JWT_SECRET, { expiresIn: '7d' });

    // Remove password before returning
    const { password: _pwd, ...safeUser } = user;

    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    console.error('User login error:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de la connexion', error: String(err) });
  }
});

/**
 * Sync Google OAuth User
 * POST /api/auth/sync-google
 * Called by frontend after Google OAuth callback
 * 
 * Body:
 * {
 *   id: string (Supabase user ID)
 *   email: string
 *   full_name: string
 *   profile_image_url?: string
 *   user_type: 'candidate' | 'company' (from URL param)
 * }
 */
router.post('/sync-google', async (req: Request, res: Response) => {
  try {
    const { id, email, full_name, profile_image_url, user_type = 'candidate' } = req.body;

    if (!id || !email) {
      return res.status(400).json({
        success: false,
        message: 'ID et email requis',
      });
    }

    // Validate user_type
    const validUserTypes = ['candidate', 'company'];
    const normalizedUserType = validUserTypes.includes(user_type) ? user_type : 'candidate';
    
    console.log(`[Google Sync] Processing user: ${email}, type: ${normalizedUserType}`);

    // Check if user exists
    const { rows: existing } = await pool.query(
      'SELECT id, user_type FROM users WHERE email = $1',
      [email]
    );

    let user;

    if (existing.length > 0) {
      // Update existing user with new info but preserve user_type if already set
      const existingUserType = existing[0].user_type || normalizedUserType;
      
      const { rows: updatedUser } = await pool.query(
        `UPDATE users 
         SET full_name = COALESCE($1, full_name),
             profile_image_url = COALESCE($2, profile_image_url),
             last_login = NOW()
         WHERE email = $3
         RETURNING id, email, full_name, user_type, profile_image_url`,
        [full_name || existing[0].full_name, profile_image_url, email]
      );
      user = updatedUser[0];
      console.log(`[Google Sync] ✅ Updated existing user: ${email}`);
    } else {
      // Create new user from Google OAuth
      const { rows: newUser } = await pool.query(
        `INSERT INTO users (id, email, full_name, user_type, profile_image_url, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING id, email, full_name, user_type, profile_image_url`,
        [id, email, full_name || email.split('@')[0], normalizedUserType, profile_image_url]
      );
      user = newUser[0];
      console.log(`[Google Sync] ✅ Created new user: ${email} as ${normalizedUserType}`);
    }

    // Generate JWT token with user_type
    const token = jwt.sign(
      { id: user.id, role: user.user_type || normalizedUserType },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`[Google Sync] ✅ Token generated for user: ${email}`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        user_type: user.user_type,
        profile_image_url: user.profile_image_url,
      },
    });
  } catch (err) {
    console.error('[Google Sync] ❌ Error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la synchronisation Google',
      error: String(err),
    });
  }
});

export default router;
