// Charger les variables d'environnement depuis le fichier .env
import dotenv from 'dotenv';
dotenv.config();

// importer les middlewares et utilitaires tiers
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

// importer le pool de base de données
import pool from './config/db.js';

// importer les middlewares personnalisés
import errorHandler from './middleware/errorHandler.js';

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
import loginHistoryRoutes from './routes/login-history.routes.js';
import { requireAdmin, requireRoles, requireSuperAdmin } from './middleware/auth.middleware.js';
import { fileURLToPath } from 'url';

// ESM does not provide __dirname; derive it from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// initialiser l'application express
const app = express();

// récupérer le port depuis l'environnement ou utiliser la valeur par défaut
const PORT = process.env.PORT || 5000;

// ===== PILE DE MIDDLEWARES =====

// sécurité : utiliser helmet pour définir divers en-têtes HTTP
app.use(helmet());

// cross-origin : configurer la politique CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// analyse du corps : parser les corps de requête JSON entrants
app.use(express.json());

// ===== VÉRIFICATION D'ÉTAT =====

// point de terminaison racine pour vérifier l'état
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Backend server is running' });
});

// ===== ROUTES DE L'API =====

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

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

// login history
app.use('/api/admin/login-history', requireAdmin, requireRoles('super_admin'), loginHistoryRoutes);
// servir les fichiers uploadés en statique (pour que le client puisse accéder à `/uploads/...`)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// points de terminaison d'upload
app.use('/api/uploads', uploadRoutes);

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
