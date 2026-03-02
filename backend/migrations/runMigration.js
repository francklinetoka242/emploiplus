#!/usr/bin/env node
/**
 * Migration Runner - Exécute les migrations SQL
 * Usage: node runMigration.js
 * 
 * Ce script utilise la même DATABASE_URL que le serveur Node.js
 * pour éviter les problèmes d'authentification PostgreSQL
 */

import fs from 'fs';
import path from 'path';
import pool from '../config/db.js';
import { fileURLToPath } from 'url';

// derive __dirname since ESM doesn't provide it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


async function runMigration() {
  console.log('🔧 Migration Runner - Adding missing columns to admins table\n');

  try {
    // Lire le fichier SQL de migration
    const migrationPath = path.join(__dirname, '001_add_role_to_admins.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📂 Migration file:', migrationPath);
    console.log('📝 Executing SQL...\n');

    // Exécuter chaque instruction SQL
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    let executedCount = 0;
    for (const statement of statements) {
      try {
        console.log(`⏳ Executing: ${statement.substring(0, 60)}...`);
        await pool.query(statement);
        executedCount++;
        console.log(`✅ Success\n`);
      } catch (error) {
        // Ignorer les erreurs "column already exists"
        if (error.message.includes('already exists') || error.message.includes('IF NOT EXISTS')) {
          console.log(`⚠️  Skipped (already exists)\n`);
        } else {
          console.error(`❌ Error: ${error.message}\n`);
        }
      }
    }

    console.log(`\n✅ Migration completed! Executed ${executedCount} statements.\n`);

    // Vérifier la structure de la table
    console.log('🔍 Verifying admins table structure...\n');
    const { rows } = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'admins' 
      ORDER BY ordinal_position
    `);

    console.log('Columns in admins table:');
    rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

    console.log('\n🟢 All critical columns present!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
