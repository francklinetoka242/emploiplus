#!/usr/bin/env node

/**
 * Script de test pour le nettoyage automatique des fichiers temporaires
 * Usage: node scripts/test-cleanup.js
 */

import { scheduledCleanup } from '../services/cleanup.service.js';

async function testCleanup() {
  console.log('🧪 Test du service de nettoyage automatique...\n');

  try {
    const result = await scheduledCleanup();

    console.log('\n📊 Résultats du test:');
    console.log(`Total fichiers supprimés: ${result.totalDeleted}`);

    if (result.results.length > 0) {
      console.log('\nDétails par dossier:');
      result.results.forEach(r => {
        console.log(`  ${r.directory}: ${r.deleted} fichiers supprimés`);
        if (r.errors.length > 0) {
          console.log(`    ❌ Erreurs: ${r.errors.join(', ')}`);
        }
      });
    } else {
      console.log('Aucun fichier à nettoyer trouvé.');
    }

    console.log(`\n⏰ Test terminé à: ${result.timestamp}`);

  } catch (err) {
    console.error('❌ Erreur lors du test:', err.message);
    process.exit(1);
  }
}

// Exécuter le test si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  testCleanup();
}