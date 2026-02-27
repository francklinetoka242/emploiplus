import { Router } from 'express';
import * as authController from '@controllers/auth.controller.js';
import { asyncHandler } from '@middlewares/asyncHandler.js';
import { authMiddleware, requireRole } from '@middlewares/auth.middleware.js';

const router = Router();

/**
 * Routes pour l'authentification
 * Préfixe: /api/auth
 * 
 * IMPORTANT: Ce module est complètement isolé
 * Les erreurs d'authentification ne doivent pas impacter les autres modules (jobs, formations)
 */

console.log('🔐 Chargement des routes d\'authentification...');

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
 * Réponse 200:
 * {
 *   "success": true,
 *   "data": {
 *     "token": "eyJhbGciOiJIUzI1NiIs...",
 *     "admin": { "id", "email", "role", "first_name", "last_name" },
 *     "expiresIn": 86400
 *   }
 * }
 * 
 * Réponse 401:
 * {
 *   "success": false,
 *   "message": "Email ou mot de passe incorrect",
 *   "error": { ... }
 * }
 */
router.post('/login', asyncHandler(authController.login));

/**
 * GET /api/auth/me
 * Vérifie que le token est valide et retourne les infos du user
 * 
 * Headers:
 * Authorization: Bearer <token>
 * 
 * Réponse 200:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "123",
 *     "email": "admin@example.com",
 *     "role": "admin",
 *     "first_name": "John",
 *     "last_name": "Doe",
 *     "status": "active"
 *   }
 * }
 * 
 * Réponse 401:
 * {
 *   "success": false,
 *   "message": "Token manquant ou invalide",
 *   "error": { ... }
 * }
 */
router.get('/me', authMiddleware, asyncHandler(authController.getMe));

/**
 * POST /api/auth/logout
 * Déconnecte l'utilisateur
 * 
 * Headers:
 * Authorization: Bearer <token>
 * 
 * Réponse 200:
 * {
 *   "success": true,
 *   "message": "Déconnexion réussie",
 *   "note": "Supprimez le token du localStorage côté client"
 * }
 * 
 * Note: Avec les JWT, il n'y a pas d'état serveur à supprimer.
 * La déconnexion se fait côté client en supprimant le token.
 */
router.post('/logout', authMiddleware, asyncHandler(authController.logout));

/**
 * TEST ROUTE - should be accessible
 */
router.get('/test', (req, res) => {
  res.json({ message: 'Test route works!' });
});

/**
 * POST /api/auth/register-admin
 * Crée un nouvel administrateur (protégé: super_admin uniquement)
 * 
 * Cette route envoie un email au nouvel admin si nodemailer est configuré.
 * Important: Si l'email échoue, l'admin est quand même créé (isolation maintenue)
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
 * Réponse 201:
 * {
 *   "success": true,
 *   "message": "Administrateur créé avec succès",
 *   "data": {
 *     "id": "456",
 *     "email": "newadmin@example.com",
 *     "role": "admin",
 *     "first_name": "John",
 *     "last_name": "Doe",
 *     "status": "active",
 *     "temporaryPassword": "Temp123!@#Secure",
 *     "emailSent": true
 *   }
 * }
 * 
 * Réponse 403 (non super_admin):
 * {
 *   "success": false,
 *   "message": "Accès refusé. Rôle requis: super_admin.",
 *   "error": { ... }
 * }
 * 
 * Réponse 409 (email existe déjà):
 * {
 *   "success": false,
 *   "message": "Un admin avec l'email ... existe déjà",
 *   "error": { ... }
 * }
 * 
 * Sécurité:
 * - Protégé par authMiddleware (JWT requis)
 * - Protégé par requireRole('super_admin')
 * - Email validé et converti en minuscules
 * - Password temporaire généré aléatoirement et securisé
 * - Email est isolé: si l'envoi échoue, l'admin est quand même créé
 */
console.log('📝 Enregistrement de la route /register-admin...');
router.post('/register-admin', authMiddleware, requireRole('super_admin'), asyncHandler(authController.registerAdmin));

export default router;
