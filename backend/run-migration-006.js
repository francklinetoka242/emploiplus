#!/usr/bin/env node
import fs from 'fs';
import pool from './config/db.js';

async function runMigration() {
  try {
    const migrationPath = './migrations/006_add_permissions_to_admins.sql';
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    console.log('Running migration: 006_add_permissions_to_admins.sql\n');

    for (const statement of statements) {
      try {
        console.log('⏳ Executing:', statement.substring(0, 60) + '...');
        await pool.query(statement);
        console.log('✅ Success\n');
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('⚠️  Column already exists\n');
        } else {
          console.error('❌ Error:', error.message + '\n');
        }
      }
    }

    // Verify the new columns
    console.log('\nVerifying admins table structure:');
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'admins'
      ORDER BY ordinal_position
    `);

    result.rows.forEach(row => {
      console.log('  -', row.column_name, ':', row.data_type);
    });

    console.log('\n✅ Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();