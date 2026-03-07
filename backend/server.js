// Charger les variables d'environnement et config globales
import dotenv from 'dotenv';
dotenv.config();

// gestion globale des erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  if (process.env.NODE_ENV !== 'production') process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

// imports tiers & utilitaires
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

// DB pool
import pool from './config/db.js';

// middlewares internes
import errorHandler from './middleware/errorHandler.js';
import { auditLoggingMiddleware } from './middleware/auditLogging.middleware.js';
import { requireAdmin, requireRoles, requireSuperAdmin } from './middleware/auth.middleware.js';

// contrôleurs utilitaires
import { exportStats as adminExportStats } from './controllers/admin.controller.js';
import { getHealth, getHealthDB, getHealthAPI, getHealthSystem } from './controllers/dashboard.controller.js';

// services sitemap
import sitemapGenerator from './services/sitemap-generator.service.js';
import sitemapCron from './services/sitemap-cron.service.js';

// routes
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
import seoRoutes from './routes/seo.routes.js';

// __dirname pour ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// application
const app = express();
const PORT = process.env.PORT || 5000;

// middleware: logging
app.use((req, res, next) => {
  console.log('[HTTP]', req.method, req.path, 'Content-Length:', req.headers['content-length']);
  next();
});

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://emploiplus-group.com',
  credentials: true,
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// multer routes before body parsers
app.use('/api/ai', aiRoutes);
app.use('/api/uploads', uploadRoutes);

app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({limit:'50mb', extended:true}));
app.use((req,res,next)=>{
  if(req.headers['content-type']?.includes('multipart/form-data')) req.setTimeout(300000);
  next();
});

app.use(auditLoggingMiddleware);

app.get('/', (req,res)=> res.json({success:true,message:'Backend server is running'}));

// api routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/job-applications', jobApplicationRoutes);
app.use('/api/admin/jobs', requireAdmin, requireRoles('super_admin','admin_offres'), jobRoutes);
app.use('/api/formations', formationRoutes);
app.use('/api/admin/formations', requireAdmin, requireRoles('super_admin'), formationRoutes);
app.use('/api/services/catalogs', serviceCatalogRoutes);
app.use('/api/admin/services/catalogs', requireAdmin, requireRoles('super_admin'), serviceCatalogRoutes);
app.use('/api/admin/service-categories', requireAdmin, requireRoles('super_admin'), serviceCatalogRoutes);
app.use('/api/admin/services', requireAdmin, requireRoles('super_admin'), serviceRoutes);
app.use('/api/publications', publicationRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/admin/faq', requireAdmin, requireRoles('super_admin','perm_manage_faq'), faqRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin/users', requireAdmin, requireRoles('super_admin'), userRoutes);
app.use('/api/admin/management/admins', requireAdmin, requireRoles('super_admin'), adminManagementRoutes);
app.use('/api/admins', adminsRoutes);
app.get('/api/admin/stats', requireAdmin, requireRoles('super_admin'), adminExportStats);
app.get('/api/admin/health', requireAdmin, requireRoles('super_admin'), getHealth);
app.get('/api/admin/health/db', requireAdmin, requireRoles('super_admin'), getHealthDB);
app.get('/api/admin/health/api', requireAdmin, requireRoles('super_admin'), getHealthAPI);
app.get('/api/admin/health/system', requireAdmin, requireRoles('super_admin'), getHealthSystem);
app.get('/api/dashboard/stats', requireAdmin, adminExportStats);
app.use('/api/site-notifications', siteNotificationsRoutes);
app.use('/api/admin/site-notifications', requireAdmin, requireRoles('super_admin'), siteNotificationsRoutes);
app.use('/api/admin/seo', requireAdmin, requireRoles('super_admin'), seoRoutes);
app.get('/sitemap.xml', (req,res)=>{
  const sitemapPath = path.join(__dirname,'public/sitemap.xml');
  res.set('Content-Type','application/xml');
  res.sendFile(sitemapPath,(err)=>{
    if(err){
      console.error('Erreur lecture sitemap:',err.message);
      res.status(404).send('Sitemap not found');
    }
  });
});
app.use('/api/admin/login-history', requireAdmin, requireRoles('super_admin'), loginHistoryRoutes);
app.use('/api/admin/audit-logs', requireAdmin, requireRoles('super_admin'), auditLogRoutes);
app.use('/api/documentations', documentationRoutes);
app.use('/api/admin/documentations', requireAdmin, requireRoles('super_admin','admin'), documentationRoutes);
app.use('/uploads', express.static(path.join(__dirname,'../uploads/public')));

