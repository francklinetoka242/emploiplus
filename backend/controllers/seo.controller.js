import sitemapGenerator from '../services/sitemap-generator.service.js';

/**
 * Endpoint administrateur pour forcer la regénération du sitemap
 * Accès : GET /api/admin/sitemap-refresh (protégé)
 * 
 * Cette route permet une actualisation manuelle sans attendre le cron quotidien
 */
export async function refreshSitemap(req, res) {
  try {
    // Déterminer l'URL de base
    const baseUrl = process.env.BASE_URL || 'https://emploiplus-group.com';
    
    console.log(`[ADMIN] Actualisation manuelle du sitemap par ${req.user?.id || 'unknown'}`);

    // Générer et écrire le sitemap
    const result = await sitemapGenerator.generateAndWriteSitemap(baseUrl);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
        filepath: result.filepath,
        urlCount: result.urlCount,
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(500).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }
  } catch (err) {
    console.error('[ADMIN] Erreur lors de l\'actualisation du sitemap:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'actualisation du sitemap',
      error: err.message
    });
  }
}

/**
 * Endpoint pour obtenir les infos du sitemap actuellement déployé
 * Accès : GET /api/admin/sitemap-info (protégé)
 */
export async function getSitemapInfo(req, res) {
  try {
    const info = sitemapGenerator.getSitemapInfo();

    if (!info) {
      return res.status(200).json({
        success: true,
        exists: false,
        message: 'Aucun sitemap trouvé. Générez-en un avec /api/admin/sitemap-refresh'
      });
    }

    return res.status(200).json({
      success: true,
      exists: true,
      ...info
    });
  } catch (err) {
    console.error('[ADMIN] Erreur lors de la récupération des infos du sitemap:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des infos du sitemap',
      error: err.message
    });
  }
}

/**
 * Endpoint de secours pour forcer la regénération du sitemap avec un token simple
 * Accès : GET /api/admin/sitemap-refresh?token=XYZ
 * 
 * Utile pour les cas d'urgence : permet de refresher le sitemap sans JWT
 * Validation : le token doit correspondre à SITEMAP_TOKEN dans .env
 */
export async function refreshSitemapWithToken(req, res) {
  try {
    const providedToken = req.query.token;
    const expectedToken = process.env.SITEMAP_TOKEN;

    // Vérifier que le token est fourni
    if (!providedToken) {
      console.warn('[SITEMAP] ✗ Tentative de refresh sans token');
      return res.status(403).json({
        success: false,
        message: 'Token manquant (paramètre ?token=XYZ requis)'
      });
    }

    // Vérifier que le token correspond
    if (providedToken !== expectedToken) {
      console.warn(`[SITEMAP] ✗ Token invalide: ${providedToken.substring(0, 5)}...`);
      return res.status(403).json({
        success: false,
        message: 'Token invalide'
      });
    }

    // Token valide, procéder au refresh
    const baseUrl = process.env.BASE_URL || 'https://emploiplus-group.com';
    
    console.log('[SITEMAP] Actualisation par token de secours');

    // Générer et écrire le sitemap
    const result = await sitemapGenerator.generateAndWriteSitemap(baseUrl);

    if (result.success) {
      console.log(`[SITEMAP] ✓ Refresh complet: ${result.urlCount} URLs`);
      return res.status(200).json({
        success: true,
        message: 'Sitemap mis à jour',
        urlCount: result.urlCount,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error(`[SITEMAP] ✗ Erreur: ${result.message}`);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la génération du sitemap',
        error: result.error
      });
    }
  } catch (err) {
    console.error('[SITEMAP] ✗ Erreur non gérée:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du refresh du sitemap',
      error: err.message
    });
  }
