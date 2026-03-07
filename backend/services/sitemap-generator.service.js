import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jobService from './job.service.js';
import formationService from './formation.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin physique du sitemap à écrire en statique
const SITEMAP_PATH = path.join(__dirname, '../public/sitemap.xml');

/**
 * Helper: Récupère ALL items en paginating (max 100 par page)
 * @param {Function} serviceMethod - Méthode du service (jobService.getJobs ou formationService.getFormations)
 * @param {Object} baseQuery - Query de base (ex: { published: true })
 * @returns {Promise<Array>} Liste complète de tous les items
 */
async function getAllItemsWithPagination(serviceMethod, baseQuery = {}) {
  const allItems = [];
  const pageSize = 100;  // Max par page
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      const query = { ...baseQuery, limit: pageSize, offset };
      const result = await serviceMethod(query);
      
      const items = Array.isArray(result) ? result : (result.data || []);
      
      if (items.length === 0) {
        hasMore = false;
      } else {
        allItems.push(...items);
        offset += pageSize;
        
        // Si moins d'items que pageSize, on a atteint la fin
        if (items.length < pageSize) {
          hasMore = false;
        }
      }
    } catch (err) {
      console.warn(`[SITEMAP] Erreur lors de la récupération (offset ${offset}):`, err.message);
      hasMore = false;
    }
  }

  return allItems;
}

/**
 * Génère le fichier sitemap.xml à partir de la base de données
 * et l'écrit physiquement dans public/sitemap.xml
 * 
 * @param {string} baseUrl - URL de base du site (ex: https://emploiplus-group.com)
 * @returns {Promise<object>} Résultat { success, message, filepath }
 */
export async function generateAndWriteSitemap(baseUrl) {
  try {
    console.log(`[SITEMAP] Démarrage génération pour ${baseUrl}`);

    // Récupérer TOUTES les offres d'emploi publiées (avec pagination)
    const jobs = await getAllItemsWithPagination(
      jobService.getJobs.bind(jobService),
      { published: true }
    );
    
    // Récupérer TOUTES les formations publiées (avec pagination)
    const formations = await getAllItemsWithPagination(
      formationService.getFormations.bind(formationService),
      { published: true }
    );

    console.log(`[SITEMAP] ${jobs.length} jobs trouvées, ${formations.length} formations trouvées`);

    const urls = [];

    // Pages institutionnelles
    urls.push({ loc: `${baseUrl}/`, priority: '1.0' });
    urls.push({ loc: `${baseUrl}/a-propos`, priority: '0.6' });
    urls.push({ loc: `${baseUrl}/contact`, priority: '0.6' });
    urls.push({ loc: `${baseUrl}/cv`, priority: '0.7' });
    urls.push({ loc: `${baseUrl}/lettre-de-motivation`, priority: '0.7' });
    urls.push({ loc: `${baseUrl}/simulateur-entretien`, priority: '0.7' });
    urls.push({ loc: `${baseUrl}/tests-competence`, priority: '0.7' });
    urls.push({ loc: `${baseUrl}/cartes-de-visite`, priority: '0.6' });
    urls.push({ loc: `${baseUrl}/flyers`, priority: '0.6' });
    urls.push({ loc: `${baseUrl}/bannieres`, priority: '0.6' });
    urls.push({ loc: `${baseUrl}/portfolio`, priority: '0.6' });
    urls.push({ loc: `${baseUrl}/services`, priority: '0.7' });
    urls.push({ loc: `${baseUrl}/privacy`, priority: '0.4' });
    urls.push({ loc: `${baseUrl}/legal`, priority: '0.4' });
    urls.push({ loc: `${baseUrl}/cookies`, priority: '0.4' });

    // Pages de listes
    urls.push({ loc: `${baseUrl}/emplois`, priority: '0.9' });
    urls.push({ loc: `${baseUrl}/formations`, priority: '0.8' });

    // URLs dynamiques : offres d'emploi
    if (Array.isArray(jobs)) {
      jobs.forEach(job => {
        if (job.id) {
          urls.push({ loc: `${baseUrl}/jobs/${job.id}`, priority: '0.9' });
        }
      });
    }

    // URLs dynamiques : formations
    if (Array.isArray(formations)) {
      formations.forEach(f => {
        if (f.id) {
          urls.push({ loc: `${baseUrl}/formations/${f.id}`, priority: '0.8' });
        }
      });
    }

    // Construire le XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    urls.forEach(u => {
      xml += `  <url>\n`;
      xml += `    <loc>${u.loc}</loc>\n`;
      xml += `    <priority>${u.priority}</priority>\n`;
      xml += `  </url>\n`;
    });
    xml += `</urlset>`;

    // Écrire le fichier de façon synchrone pour assurer l'atomicité
    fs.writeFileSync(SITEMAP_PATH, xml, 'utf8');

    console.log(`[SITEMAP] ✓ Sitemap écrit avec succès (${urls.length} URLs)`);
    return {
      success: true,
      message: `Sitemap généré avec succès (${urls.length} URLs)`,
      filepath: SITEMAP_PATH,
      urlCount: urls.length
    };
  } catch (err) {
    console.error(`[SITEMAP] ✗ Erreur lors de la génération:`, err.message);
    return {
      success: false,
      message: `Erreur lors de la génération du sitemap: ${err.message}`,
      error: err.message
    };
  }
}

/**
 * Vérifie si un sitemap existe et retourne ses infos
 * @returns {object} Infos du fichier ou null s'il n'existe pas
 */
export function getSitemapInfo() {
  try {
    if (!fs.existsSync(SITEMAP_PATH)) {
      return null;
    }
    const stat = fs.statSync(SITEMAP_PATH);
    return {
      exists: true,
      path: SITEMAP_PATH,
      size: stat.size,
      lastModified: stat.mtime,
      sizeKB: (stat.size / 1024).toFixed(2)
    };
  } catch (err) {
    console.error('[SITEMAP] Erreur lors de la vérification du sitemap:', err.message);
    return null;
  }
}

export default {
  generateAndWriteSitemap,
  getSitemapInfo,
  SITEMAP_PATH
};
