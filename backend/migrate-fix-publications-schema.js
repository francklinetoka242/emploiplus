/**
 * Migration Script: Fix Publications Schema
 * This script removes the conflicting user_id column and unifies on author_id
 */

import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const connectionString = process.env.DATABASE_URL || null;
const pool = connectionString
    ? new Pool({ connectionString, connectionTimeoutMillis: 2000 })
    : new Pool({
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME || 'emploi_plus_db_cg',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '1414',
        connectionTimeoutMillis: 2000,
    });

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting Publications Schema Fix Migration...\n');

    // ======================================================================
    // Step 1: Check current schema
    // ======================================================================
    console.log('📊 Step 1: Checking current publications table schema...');
    const schemaResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'publications'
      ORDER BY ordinal_position;
    `);
    
    console.log('Current columns:');
    schemaResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    console.log('');

    // ======================================================================
    // Step 2: Backup existing publications
    // ======================================================================
    console.log('💾 Step 2: Backing up existing publications...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS publications_schema_backup AS
      SELECT * FROM publications;
    `);
    
    const countResult = await client.query('SELECT COUNT(*) as count FROM publications');
    console.log(`✅ Backed up ${countResult.rows[0].count} publications\n`);

    // ======================================================================
    // Step 3: Drop dependent objects
    // ======================================================================
    console.log('🗑️ Step 3: Dropping dependent objects...');
    
    const dropCommands = [
      'DROP VIEW IF EXISTS active_publications CASCADE',
      'DROP TABLE IF EXISTS publication_likes CASCADE',
      'DROP TABLE IF EXISTS publication_comments CASCADE',
      'DROP TABLE IF EXISTS profanity_violations CASCADE',
      'DROP TABLE IF EXISTS discreet_mode_interactions CASCADE',
      'DROP TABLE IF EXISTS publication_visibility_log CASCADE',
      'DROP TABLE IF EXISTS publications CASCADE'
    ];
    
    for (const cmd of dropCommands) {
      try {
        await client.query(cmd);
        console.log(`  ✓ ${cmd.split('IF EXISTS')[1]?.trim().split('CASCADE')[0] || 'object'} dropped`);
      } catch (e) {
        // Ignore if object doesn't exist
      }
    }
    console.log('');

    // ======================================================================
    // Step 4: Recreate publications table with correct schema
    // ======================================================================
    console.log('🔨 Step 4: Recreating publications table with correct schema...');
    
    await client.query(`
      CREATE TABLE publications (
        id SERIAL PRIMARY KEY,
        author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        image_url TEXT,
        category TEXT DEFAULT 'annonce',
        achievement BOOLEAN DEFAULT false,
        hashtags TEXT[],
        visibility TEXT DEFAULT 'public',
        is_active BOOLEAN DEFAULT true,
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        contains_unmoderated_profanity BOOLEAN DEFAULT false,
        profanity_check_status TEXT DEFAULT 'pending',
        moderation_status TEXT DEFAULT 'pending',
        deleted_at TIMESTAMP NULL,
        author_is_certified BOOLEAN DEFAULT false,
        moderation_notes TEXT,
        moderated_by_admin_id INTEGER,
        FOREIGN KEY (moderated_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL
      );
    `);
    console.log('✅ Publications table created\n');

    // ======================================================================
    // Step 5: Recreate publication_likes
    // ======================================================================
    console.log('🔨 Step 5: Recreating publication_likes table...');
    
    await client.query(`
      CREATE TABLE publication_likes (
        id SERIAL PRIMARY KEY,
        publication_id INTEGER NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(publication_id, user_id)
      );
    `);
    console.log('✅ Publication_likes table created\n');

    // ======================================================================
    // Step 6: Recreate publication_comments
    // ======================================================================
    console.log('🔨 Step 6: Recreating publication_comments table...');
    
    await client.query(`
      CREATE TABLE publication_comments (
        id SERIAL PRIMARY KEY,
        publication_id INTEGER NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
        author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Publication_comments table created\n');

    // ======================================================================
    // Step 7: Recreate dependent tables
    // ======================================================================
    console.log('🔨 Step 7: Recreating profanity and moderation tables...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS profanity_violations (
        id SERIAL PRIMARY KEY,
        publication_id INTEGER NOT NULL UNIQUE,
        user_id INTEGER NOT NULL,
        violation_type TEXT DEFAULT 'banned_words',
        flagged_words TEXT[],
        moderation_notes TEXT,
        moderated_by_admin_id INTEGER NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        reviewed_at TIMESTAMP NULL,
        FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (moderated_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS discreet_mode_interactions (
        id SERIAL PRIMARY KEY,
        interaction_id INTEGER NOT NULL,
        publication_id INTEGER NOT NULL,
        viewer_user_id INTEGER NOT NULL,
        author_user_id INTEGER NOT NULL,
        author_company_id INTEGER NOT NULL,
        viewer_company_id INTEGER NOT NULL,
        interaction_type TEXT DEFAULT 'like',
        is_masked BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE,
        FOREIGN KEY (viewer_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS publication_visibility_log (
        id SERIAL PRIMARY KEY,
        publication_id INTEGER NOT NULL,
        viewer_user_id INTEGER NOT NULL,
        visibility_reason TEXT,
        is_visible BOOLEAN,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE,
        FOREIGN KEY (viewer_user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('✅ Supporting tables created\n');

    // ======================================================================
    // Step 8: Create indexes
    // ======================================================================
    console.log('⚡ Step 8: Creating indexes for performance...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_publications_author_id ON publications(author_id)',
      'CREATE INDEX IF NOT EXISTS idx_publications_created_at ON publications(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_publications_is_active ON publications(is_active)',
      'CREATE INDEX IF NOT EXISTS idx_publications_author_id_active ON publications(author_id, is_active)',
      'CREATE INDEX IF NOT EXISTS idx_publication_likes_publication_id ON publication_likes(publication_id)',
      'CREATE INDEX IF NOT EXISTS idx_publication_likes_user_id ON publication_likes(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_publication_comments_publication_id ON publication_comments(publication_id)',
      'CREATE INDEX IF NOT EXISTS idx_publication_comments_author_id ON publication_comments(author_id)'
    ];
    
    for (const idx of indexes) {
      await client.query(idx);
    }
    console.log(`✅ ${indexes.length} indexes created\n`);

    // ======================================================================
    // Step 9: Verify schema
    // ======================================================================
    console.log('✔️ Step 9: Verifying new schema...');
    const newSchemaResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'publications'
      ORDER BY ordinal_position;
    `);
    
    console.log('New columns:');
    newSchemaResult.rows.forEach(col => {
      console.log(`  ✓ ${col.column_name}: ${col.data_type}`);
    });
    console.log('');

    console.log('✅ Migration completed successfully!');
    console.log('\n⚠️  Important Notes:');
    console.log('  - Old publications data is backed up in publications_schema_backup table');
    console.log('  - All publications have been cleared (schema-only migration)');
    console.log('  - New publications will use author_id consistently');
    console.log('  - All queries must use p.author_id (not p.user_id)');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
runMigration().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
