// Script pour ajouter les colonnes manquantes à la table users
import { pool } from "./src/config/database.js";

async function addMissingColumns() {
  try {
    console.log("🔧 Ajout des colonnes manquantes à la table users...\n");

    // Ajouter les colonnes de réseaux sociaux
    const columnsToAdd = [
      { name: 'linkedin', type: 'TEXT' },
      { name: 'facebook', type: 'TEXT' },
      { name: 'instagram', type: 'TEXT' },
      { name: 'twitter', type: 'TEXT' },
      { name: 'youtube', type: 'TEXT' },
      { name: 'company', type: 'TEXT' },
      { name: 'company_id', type: 'INTEGER' },
      { name: 'bio', type: 'TEXT' },
      { name: 'city', type: 'TEXT' },
      { name: 'birthdate', type: 'DATE' },
      { name: 'gender', type: 'TEXT' },
    ];

    for (const col of columnsToAdd) {
      try {
        await pool.query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}
        `);
        console.log(`✅ Colonne ${col.name} ajoutée/vérifiée`);
      } catch (err) {
        console.error(`❌ Erreur pour ${col.name}:`, err);
      }
    }

    console.log("\n✅ Migration complétée!");
  } catch (err) {
    console.error('Erreur migration:', err);
    process.exit(1);
  }
}

addMissingColumns();
