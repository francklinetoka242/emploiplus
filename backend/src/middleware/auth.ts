import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || '';
const SUPABASE_WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET || '';

// Extend Express Request type to include custom properties
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userRole?: string;
      user?: {
        id: string;
        email: string;
        role: 'candidate' | 'company' | 'admin';
        aud: string;
      };
      webhookVerified?: boolean;
    }
  }
}

/**
 * User authentication middleware
 * Verifies JWT token from Authorization header
 */
export const userAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth)
    return res.status(401).json({ success: false, message: 'Token manquant' });

  const token = auth.split(' ')[1] || "";
  try {
    console.log('userAuth token present:', !!token, 'masked:', token ? `${token.slice(0, 8)}...` : '');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('userAuth decoded id:', decoded?.id, 'role:', decoded?.role);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  }
  catch (err) {
    console.error('userAuth verify error:', (err as any)?.stack || (err as any)?.message || err);
    return res.status(401).json({ success: false, message: 'Token invalide' });
  }
};

/**
 * Admin authentication middleware
 * Only allows users with admin, super_admin, or admin_content roles
 */
export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth)
    return res.status(401).json({ success: false, message: 'Token manquant' });

  const token = auth.split(' ')[1] || "";
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const allowed = ['admin', 'super_admin', 'admin_content'];
    if (!decoded.role || !allowed.includes(decoded.role)) {
      return res.status(403).json({ success: false, message: 'Accès admin requis' });
    }
    req.userId = decoded.id; // admin id
    req.userRole = decoded.role;
    next();
  }
  catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalide' });
  }
};

/**
 * Generate JWT token for user
 */
export const generateToken = (userId: number | string, userRole: string): string => {
  return jwt.sign(
    { id: userId, role: userRole },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// ============================================================================
// SUPABASE JWT AUTHENTICATION (Nouvelle architecture)
// ============================================================================

/**
 * Middleware pour vérifier le JWT Bearer token de Supabase
 * 
 * Pour scale millions d'utilisateurs:
 * - JWT verification sans appel DB
 * - Caching optionnel pour revocations
 * - Support multi-role (candidat, entreprise, admin)
 */
export const authSupabaseJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '
    
    // Verify using Supabase JWT secret
    const jwtSecret = SUPABASE_JWT_SECRET || JWT_SECRET;
    const decoded: any = jwt.verify(token, jwtSecret);

    // Attach user info to request
    req.user = {
      id: decoded.sub,
      email: decoded.email || '',
      role: decoded.user_metadata?.role || 'candidate',
      aud: decoded.aud || '',
    };

    console.log('[Auth] Supabase JWT verified for user:', req.user.id);
    next();

  } catch (error) {
    console.error('[Auth] JWT verification failed:', error instanceof Error ? error.message : error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Middleware pour vérifier les webhooks de Supabase
 * 
 * Supabase envoie un header: x-webhook-signature
 * Nous comparons le HMAC SHA256 du body
 */
export const verifyWebhookSecret = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const webhookSecret = SUPABASE_WEBHOOK_SECRET;
    const signature = req.headers['x-webhook-signature'] as string;

    if (!webhookSecret) {
      console.warn('[Webhook] SUPABASE_WEBHOOK_SECRET not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    if (!signature) {
      console.warn('[Webhook] Missing x-webhook-signature header');
      return res.status(401).json({ error: 'Missing signature' });
    }

    // Reconstruct the signed content (body as string)
    const body = JSON.stringify(req.body);
    
    // Verify signature using HMAC SHA256
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn('[Webhook] Invalid signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    req.webhookVerified = true;
    console.log('[Webhook] Signature verified');
    next();

  } catch (error) {
    console.error('[Webhook] Verification error:', error);
    return res.status(500).json({ error: 'Verification failed' });
  }
};

/**
 * Helper pour extraire user info d'un token
 */
export const getUserFromSupabaseToken = (token: string) => {
  try {
    const jwtSecret = SUPABASE_JWT_SECRET || JWT_SECRET;
    const decoded: any = jwt.verify(token, jwtSecret);

    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.user_metadata?.role || 'candidate',
    };
  } catch (error) {
    console.error('[Auth] Token parse error:', error);
    return null;
  }
};

/**
 * Middleware pour vérifier un rôle spécifique
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.warn('[Auth] Unauthorized role:', req.user.role, 'allowed:', allowedRoles);
      return res.status(403).json({ 
        error: `This action requires one of roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Middleware pour Socket.io authentication
 */
export const verifySocketToken = (socket: any, next: any) => {
  try {
    const token = socket.handshake.auth.token?.replace('Bearer ', '');

    if (!token) {
      console.warn('[Socket] Missing token');
      return next(new Error('Authentication error: Missing token'));
    }

    const jwtSecret = SUPABASE_JWT_SECRET || JWT_SECRET;
    const decoded: any = jwt.verify(token, jwtSecret);

    socket.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.user_metadata?.role || 'candidate',
    };

    console.log('[Socket] Authenticated user:', socket.user.id);
    next();

  } catch (error) {
    console.error('[Socket] Authentication error:', error instanceof Error ? error.message : error);
    next(new Error('Authentication error: Invalid token'));
  }
};

// ============================================================================
// ADMIN AUTHENTICATION MIDDLEWARES
// ============================================================================

/**
 * Authenticate admin token from localStorage
 * Expects header: Authorization: Bearer <token>
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token manquant' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.body.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalide' });
  }
};

/**
 * Verify that authenticated admin is super_admin
 */
export const isSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token manquant' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Seul un Super Admin peut effectuer cette action' });
    }

    req.body.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalide' });
  }
};
