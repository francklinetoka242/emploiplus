/**
 * Request Logger Middleware
 * Simple, production-grade request logging
 */

import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, path, ip } = req;

  // Log on response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusEmoji = status < 400 ? '✅' : status < 500 ? '⚠️ ' : '❌';
    console.log(`${statusEmoji} [${method}] ${path} ${status} (${duration}ms) - ${ip}`);
  });

  next();
}
