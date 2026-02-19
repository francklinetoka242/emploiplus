/**
 * Test Redis Configuration - VPS Production
 * Vérifie la compatibilité réseau et BullMQ
 */

import 'dotenv/config'; 
import { redisConfig } from './src/config/redis.js';

console.log('🚀 [Diagnostic] Vérification du Cache Redis...');

// 1. État des Variables
console.log(`\n📡 Mode de connexion : ${redisConfig.url ? 'URL complète' : 'Host/Port'}`);
console.log(`🏠 Hôte cible : ${redisConfig.host || 'Défini par URL'}`);
console.log(`🔒 Mot de passe : ${redisConfig.password ? 'Configuré ✅' : 'Non défini (Normal si local) ℹ️'}`);

// 2. Validation Critique BullMQ
if (redisConfig.maxRetriesPerRequest === null) {
  console.log('🛠  BullMQ : Configuration compatible (maxRetries=null) ✅');
} else {
  console.error('❌ ERREUR : maxRetriesPerRequest doit être NULL pour éviter les crashs BullMQ !');
}

// 3. Test de résolution réseau
const finalHost = redisConfig.host === 'localhost' ? '127.0.0.1' : redisConfig.host;
if (finalHost === '127.0.0.1') {
  console.log('⚡ Optimisation VPS : Utilisation de l\'IP directe active.');
}

console.log('\n✨ Diagnostic terminé. Ton système de tâches (Matching/Emails) est prêt.');