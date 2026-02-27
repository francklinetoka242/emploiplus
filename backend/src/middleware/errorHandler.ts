/**
 * Global Error Handler Middleware
 * Production-grade error handling with safe fallbacks
 */

import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const isDev = process.env.NODE_ENV !== 'production';

  // Log the error
  console.error('🚨 Error:', {
    message: err?.message || 'Unknown error',
    status: err?.status || 500,
    path: req.path,
    method: req.method,
    ...(isDev && { stack: err?.stack }),
  });

  // Don't respond if response already sent
  if (res.headersSent) {
    return next(err);
  }

  // Build error response
  const status = err?.status || err?.statusCode || 500;
  const response: any = {
    success: false,
    message: isDev ? err?.message : 'Erreur serveur',
  };

  // Include stack in development
  if (isDev && err?.stack) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
}
