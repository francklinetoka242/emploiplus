/**
 * Migration: Ajouter les colonnes pour les documents PDF
 * dans les tables candidats et entreprises
 * 
 * Candidat: CV, LM, CNI, Passeport, ACPE, Diplômes, NUI, Certificats, Résidence
 * Entreprise: RCCM, NUI, Carte Fiscale, Non-Redevance, Bail, CNI Gérant, Statuts
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('🔄 Démarrage de la migration des colonnes de documents...');

    // Colonnes à ajouter à la table users
    const documentsColumns = [
      // Candidat - Documents Professionnels
      { name: 'cv_url', description: 'CV du candidat' },
      { name: 'lm_url', description: 'Lettre de Motivation' },

      // Candidat - Diplômes & Expériences
      { name: 'diplome_url', description: 'Diplômes' },
      { name: 'certificat_travail_url', description: 'Certificats de Travail' },

      // Candidat - Identité & Résidence
      { name: 'cni_url', description: 'CNI/Carte Nationale' },
      { name: 'passeport_url', description: 'Passeport' },
      { name: 'carte_residence_url', description: 'Carte de Résidence' },

      // Candidat - Documents Administratifs
      { name: 'nui_url', description: 'NUI' },
      { name: 'recepisse_acpe_url', description: 'Récépissé ACPE' },

      // Entreprise - Documents Légaux
      { name: 'rccm_url', description: 'RCCM' },
      { name: 'statuts_url', description: 'Statuts' },
      { name: 'carte_grise_fiscale_url', description: 'Carte Grise/Fiscale' },

      // Entreprise - Documents Fiscaux
      { name: 'attestation_non_redevance_url', description: 'Attestation Non-Redevance' },

      // Entreprise - Locaux
      { name: 'bail_url', description: 'Contrat de Bail' },

      // Entreprise - Représentants
      { name: 'cni_representant_url', description: 'CNI du Gérant' }
    ];

    // Vérifier et ajouter les colonnes manquantes
    for (const column of documentsColumns) {
      try {
        // Vérifier si la colonne existe
        const checkQuery = `
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='${column.name}'
        `;
        const result = await client.query(checkQuery);

        if (result.rows.length === 0) {
          // La colonne n'existe pas, l'ajouter
          const addColumnQuery = `
            ALTER TABLE users 
            ADD COLUMN ${column.name} TEXT;
          `;
          await client.query(addColumnQuery);
          console.log(`✅ Colonne ${column.name} ajoutée`);
        } else {
          console.log(`⏭️  Colonne ${column.name} existe déjà`);
        }
      } catch (error) {
        console.error(`❌ Erreur ajout colonne ${column.name}:`, error.message);
      }
    }

    // Ajouter les colonnes à safeColumns du backend
    const backendUpdateMessage = `
    ✅ MISE À JOUR MANUELLE REQUISE:
    
    Dans backend/src/server.ts, ajouter ces colonnes à l'array 'safeColumns' (ligne ~1905):
    
    'cv_url', 'lm_url', 'diplome_url', 'certificat_travail_url', 
    'cni_url', 'passeport_url', 'carte_residence_url', 'nui_url', 
    'recepisse_acpe_url', 'rccm_url', 'statuts_url', 
    'carte_grise_fiscale_url', 'attestation_non_redevance_url', 
    'bail_url', 'cni_representant_url'
    `;

    console.log(backendUpdateMessage);
    console.log('\n✅ Migration des colonnes terminée!');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    await client.release();
    await pool.end();
  }
}

// Exécuter la migration
runMigration().catch(err => {
  console.error('Erreur non gérée:', err);
  process.exit(1);
});
