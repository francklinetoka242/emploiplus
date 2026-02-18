// Migration: Add profile fields to admins table
import { pool } from "../src/config/database.js";

async function runMigration() {
  try {
    console.log("Running migration: Add profile fields to admins table...\n");

    // Add new columns to admins table
    await pool.query(`
      ALTER TABLE admins
      ADD COLUMN IF NOT EXISTS nom TEXT,
      ADD COLUMN IF NOT EXISTS prenom TEXT,
      ADD COLUMN IF NOT EXISTS telephone TEXT,
      ADD COLUMN IF NOT EXISTS pays TEXT,
      ADD COLUMN IF NOT EXISTS ville TEXT,
      ADD COLUMN IF NOT EXISTS date_naissance DATE,
      ADD COLUMN IF NOT EXISTS avatar_url TEXT,
      ADD COLUMN IF NOT EXISTS verification_token TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMP;
    `);

    console.log("✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
