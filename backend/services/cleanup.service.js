/**
 * Service de nettoyage automatique des fichiers temporaires
 * Supprime les fichiers plus anciens que la durée configurée
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { UPLOAD_CONFIG, getDestinationPath } from '../config/upload.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Nettoie les fichiers temporaires plus anciens que maxAge
 * @param {string} dirPath - Chemin du dossier à nettoyer
 * @param {number} maxAge - Âge maximum en millisecondes
 * @returns {Promise<{deleted: number, errors: string[]}>}
 */
async function cleanupDirectory(dirPath, maxAge) {
  const deleted = [];
  const errors = [];

  try {
    const files = await fs.promises.readdir(dirPath);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.promises.stat(filePath);

      // Ne supprimer que les fichiers (pas les dossiers)
      if (stat.isFile()) {
        const age = now - stat.mtime.getTime();

        if (age > maxAge) {
          try {
            await fs.promises.unlink(filePath);
            deleted.push(file);
            console.log(`🗑️ Fichier temporaire supprimé: ${file}`);
          } catch (err) {
            errors.push(`Erreur suppression ${file}: ${err.message}`);
          }
        }
      }
    }
  } catch (err) {
    errors.push(`Erreur lecture dossier ${dirPath}: ${err.message}`);
  }

  return { deleted: deleted.length, errors };
}

/**
 * Nettoie tous les dossiers temporaires configurés
 * @returns {Promise<{totalDeleted: number, results: Object[]}>}
 */
export async function cleanupTempFiles() {
  console.log('🧹 Démarrage du nettoyage des fichiers temporaires...');

  const results = [];
  let totalDeleted = 0;

  // Parcourir tous les types de fichiers
  for (const [typeKey, config] of Object.entries(UPLOAD_CONFIG.TYPES)) {
    if (config.cleanup && config.cleanup.enabled) {
      // utilise la fonction de configuration pour calculer le chemin
      const dirPath = path.join(__dirname, '../../', getDestinationPath(typeKey));

      try {
        const result = await cleanupDirectory(dirPath, config.cleanup.maxAge);
        totalDeleted += result.deleted;

        results.push({
          type: typeKey,
          directory: config.dir,
          deleted: result.deleted,
          errors: result.errors
        });

        if (result.errors.length > 0) {
          console.error(`❌ Erreurs dans ${config.dir}:`, result.errors);
        }
      } catch (err) {
        console.error(`❌ Erreur nettoyage ${config.dir}:`, err.message);
        results.push({
          type: typeKey,
          directory: config.dir,
          deleted: 0,
          errors: [err.message]
        });
      }
    }
  }

  console.log(`✅ Nettoyage terminé. ${totalDeleted} fichiers supprimés.`);

  return {
    totalDeleted,
    results,
    timestamp: new Date().toISOString()
  };
}

/**
 * Fonction à appeler périodiquement (via cron ou setInterval)
 * Nettoie les fichiers temporaires selon la configuration
 */
export async function scheduledCleanup() {
  try {
    const result = await cleanupTempFiles();

    // Log détaillé pour monitoring
    if (result.totalDeleted > 0) {
      console.log('📊 Rapport de nettoyage:', {
        totalDeleted: result.totalDeleted,
        details: result.results.filter(r => r.deleted > 0)
      });
    }

    return result;
  } catch (err) {
    console.error('❌ Erreur lors du nettoyage programmé:', err);
    throw err;
  }
}

/**
 * Nettoie un fichier spécifique immédiatement
 * @param {string} filePath - Chemin relatif du fichier à supprimer
 * @returns {Promise<boolean>} True si supprimé avec succès
 */
export async function cleanupSpecificFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '../../', filePath);

    // Vérifier que le fichier est bien dans un dossier temporaire
    const tempDirs = Object.entries(UPLOAD_CONFIG.TYPES)
      .filter(([, config]) => config.cleanup && config.cleanup.enabled)
      .map(([typeKey]) => getDestinationPath(typeKey));

    const isInTempDir = tempDirs.some(tempDir =>
      fullPath.startsWith(path.join(__dirname, '../../', tempDir))
    );

    if (!isInTempDir) {
      throw new Error('Le fichier n\'est pas dans un dossier temporaire autorisé');
    }

    await fs.promises.unlink(fullPath);
    console.log(`🗑️ Fichier supprimé manuellement: ${filePath}`);
    return true;
  } catch (err) {
    console.error(`❌ Erreur suppression fichier ${filePath}:`, err.message);
    return false;
  }
}

// Export pour utilisation dans d'autres modules
export default {
  cleanupTempFiles,
  scheduledCleanup,
  cleanupSpecificFile
};