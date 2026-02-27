import { Request, Response, NextFunction } from 'express';
import { CustomError } from './errorMiddleware.js';

/**
 * Type pour une fonction controller asynchrone
 */
export type AsyncControllerFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Wrapper pour les fonctions asynchrones
 * Avite la répétition des try/catch dans tous les controllers
 * Assure l'isolation des erreurs sans interrompre le serveur
 * 
 * Utilisation:
 * ```typescript
 * router.get('/jobs', asyncHandler(jobsController.getJobs));
 * router.post('/jobs', asyncHandler(jobsController.createJob));
 * ```
 * 
 * Les erreurs lancées sont automatiquement capturées et passées
 * au middleware d'erreur global (errorMiddleware)
 */
export function asyncHandler(fn: AsyncControllerFunction) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Wrapping de la fonction asynchrone avec gestion d'erreur
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // Si l'erreur n'a pas de contexte, on l'ajoute
      if (error instanceof CustomError) {
        next(error);
      } else {
        // Convertir les erreurs génériques en CustomError
        const appError = new CustomError(
          error.message || 'Unknown error',
          error.statusCode || 500,
          'asyncHandler'
        );
        next(appError);
      }
    });
  };
}

/**
 * Variante alternative avec try/catch explicite si nécessaire
 * (Rarement utilisée car le wrapper ci-dessus suffit)
 */
export function asyncHandlerWithTryCatch(fn: AsyncControllerFunction) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const appError = new CustomError(message, 500, 'asyncHandlerWithTryCatch');
      next(appError);
    }
  };
}
