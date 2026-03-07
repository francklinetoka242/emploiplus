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

const app = express();
const PORT = process.env.PORT || 5000;

// middleware de base
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

// routes utilisant multer (avant parsers body)
app.use('/api/ai', aiRoutes);
app.use('/api/uploads', uploadRoutes);

// parsers body
app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({limit:'50mb', extended:true}));
app.use((req,res,next)=>{
  if(req.headers['content-type']?.includes('multipart/form-data')) req.setTimeout(300000);
  next();
});

app.use(auditLoggingMiddleware);

app.get('/', (req,res)=> res.json({success:true,message:'Backend server is running'}));

// ----- API routes -----
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

// 404 + error handler
app.use((req,res)=> res.status(404).json({success:false,message:'Route not found'}));
app.use(errorHandler);

// démarrage serveur
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
