// Charger les variables d'environnement depuis le fichier .env
import dotenv from 'dotenv';
dotenv.config();

// ===== GESTIONNAIRES D'ERREUR GLOBAUX =====
// Éviter que le serveur ne crash complètement en cas d'erreur non gérée

process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION:', err);
  console.error('Stack:', err.stack);
  // Ne pas quitter le processus en production, juste logger
  if (process.env.NODE_ENV === 'production') {
    console.error('Continuing execution despite uncaught exception...');
  } else {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION at:', promise, 'reason:', reason);
  // Ne pas quitter le processus, juste logger
  console.error('Continuing execution despite unhandled rejection...');
});

// importer les middlewares et utilitaires tiers
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

// importer le pool de base de données
import pool from './config/db.js';

// importer les middlewares personnalisés
import errorHandler from './middleware/errorHandler.js';
import { auditLoggingMiddleware } from './middleware/auditLogging.middleware.js';

// importer les gestionnaires de routes
import authRoutes from './routes/auth.routes.js';
import jobRoutes from './routes/job.routes.js';
import formationRoutes from './routes/formation.routes.js';
import publicationRoutes from './routes/publication.routes.js';
import faqRoutes from './routes/faq.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import serviceRoutes from './routes/service.routes.js';
import serviceCatalogRoutes from './routes/service-catalog.routes.js';
import companyRoutes from './routes/company.routes.js';
import userRoutes from './routes/user.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import adminManagementRoutes from './routes/admin-management.routes.js';
import adminsRoutes from './routes/admins.routes.js';
import siteNotificationsRoutes from './routes/site-notifications.routes.js';
import loginHistoryRoutes from './routes/login-history.routes.js';
import auditLogRoutes from './routes/audit-log.routes.js';
import documentationRoutes from './routes/documentation.routes.js';
import aiRoutes from './routes/ai.routes.js';
import jobApplicationRoutes from './routes/job-application.routes.js';
import { requireAdmin, requireRoles, requireSuperAdmin } from './middleware/auth.middleware.js';
import { exportStats as adminExportStats } from './controllers/admin.controller.js';
import { getHealth, getHealthDB, getHealthAPI, getHealthSystem } from './controllers/dashboard.controller.js';
import { fileURLToPath } from 'url';

// ESM does not provide __dirname; derive it from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// initialiser l'application express
const app = express();

// récupérer le port depuis l'environnement ou utiliser la valeur par défaut
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARES DE BASE (avant les routes multer) =====

// simple request logger for debugging
app.use((req, res, next) => {
  console.log('[HTTP]', req.method, req.path, 'Content-Length:', req.headers['content-length']);
  next();
});

// sécurité : utiliser helmet pour définir divers en-têtes HTTP
app.use(helmet());

// cross-origin : configurer la politique CORS
const cors = require('cors');

const corsOptions = {
  // On récupère l'URL du .env, sinon on met celle du site par défaut
  origin: process.env.CORS_ORIGIN || 'https://emploiplus-group.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// ===== ROUTES UTILISANT MULTER (AVANT les parsers body globaux) =====
// ✅ ORDRE CRITIQUE : Les routes multipart doivent être définies AVANT express.json()
// pour éviter que express.json() ne tente de parser le multipart/form-data comme du JSON

// AI services for CV analysis (utilise multer pour les uploads PDF)
app.use('/api/ai', aiRoutes);

// File upload endpoints (utilise multer)
app.use('/api/uploads', uploadRoutes);

// ===== PARSERS DE CORPS GLOBAUX (APRÈS les routes multer) =====
// ✅ Ces middlewares viennent APRÈS les routes multer
// Les requêtes multipart/form-data ont déjà été traitées par multer

// JSON body parser
app.use(express.json({ limit: '50mb' }));

// URL-encoded form parser
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Middleware for handling large payloads timeout
app.use((req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    // 5 minutes timeout for file uploads
    req.setTimeout(300000);
  }
  next();
});

// ===== VÉRIFICATION D'ÉTAT =====

// Audit logging middleware for admin actions
app.use(auditLoggingMiddleware);

// point de terminaison racine pour vérifier l'état
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Backend server is running' });
});

// ===== ROUTES DE L'API (après les parsers body) =====

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
// job applications handling (email notifications & admin management)
app.use('/api/job-applications', jobApplicationRoutes);

// admin portal needs a dedicated path for managing job offers
// we mount the same router under /api/admin/jobs and protect all endpoints
// add a blanket role check so that only super_admin or admin_offres can even hit this router
app.use('/api/admin/jobs', requireAdmin, requireRoles('super_admin','admin_offres'), jobRoutes);

