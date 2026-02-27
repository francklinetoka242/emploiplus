import { Request, Response, NextFunction } from 'express';

/**
 * Interface pour les erreurs applicatives
 */
export interface AppError extends Error {
  statusCode?: number;
  context?: string;
}

/**
 * Classe pour les erreurs applicatives
 */
export class CustomError extends Error implements AppError {
  statusCode: number;
  context?: string;

  constructor(message: string, statusCode: number = 500, context?: string) {
    super(message);
    this.name = 'CustomError';
    this.statusCode = statusCode;
    this.context = context;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

/**
 * Middleware de gestion des erreurs
 * IMPORTANT: Doit être enregistré en dernier dans app.ts
 * 
 * Propriétés:
 * - Intercepte TOUTES les erreurs (non gérées ou lancées)
 * - Retourne un JSON { success: false, message, error }
 * - N'interrompt JAMAIS le serveur
 * - Logge l'erreur complète en console
 */
export function errorMiddleware(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log l'erreur complète pour le debug
  const timestamp = new Date().toISOString();
  const context = (error as AppError).context || 'Unknown';
  
  console.error('');
  console.error('╔════════════════════════════════════════════════════════╗');
  console.error('║ ❌ ERREUR CAPTURÉE PAR LE MIDDLEWARE GLOBAL             ║');
  console.error('╚════════════════════════════════════════════════════════╝');
  console.error(`📅 Timestamp: ${timestamp}`);
  console.error(`🔗 URL: ${req.method} ${req.path}`);
  console.error(`📝 Contexte: ${context}`);
  console.error(`💬 Message: ${error.message}`);
  console.error(`📦 Stack: ${error.stack || 'No stack available'}`);
  console.error('');

  // Déterminer le code de statut
  const statusCode = (error as AppError).statusCode || 500;
  const isServerError = statusCode >= 500;

  // Répondre avec JSON structuré
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Une erreur intattendue s\'est produite',
    error: {
      context: (error as AppError).context,
      path: req.path,
      method: req.method,
      timestamp,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    },
    // En production, éviter d'exposer les détails techniques
    ...(process.env.NODE_ENV !== 'production' && {
      fullError: error.message,
    }),
  });

  // Log d'alerte pour erreurs serveur
  if (isServerError) {
    console.warn(`⚠️  ERREUR SERVEUR [${statusCode}] - ${error.message}`);
  }

  // NE PAS arrêter le serveur - il continue de fonctionner
  // next() n'est pas appelé car c'est le middlewrae final
}

/**
 * Middleware pour capturer les routes non trouvées (404)
 * À placer APRÈS tous les autres middlewares
 */
export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    error: {
      context: 'Not Found',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
      availableRoutes: {
        health: 'GET /api/health',
        jobs: 'GET /api/jobs',
        formations: 'GET /api/formations',
      },
    },
  });
}
