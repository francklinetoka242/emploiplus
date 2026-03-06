#!/usr/bin/env node
/**
 * Migration: Add application_email column to jobs table
 */

import pool from '../config/db.js';

async function runMigration() {
  console.log('🔧 Migration: Adding application_email column to jobs table\n');

  try {
    const query = `
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS application_email TEXT;
    `;

    console.log('📝 Executing SQL...\n');
    await pool.query(query);

    console.log('✅ Migration executed successfully!');
    console.log('✅ Column application_email added to jobs table');

  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  Column already exists, migration skipped');
    } else {
      console.error('❌ Migration failed:', error.message);
    }
  } finally {
    process.exit(0);
  }
}

runMigration();