// SPA frontend
const frontendDistPath = path.join(__dirname,'../frontend/dist');
app.use(express.static(frontendDistPath));
app.use((req,res,next)=>{
  if(req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendDistPath,'index.html'));
});

// catch-all handlers
app.use((req,res)=> res.status(404).json({success:false,message:'Route not found'}));
app.use(errorHandler);

// startup function
async function startServer(){
  try{
    const connection = await pool.connect();
    console.log('✓ Database connection successful');
    connection.release();
    app.listen(PORT, async()=>{
      console.log(`✓ Server listening on port ${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}/api`);
      try{
        const baseUrl = process.env.BASE_URL||'https://emploiplus-group.com';
        console.log('[STARTUP] Génération initiale du sitemap...');
        const initialResult = await sitemapGenerator.generateAndWriteSitemap(baseUrl);
        if(initialResult.success) console.log(`[STARTUP] ✓ Sitemap initial généré (${initialResult.urlCount} URLs)`);
        else console.log(`[STARTUP] ⚠ Erreur lors de la génération initiale: ${initialResult.message}`);
        sitemapCron.initSitemapCron(baseUrl);
        console.log('[STARTUP] ✓ Cron job de sitemap activé (03:00 chaque jour)\n');
      }catch(err){
        console.error('[STARTUP] ✗ Erreur lors de l\'initialisation du sitemap:',err.message);
      }
    });
  }catch(err){
    console.error('✗ Database connection failed:',err.message);
    process.exit(1);
  }
}

startServer();
// ===== MIDDLEWARES DE BASE (avant les routes multer) =====

// simple request logger for debugging
app.use((req, res, next) => {
  console.log('[HTTP]', req.method, req.path, 'Content-Length:', req.headers['content-length']);
  next();
});


// cross-origin : configurer la politique CORS
// sécurité : utiliser helmet pour définir divers en-têtes HTTP
app.use(helmet());

// cross-origin : configurer la politique CORS
// ✅ ON SUPPRIME LA LIGNE 'const cors = require...' car l'import est déjà fait en haut du fichier

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

// SEO sitemap management (admin only)
app.use('/api/admin/seo', requireAdmin, requireRoles('super_admin'), seoRoutes);

// Serve static sitemap from public/sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  const sitemapPath = path.join(__dirname, 'public/sitemap.xml');
  res.set('Content-Type', 'application/xml');
  res.sendFile(sitemapPath, (err) => {
    if (err) {
      console.error('Erreur lors de la lecture du sitemap:', err.message);
      res.status(404).send('Sitemap not found');
    }
  });
});

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
    app.listen(PORT, async () => {
      console.log(`✓ Server listening on port ${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}/api`);

      // ===== INITIALISATION DU SITEMAP =====
      try {
        const baseUrl = process.env.BASE_URL || 'https://emploiplus-group.com';

        // Générer le sitemap initial au démarrage
        console.log('\n[STARTUP] Génération initiale du sitemap...');
        const initialResult = await sitemapGenerator.generateAndWriteSitemap(baseUrl);
        if (initialResult.success) {
          console.log(`[STARTUP] ✓ Sitemap initial généré (${initialResult.urlCount} URLs)`);
        } else {
          console.log(`[STARTUP] ⚠ Erreur lors de la génération initiale: ${initialResult.message}`);
        }

        // Initialiser le cron job pour la génération automatique
        sitemapCron.initSitemapCron(baseUrl);
        console.log('[STARTUP] ✓ Cron job de sitemap activé (03:00 chaque jour)\n');
      } catch (err) {
        console.error('[STARTUP] ✗ Erreur lors de l\'initialisation du sitemap:', err.message);
      }
    });
  } catch (err) {
    // si la connexion à la base échoue, enregistrer l'erreur et quitter
    console.error('✗ Database connection failed:', err.message);
    process.exit(1);
  }
}

// start the server
startServer();
