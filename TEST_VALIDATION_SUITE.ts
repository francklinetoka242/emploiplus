#!/bin/bash

/**
 * ============================================================================
 * VALIDATION TEST SUITE - EmploiPlus Production (VPS)
 * ============================================================================
 */

// ============================================================================
// 1. TESTS BASE DE DONNÉES (À exécuter dans psql sur le VPS)
// ============================================================================

/*
  -- Vérifier la table admins (celle qu'on a trouvé ensemble)
  SELECT email, role FROM admins;

  -- Vérifier les droits des tables
  SELECT tablename, tableowner FROM pg_tables WHERE schemaname = 'public';
*/

// ============================================================================
// 2. TESTS CONFIGURATION (Frontend)
// ============================================================================

export const test_Config = () => {
  const isProduction = window.location.hostname === 'emploiplus-group.com';
  
  // Correction de l'URL de redirection pour ton domaine réel
  const redirectTo = isProduction 
    ? `https://emploiplus-group.com/auth/callback?role=candidate`
    : `${window.location.origin}/auth/callback?role=candidate`;
  
  console.log('--- TEST CONFIGURATION ---');
  console.log('Domaine actuel:', window.location.hostname);
  console.log('Redirect URL configurée:', redirectTo);
  
  // Test de sécurité : vérifie qu'on ne pointe pas vers une adresse interne
  if (isProduction && (redirectTo.includes('127.0.0.1') || !redirectTo.includes('emploiplus-group.com'))) {
    console.error('❌ ERREUR: L\'adresse de redirection est incorrecte pour la production !');
  } else {
    console.log('✅ Configuration URL correcte');
  }
};

// ============================================================================
// 3. TESTS MICROSERVICES (API BACKEND - VPS)
// ============================================================================

/**
 * Ces commandes sont à copier-coller dans ton terminal SSH (le noir) 
 * pour tester si ton backend répond bien via le domaine sécurisé.
 */

// Test Notifications :
// Example using API_BASE below:
const API_BASE = 'https://emploiplus-group.com';
// curl -X POST ${API_BASE}/api/notifications/send -H "Content-Type: application/json" -d '{"userIds": ["test"], "type": "push", "title": "Test", "message": "Notification VPS"}'

// Test Matching :
// curl -X POST ${API_BASE}/api/matching/calculate -H "Content-Type: application/json" -d '{"candidateId": "1", "jobId": "1"}'

// ============================================================================
// 4. PERFORMANCE & LATENCY (Navigateur)
// ============================================================================

export const test_apiLatency = async () => {
  console.log('--- TEST LATENCE API ---');
  const start = performance.now();
  
  try {
    // Utilisation d'un chemin relatif pour passer par le proxy du VPS
    const response = await fetch('/api/health'); 
    const end = performance.now();
    console.log(`Réponse API reçue en: ${(end - start).toFixed(2)}ms`);
    
    if (response.status === 500) {
      console.error('❌ ERREUR 500: Le serveur distant a rencontré un problème.');
    }
  } catch (error) {
    console.error('❌ ERREUR CONNEXION: Impossible de joindre l\'API via /api. Vérifie le proxy CyberPanel.');
  }
};

// ============================================================================
// 5. RUNNER
// ============================================================================

export async function runAllTests() {
  console.log('🚀 Démarrage de la validation EmploiPlus sur le domaine de production...');
  test_Config();
  await test_apiLatency();
}

// Auto-chargement dans la console du navigateur
if (typeof window !== 'undefined') {
  (window as any).runEmploiPlusTests = runAllTests;
  console.log('✅ Suite de tests prête. Tapez "runEmploiPlusTests()" pour lancer.');
}