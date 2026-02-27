/**
 * Migration: Vérifier que les colonnes existent pour les données d'inscription
 * Ajoute gender, birthdate, nationality si manquantes
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('🔄 Vérification des colonnes de profil utilisateur...\n');

    const columnsToAdd = [
      { name: 'gender', type: 'TEXT', comment: 'male, female, other' },
      { name: 'birthdate', type: 'DATE', comment: 'Date de naissance' },
      { name: 'nationality', type: 'TEXT', comment: 'Nationalité' }
    ];

    for (const column of columnsToAdd) {
      try {
        // Vérifier si la colonne existe
        const checkQuery = `
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='${column.name}'
        `;
        const result = await client.query(checkQuery);

        if (result.rows.length === 0) {
          // La colonne n'existe pas, l'ajouter
          const addColumnQuery = `ALTER TABLE users ADD COLUMN ${column.name} ${column.type};`;
          await client.query(addColumnQuery);
          console.log(`✅ Colonne ${column.name} ajoutée (${column.comment})`);
        } else {
          console.log(`⏭️  Colonne ${column.name} existe déjà`);
        }
      } catch (error) {
        console.error(`❌ Erreur ajout colonne ${column.name}:`, error.message);
      }
    }

    console.log('\n✅ Migration complète!');
    console.log('\n📋 Flux d\'inscription mis à jour:');
    console.log('   1. Formulaire d\'inscription envoie: firstName, lastName, email, phone, gender, birthdate, country, city');
    console.log('   2. Backend combine firstName + lastName en full_name');
    console.log('   3. Backend sauvegarde toutes les données');
    console.log('   4. Frontend récupère les données via GET /api/users/me');
    console.log('   5. Affichage complet dans les paramètres du profil');

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
