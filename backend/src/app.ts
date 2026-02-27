import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import apiRouter from './routes/index.js';
import { errorMiddleware, notFoundMiddleware } from './middlewares/errorMiddleware.js';

const app: Express = express();

// Temporary debug endpoint: expose a sanitized view of registered routes
// Placed before other routes so it's always available for diagnostics
app.get('/__debug_routes', (req: Request, res: Response) => {
  try {
    const stack = (app as any)._router?.stack || [];
    const dump = stack.map((layer: any, idx: number) => {
      const info: any = { idx, name: layer.name || '<anonymous>' };
      try {
        info.regexp = layer.regexp ? String(layer.regexp) : null;
      } catch (e) {
        info.regexp = null;
      }

      if (layer.route) {
        const path = layer.route.path;
        const methods = Object.keys(layer.route.methods || {}).map((m) => m.toUpperCase());
        info.type = 'route';
        info.paths = Array.isArray(path) ? path : [path];
        info.methods = methods;
      } else if (layer.handle && layer.handle.stack && Array.isArray(layer.handle.stack)) {
        info.type = 'router';
        info.nested = layer.handle.stack.map((nested: any, nidx: number) => {
          const o: any = { nidx, name: nested.name || '<anon>' };
          if (nested.route) {
            o.paths = Array.isArray(nested.route.path) ? nested.route.path : [nested.route.path];
            o.methods = Object.keys(nested.route.methods || {}).map((m) => m.toUpperCase());
          }
          try { o.regexp = nested.regexp ? String(nested.regexp) : null; } catch (e) { o.regexp = null; }
          return o;
        });
      }

      // Also include available property keys and their primitive types to inspect shape
      try {
        info.keys = Object.keys(layer).reduce((acc: any, k: string) => {
          const t = typeof (layer as any)[k];
          acc[k] = t;
          return acc;
        }, {});
      } catch (e) {
        info.keys = null;
      }

      return info;
    });

    res.json({ success: true, dump, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ============================================================
// Sécurité et Middlewares de base
// ============================================================

// Helmet - Sécurité des headers HTTP
app.use(helmet());

// CORS - Gestion des origines autorisées
// Autorise tous les domaines production et développement
const allowedOrigins = (process.env.CORS_ORIGINS || 'https://www.emploiplus-group.com,https://emploiplus-group.com,http://emploiplus-group.com,http://195.110.35.133,http://localhost:5173').split(',');
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Compression des réponses
app.use(compression());

// Body Parser
app.use(express.json({ limit: process.env.MAX_JSON_SIZE || '1mb' }));
app.use(express.urlencoded({ limit: process.env.MAX_JSON_SIZE || '1mb', extended: true }));

// ============================================================
// Routes
// ============================================================

/**
 * Route racine
 */
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Backend Emploiplus Goup API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      api: 'GET /api',
      health: 'GET /api/health',
    },
  });
});

/**
 * Route de santé (Health Check)
 * GET /api/health
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
  });
});

/**
 * Routeur Central API
 * Toutes les routes API sont préfixées par /api
 * Exemples:
 * - GET /api/jobs
 * - GET /api/formations
 * - GET /api/jobs/stats
 */
app.use('/api', apiRouter);

// ============================================================
// Gestion des Erreurs et 404
// ============================================================

/**
 * Middleware pour les routes non trouvées
 * IMPORTANTE: À placer AVANT le middleware d'erreur global
 */
app.use(notFoundMiddleware);

/**
 * Middleware de gestion des erreurs GLOBAL
 * IMPORTANT: Doit être enregistré EN DERNIER
 * Capture TOUTES les erreurs non gérées et les retourne en JSON
 */
app.use(errorMiddleware);

export default app;
