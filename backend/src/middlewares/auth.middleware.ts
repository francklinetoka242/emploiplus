import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomError } from './errorMiddleware.js';

/**
 * Interface pour le payload JWT décodé
 */
export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Étendre le type Request pour ajouter le payload JWT
 */
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      token?: string;
    }
  }
}

/**
 * Middleware d'authentification JWT
 * 
 * Propriétés:
 * - Vérifie la présence d'un JWT dans le header Authorization: Bearer <token>
 * - Valide et décode le token avec JWT_SECRET
 * - Retourne 401 (Unauthorized) si invalide
 * - Ajoute les infos de l'utilisateur à req.user
 * - NE COUPE JAMAIS LE SERVEUR - les erreurs vont au middleware global
 * 
 * Usage:
 * ```typescript
 * router.get('/protected', authMiddleware, asyncHandler(controller));
 * ```
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomError(
        'Token manquant. Format attendu: Authorization: Bearer <token>',
        401,
        'authMiddleware'
      );
    }

    // Extraire le token après "Bearer "
    const token = authHeader.substring(7);

    if (!token || token.trim().length === 0) {
      throw new CustomError(
        'Token vide',
        401,
        'authMiddleware'
      );
    }

    // Vérifier et décoder le token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new CustomError(
        'JWT_SECRET non configuré',
        500,
        'authMiddleware'
      );
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
      
      // Ajouter les infos du user au request
      req.user = decoded;
      req.token = token;

      // Log en développement
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Token valide pour user: ${decoded.email} (${decoded.role})`);
      }

      next();
    } catch (jwtError) {
      const message = jwtError instanceof jwt.TokenExpiredError
        ? 'Le token a expiré'
        : jwtError instanceof jwt.JsonWebTokenError
        ? 'Token invalide ou malformé'
        : 'Erreur lors de la vérification du token';

      throw new CustomError(message, 401, 'authMiddleware.verify');
    }
  } catch (error) {
    // Laisser le middleware d'erreur global gérer
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(new CustomError(
        error instanceof Error ? error.message : 'Erreur d\'authentification',
        401,
        'authMiddleware'
      ));
    }
  }
}

/**
 * Middleware pour vérifier les rôles
 * 
 * Usage:
 * ```typescript
 * router.delete('/admin/users/:id', authMiddleware, requireRole('admin'), asyncHandler(deleteUser));
 * ```
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new CustomError(
          'Utilisateur non authentifié',
          401,
          'requireRole'
        );
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new CustomError(
          `Accès refusé. Rôles autorisés: ${allowedRoles.join(', ')}. Votre rôle: ${req.user.role}`,
          403,
          'requireRole'
        );
      }

      next();
    } catch (error) {
      if (error instanceof CustomError) {
        next(error);
      } else {
        next(new CustomError(
          'Erreur lors de la vérification du rôle',
          500,
          'requireRole'
        ));
      }
    }
  };
}

/**
 * Middleware optionnel - n'échoue pas si pas de token (utile pour les routes publiques)
 * Ajoute req.user si le token est valide, sinon continue sans
 */
export function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Continuer sans user
      return next();
    }

    const token = authHeader.substring(7);

    if (!token || token.trim().length === 0) {
      // Continuer sans user
      return next();
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      // Continuer sans user
      return next();
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
      req.user = decoded;
      req.token = token;
    } catch {
      // Token invalide - continuer sans user
    }

    next();
  } catch {
    // En cas d'erreur, continuer sans user
    next();
  }
}
