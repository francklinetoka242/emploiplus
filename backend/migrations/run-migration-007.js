#!/usr/bin/env node
/**
 * Migration: Create audit_logs table
 * This table stores comprehensive audit logs of all admin actions
 */

import pool from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigration() {
  console.log('🔧 Migration 007: Creating audit_logs table\n');

  try {
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, '007_create_audit_logs_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('📝 Executing SQL...\n');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.query(statement);
      }
    }

    console.log('✅ Migration executed successfully!');
    console.log('✅ Table audit_logs created with indexes');

  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  Table already exists, migration skipped');
    } else {
      console.error('❌ Migration failed:', error.message);
    }
  } finally {
    process.exit(0);
  }
}

runMigration();