app.use('/api/formations', formationRoutes);
// admin mount for formations (super_admin only for now)
app.use('/api/admin/formations', requireAdmin, requireRoles('super_admin'), formationRoutes);

app.use('/api/services/catalogs', serviceCatalogRoutes);
// admin mount for service catalogs
app.use('/api/admin/services/catalogs', requireAdmin, requireRoles('super_admin'), serviceCatalogRoutes);
// alias for backward compatibility with frontend
app.use('/api/admin/service-categories', requireAdmin, requireRoles('super_admin'), serviceCatalogRoutes);
// admin mount for services (super_admin only for now)
app.use('/api/admin/services', requireAdmin, requireRoles('super_admin'), serviceRoutes);

app.use('/api/publications', publicationRoutes);
app.use('/api/faq', faqRoutes);
// admin FAQ management mount (reuse same router)
app.use('/api/admin/faq', requireAdmin, requireRoles('super_admin','perm_manage_faq'), faqRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/users', userRoutes);
// admin user management
app.use('/api/admin/users', requireAdmin, requireRoles('super_admin'), userRoutes);

// admin management endpoints (admins, exports, etc.)
app.use('/api/admin/management/admins', requireAdmin, requireRoles('super_admin'), adminManagementRoutes);

// simple admins endpoints for getting/updating admin by ID
app.use('/api/admins', adminsRoutes);

// Convenience endpoint used by frontend: GET /api/admin/stats
// Reuses the existing exportStats controller but exposed at a shorter path
app.get('/api/admin/stats', requireAdmin, requireRoles('super_admin'), adminExportStats);

// Health check endpoints for admin panel
app.get('/api/admin/health', requireAdmin, requireRoles('super_admin'), getHealth);
app.get('/api/admin/health/db', requireAdmin, requireRoles('super_admin'), getHealthDB);
app.get('/api/admin/health/api', requireAdmin, requireRoles('super_admin'), getHealthAPI);
app.get('/api/admin/health/system', requireAdmin, requireRoles('super_admin'), getHealthSystem);

// Dashboard stats endpoint (protected)
app.get('/api/dashboard/stats', requireAdmin, adminExportStats);

// site notifications (public read, admin write)
app.use('/api/site-notifications', siteNotificationsRoutes);
app.use('/api/admin/site-notifications', requireAdmin, requireRoles('super_admin'), siteNotificationsRoutes);

// login history
app.use('/api/admin/login-history', requireAdmin, requireRoles('super_admin'), loginHistoryRoutes);

// audit logs (read-only, super admin only)
app.use('/api/admin/audit-logs', requireAdmin, requireRoles('super_admin'), auditLogRoutes);

// documentations (public read, admin write)
app.use('/api/documentations', documentationRoutes);
app.use('/api/admin/documentations', requireAdmin, requireRoles('super_admin','admin'), documentationRoutes);

// servir uniquement les fichiers publics des uploads en statique
// cela évite l'accès direct aux dossiers privées (gérés via route sécurisée)
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads/public'))
);

// ===== SERVIR LA FRONTEND (SPA) =====

// servir les fichiers statiques frontend (CSS, JS, images)
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// fallback route pour le routeur SPA : renvoyer index.html pour les routes inconnues
// cela permet aux routes React Router de fonctionner correctement
app.use((req, res, next) => {
  // ne pas intercepter les requêtes API
  if (req.path.startsWith('/api')) {
    return next();
  }
  // renvoyer index.html pour toutes les autres routes (SPA)
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// ===== GESTIONNAIRE 404 =====

// si aucune route ne correspond, renvoyer une erreur 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ===== GESTIONNAIRE D'ERREUR =====

// middleware de gestion centralisée des erreurs (doit être le dernier)
app.use(errorHandler);

// ===== BASE DE DONNÉES & DÉMARRAGE DU SERVEUR =====

// tester la connexion à la base de données avant de démarrer le serveur
async function startServer() {
  try {
    // tenter de se connecter à la base PostgreSQL
    const connection = await pool.connect();
    console.log('✓ Database connection successful');
    connection.release(); // release connection back to pool

    // commencer à écouter les requêtes entrantes
    app.listen(PORT, () => {
      console.log(`✓ Server listening on port ${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}/api`);
    });
  } catch (err) {
    // si la connexion à la base échoue, enregistrer l'erreur et quitter
    console.error('✗ Database connection failed:', err.message);
    process.exit(1);
  }
}

// start the server
startServer();
