// Migration script to add profile view tracking columns
import { pool } from "./src/config/database.js";

async function addProfileViewsColumns() {
  try {
    console.log("🔧 Ajout des colonnes de suivi des visites...\n");

    // Add profile_views (JSONB) - stores all profile visits
    console.log("📝 Ajout de la colonne profile_views...");
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS profile_views JSONB DEFAULT '{}'
    `);
    console.log("✅ Colonne profile_views ajoutée\n");

    // Add profile_views_week (INTEGER) - counter for weekly views
    console.log("📝 Ajout de la colonne profile_views_week...");
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS profile_views_week INTEGER DEFAULT 0
    `);
    console.log("✅ Colonne profile_views_week ajoutée\n");

    console.log("✅ Migration complétée avec succès!");
    console.log("\nColonnes ajoutées:");
    console.log("  - profile_views (JSONB): Stocke l'historique des visites {date: visitor_id, ...}");
    console.log("  - profile_views_week (INTEGER): Compteur des visites cette semaine\n");

  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

addProfileViewsColumns();
