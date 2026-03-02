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
import companyRoutes from './routes/company.routes.js';
import userRoutes from './routes/user.routes.js';
import uploadRoutes from './routes/upload.routes.js';
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
app.use('/api/publications', publicationRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/users', userRoutes);
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
