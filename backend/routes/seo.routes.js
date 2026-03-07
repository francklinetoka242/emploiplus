import express from 'express';
const router = express.Router();
import { refreshSitemap, getSitemapInfo, refreshSitemapWithToken } from '../controllers/seo.controller.js';
import { requireAdmin, requireRoles } from '../middleware/auth.middleware.js';

// GET /api/seo/sitemap.xml - Endpoint publique (sera servie en statique par Apache/Express)
// Cette route n'est plus utilisée ici car le sitemap est généré statiquement
// et servi directement par le serveur web

// GET /api/admin/seo/refresh - Forcer la regénération du sitemap (JWT)
// Protégé : super_admin uniquement
router.get('/refresh', requireAdmin, requireRoles('super_admin'), refreshSitemap);

// GET /api/admin/seo/info - Obtenir les infos du sitemap courant (JWT)
// Protégé : super_admin uniquement
router.get('/info', requireAdmin, requireRoles('super_admin'), getSitemapInfo);

// GET /api/admin/sitemap-refresh?token=XYZ - Refresh par token simple (route de secours)
// ATTENTION : cette route n'est PAS protégée par JWT mais par un token simple
// Elle est accessible publiquement mais nécessite le bon token dans ?token=
// À utiliser en cas de perte d'accès admin ou urgence
router.get('/sitemap-refresh', refreshSitemapWithToken);

export default router;
