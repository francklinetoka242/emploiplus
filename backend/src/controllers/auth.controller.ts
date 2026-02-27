import { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '@config/database.js';
import { CustomError } from '@middlewares/errorMiddleware.js';
import type { JWTPayload } from '@middlewares/auth.middleware.js';
import { sendAdminConfirmation } from '@services/mail.service.js';

/**
 * Contrôleur pour l'authentification
 * Gère la logique métier de login et token generation
 */

/**
 * Interface pour la requête de login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Interface pour l'admin dans la base de données
 */
export interface AdminInDB {
  id: string;
  email: string;
  password: string;
  role: string;
  first_name?: string;
  last_name?: string;
  status?: string;
  created_at?: string;
}

/**
 * POST /api/auth/login
 * Authentifie un admin et retourne un JWT
 * 
 * Body:
 * {
 *   "email": "admin@example.com",
 *   "password": "securepassword123"
 * }
 * 
 * Réponse:
 * {
 *   "success": true,
 *   "data": {
 *     "token": "eyJhbGciOiJIUzI1NiIs...",
 *     "admin": {
 *       "id": "123",
 *       "email": "admin@example.com",
 *       "role": "admin",
 *       "first_name": "John",
 *       "last_name": "Doe"
 *     },
 *     "expiresIn": 86400
 *   }
 * }
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as LoginRequest;

    // Validation des paramètres
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      throw new CustomError(
        'L\'email est requis et doit être une chaîne non vide',
        400,
        'authController.login.validation'
      );
    }

    if (!password || typeof password !== 'string' || password.length === 0) {
      throw new CustomError(
        'Le mot de passe est requis',
        400,
        'authController.login.validation'
      );
    }

    const emailTrimmed = email.trim().toLowerCase();

    // Vérifier que le JWT_SECRET est configuré
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new CustomError(
        'JWT_SECRET non configuré sur le serveur',
        500,
        'authController.login.config'
      );
    }

    // Récupérer l'admin par email
    const result = await query<AdminInDB>(
      `SELECT id, email, password, role, first_name, last_name, status, created_at
       FROM admins
       WHERE LOWER(email) = $1`,
      [emailTrimmed]
    );

    if (result.rows.length === 0) {
      // Ne pas révéler si l'email existe ou non (sécurité)
      throw new CustomError(
        'Email ou mot de passe incorrect',
        401,
        'authController.login.credentials'
      );
    }

    const admin = result.rows[0];

    // Vérifier que l'admin n'est pas désactivé
    if (admin.status && admin.status !== 'active') {
      throw new CustomError(
        `Compte désactivé (statut: ${admin.status})`,
        403,
        'authController.login.status'
      );
    }

    // Comparer le mot de passe avec le hash stocké
    const passwordMatch = await bcryptjs.compare(password, admin.password);

    if (!passwordMatch) {
      throw new CustomError(
        'Email ou mot de passe incorrect',
        401,
        'authController.login.credentials'
      );
    }

    // Générer le JWT
    const jwtPayload: JWTPayload = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const expiresIn = parseInt(process.env.JWT_EXPIRES_IN || '86400', 10); // 24h par défaut
    const token = jwt.sign(jwtPayload, jwtSecret, { expiresIn });

    // Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Login réussi pour: ${admin.email} (${admin.role})`);
    }

    // Répondre avec succès
    res.json({
      success: true,
      message: 'Authentification réussie',
      data: {
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          role: admin.role,
          first_name: admin.first_name || null,
          last_name: admin.last_name || null,
        },
        expiresIn,
      },
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'Erreur lors de l\'authentification';
    
    // Vérifier s'il s'agit d'une erreur de base de données
    if (message.includes('relation "admins" does not exist') || message.includes('table') || message.includes('does not exist')) {
      throw new CustomError(
        'Table admins non trouvée - initialisation de la base de données requise',
        500,
        'authController.login.database'
      );
    }

    throw new CustomError(
      `Erreur lors de l'authentification: ${message}`,
      500,
      'authController.login'
    );
  }
}

/**
 * GET /api/auth/me
 * Vérifie que le token est toujours valide et retourne les infos du user
 * 
 * Headers:
 * Authorization: Bearer <token>
 * 
 * Réponse:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "123",
 *     "email": "admin@example.com",
 *     "role": "admin"
 *   }
 * }
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      throw new CustomError(
        'Utilisateur non authentifié',
        401,
        'authController.getMe'
      );
    }

    // Récupérer les infos complètes de l'admin depuis la DB
    const result = await query<AdminInDB>(
      `SELECT id, email, role, first_name, last_name, status, created_at
       FROM admins
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      throw new CustomError(
        'Admin non trouvé',
        404,
        'authController.getMe.notFound'
      );
    }

    const admin = result.rows[0];

    res.json({
      success: true,
      message: 'Profil récupéré',
      data: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        first_name: admin.first_name || null,
        last_name: admin.last_name || null,
        status: admin.status || 'active',
        created_at: admin.created_at,
      },
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'Erreur lors de la récupération du profil';
    throw new CustomError(
      `Erreur lors de la récupération du profil: ${message}`,
      500,
      'authController.getMe'
    );
  }
}

/**
 * POST /api/auth/logout
 * Déconnecte l'utilisateur (côté client: supprimer le token du localStorage)
 * 
 * Cette fonction est optionnelle car les tokens JWT sont stateless.
 * Dans une version avancée, on pourrait blacklister les tokens.
 */
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    // Récupérer le token du header pour logging
    const token = req.token || 'unknown';

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Logout réussi pour: ${req.user?.email} (token: ${token.substring(0, 20)}...)`);
    }

    res.json({
      success: true,
      message: 'Déconnexion réussie',
      note: 'Supprimez le token du localStorage côté client pour compléter la déconnexion',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la déconnexion';
    throw new CustomError(
      `Erreur lors de la déconnexion: ${message}`,
      500,
      'authController.logout'
    );
  }
}

/**
 * Fonction utilitaire pour hasher un mot de passe
 * Utilisée lors de la création ou modification d'un admin
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    if (!password || password.length === 0) {
      throw new Error('Le mot de passe ne peut pas être vide');
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    const hash = await bcryptjs.hash(password, saltRounds);
    return hash;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors du hashage du mot de passe';
    throw new CustomError(
      `Erreur lors du hashage du mot de passe: ${message}`,
      500,
      'authController.hashPassword'
    );
  }
}

/**
 * Interface pour la requête de création d'admin
 */
export interface RegisterAdminRequest {
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
}

/**
 * POST /api/auth/register-admin
 * Crée un nouvel administrateur (protégé: super_admin uniquement)
 * 
 * Headers:
 * Authorization: Bearer <super_admin_token>
 * 
 * Body:
 * {
 *   "email": "newadmin@example.com",
 *   "first_name": "John",
 *   "last_name": "Doe",
 *   "role": "admin" (optionnel, défaut: "admin")
 * }
 * 
 * Réponse:
 * {
 *   "success": true,
 *   "message": "Administrateur créé avec succès",
 *   "data": {
 *     "id": "123",
 *     "email": "newadmin@example.com",
 *     "role": "admin",
 *     "first_name": "John",
 *     "last_name": "Doe",
 *     "status": "active",
 *     "temporaryPassword": "TempPass123!@#",
 *     "emailSent": true/false (false si l'email a échoué mais l'admin a été créé)
 *   }
 * }
 */
export async function registerAdmin(req: Request, res: Response): Promise<void> {
  try {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user) {
      throw new CustomError(
        'Utilisateur non authentifié',
        401,
        'authController.registerAdmin.auth'
      );
    }

    // Vérifier que l'utilisateur est super_admin
    if (req.user.role !== 'super_admin') {
      throw new CustomError(
        `Accès refusé. Rôle requis: super_admin. Votre rôle: ${req.user.role}`,
        403,
        'authController.registerAdmin.permission'
      );
    }

    // Récupérer et valider les données
    const { email, first_name, last_name, role } = req.body as RegisterAdminRequest;

    // Validation email
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      throw new CustomError(
        'L\'email est requis et doit être une chaîne non vide',
        400,
        'authController.registerAdmin.validation'
      );
    }

    // Validation first_name
    if (!first_name || typeof first_name !== 'string' || first_name.trim().length === 0) {
      throw new CustomError(
        'Le prénom est requis',
        400,
        'authController.registerAdmin.validation'
      );
    }

    // Validation last_name
    if (!last_name || typeof last_name !== 'string' || last_name.trim().length === 0) {
      throw new CustomError(
        'Le nom est requis',
        400,
        'authController.registerAdmin.validation'
      );
    }

    const emailTrimmed = email.trim().toLowerCase();
    const adminRole = role || 'admin';

    // Vérifier que l'email n'existe pas déjà
    const existingAdmin = await query<{ id: string }>(
      `SELECT id FROM admins WHERE LOWER(email) = $1`,
      [emailTrimmed]
    );

    if (existingAdmin.rows.length > 0) {
      throw new CustomError(
        `Un admin avec l'email ${emailTrimmed} existe déjà`,
        409,
        'authController.registerAdmin.duplicate'
      );
    }

    // Générer un password temporaire sécurisé
    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await hashPassword(temporaryPassword);

    // Créer l'admin dans la DB
    const createResult = await query<AdminInDB>(
      `INSERT INTO admins (
        email, password, first_name, last_name, role, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, email, role, first_name, last_name, status, created_at`,
      [emailTrimmed, passwordHash, first_name.trim(), last_name.trim(), adminRole, 'active']
    );

    if (createResult.rows.length === 0) {
      throw new CustomError(
        'Erreur lors de la création de l\'admin - aucune ligne retournée',
        500,
        'authController.registerAdmin.insert'
      );
    }

    const newAdmin = createResult.rows[0];
    let emailSent = false;

    // Envoyer l'email avec isolation des erreurs
    // Si l'email échoue, l'admin est quand même créé
    try {
      const adminFullName = `${first_name} ${last_name}`;
      emailSent = await sendAdminConfirmation(emailTrimmed, temporaryPassword, adminFullName);
      
      if (!emailSent) {
        console.warn(`⚠️  Email non envoyé pour le nouvel admin ${emailTrimmed}`);
      }
    } catch (emailError) {
      const emailMessage = emailError instanceof Error ? emailError.message : 'Unknown error';
      console.error(`❌ Erreur lors de l'envoi d'email pour ${emailTrimmed}:`, emailMessage);
      // On continue quand même - l'admin a été créé
      emailSent = false;
    }

    // Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Admin créé par ${req.user.email} (super_admin):`);
      console.log(`   Email: ${emailTrimmed}`);
      console.log(`   Nom: ${first_name} ${last_name}`);
      console.log(`   Rôle: ${adminRole}`);
      console.log(`   Email sent: ${emailSent}`);
    }

    // Répondre avec succès
    res.status(201).json({
      success: true,
      message: 'Administrateur créé avec succès',
      data: {
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role,
        first_name: newAdmin.first_name,
        last_name: newAdmin.last_name,
        status: newAdmin.status,
        temporaryPassword, // Retourner le password temporaire pour que le super_admin le communique
        emailSent, // Indiquer si l'email a été envoyé
      },
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'Erreur lors de la création de l\'admin';

    // Vérifier s'il s'agit d'une erreur de base de données
    if (message.includes('relation "admins" does not exist') || message.includes('does not exist')) {
      throw new CustomError(
        'Table admins non trouvée',
        500,
        'authController.registerAdmin.database'
      );
    }

    throw new CustomError(
      `Erreur lors de la création de l'admin: ${message}`,
      500,
      'authController.registerAdmin'
    );
  }
}

/**
 * Générer un mot de passe temporaire sécurisé
 * Format: Majuscule + minuscules + chiffres + caractères spéciaux
 */
function generateTemporaryPassword(): string {
  const length = 16;
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // S'assurer que le password contient au moins une majuscule, une minuscule, un chiffre et un caractère spécial
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Remplir le reste aléatoirement
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Mélanger le password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}
