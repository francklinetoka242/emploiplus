// Migration: Add missing columns to publications and users tables
import { pool } from "./src/config/database.js";

async function migrate() {
  try {
    console.log("🔧 Migration: Adding missing columns...\n");

    // Add columns to publications table
    console.log("📝 Adding columns to publications table...");
    
    try {
      await pool.query(`
        ALTER TABLE publications 
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'approved',
        ADD COLUMN IF NOT EXISTS contains_unmoderated_profanity BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS deleted_by_user BOOLEAN DEFAULT false
      `);
      console.log("✅ publications columns added\n");
    } catch (err) {
      console.warn("⚠️ publications columns may already exist:", (err as any).message);
    }

    // Add columns to users table
    console.log("📝 Adding columns to users table...");
    
    try {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active',
        ADD COLUMN IF NOT EXISTS discreet_mode_enabled BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false
      `);
      console.log("✅ users columns added\n");
    } catch (err) {
      console.warn("⚠️ users columns may already exist:", (err as any).message);
    }

    // Add UNIQUE constraint to publications.user_id if needed
    // (Remove the orphan user_id column later if author_id is sufficient)

    console.log("🎉 Migration complete!\n");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrate();
