import cron from 'node-cron';
import sitemapGenerator from './sitemap-generator.service.js';

/**
 * Service de planification (cron) pour la génération automatique du sitemap
 * Exécution quotidienne à 03:00 du matin (heure du serveur)
 */

let cronJob = null;

/**
 * Initialise le cron job pour la génération du sitemap
 * Exécution : Tous les jours à 03:00
 * Format cron : minute heure jour mois_jour jour_semaine
 *                0    3    *   *           *
 * 
 * @param {string} baseUrl - URL de base du site
 * @returns {void}
 */
export function initSitemapCron(baseUrl = 'https://emploiplus-group.com') {
  try {
    // Arrêter tout cron existant
    if (cronJob) {
      cronJob.stop();
      console.log('[CRON] Cron job précédent arrêté');
    }

    // Créer une nouvelle tâche cron : 03:00 chaque jour
    cronJob = cron.schedule('0 3 * * *', async () => {
      const now = new Date().toISOString();
      console.log(`\n[CRON] ⏰ Exécution du cron de génération sitemap - ${now}`);
      
      try {
        const result = await sitemapGenerator.generateAndWriteSitemap(baseUrl);
        if (result.success) {
          console.log(`[CRON] ✓ Sitemap généré avec succès (${result.urlCount} URLs)`);
        } else {
          console.log(`[CRON] ✗ Échec de la génération : ${result.message}`);
        }
      } catch (err) {
        console.error(`[CRON] ✗ Erreur durant l'exécution du cron:`, err.message);
      }
    });

    console.log('[CRON] ✓ Cron job activé : génération du sitemap tous les jours à 03:00');
  } catch (err) {
    console.error('[CRON] ✗ Erreur lors de l\'initialisation du cron job:', err.message);
  }
}

/**
 * Arrête le cron job
 * @returns {void}
 */
export function stopSitemapCron() {
  if (cronJob) {
    cronJob.stop();
    console.log('[CRON] Cron job arrêté');
    cronJob = null;
  }
}

/**
 * Retourne le statut du cron job
 * @returns {object} État du cron { active, running, status }
 */
export function getCronStatus() {
  if (!cronJob) {
    return {
      active: false,
      running: false,
      status: 'Cron non initialisé'
    };
  }

  return {
    active: true,
    running: cronJob._status === 'started',
    status: 'Cron en cours d\'exécution'
  };
}

export default {
  initSitemapCron,
  stopSitemapCron,
  getCronStatus
};
