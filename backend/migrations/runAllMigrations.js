import fs from 'fs';
import path from 'path';
import pool from '../config/db.js';

const migrationsDir = './migrations';

async function runMigrations() {
  try {
    console.log('[MIGRATION] Starting database migrations...\n');

    // Get all SQL migration files sorted by name
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      console.log('✅ No migrations to run');
      process.exit(0);
    }

    console.log(`Found ${migrationFiles.length} migration files:\n`);

    let successCount = 0;
    let failCount = 0;

    // Execute each migration file
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      console.log(`[${new Date().toISOString()}] Running migration: ${file}`);

      try {
        // Read the SQL file
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // Execute the SQL
        await pool.query(sql);
        console.log(`✅ ${file} executed successfully\n`);
        successCount++;
      } catch (err) {
        console.error(`❌ ${file} failed:`, err.message, '\n');
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`[MIGRATION SUMMARY]`);
    console.log(`  Successful: ${successCount}`);
    console.log(`  Failed: ${failCount}`);
    console.log(`  Total: ${migrationFiles.length}`);
    console.log('='.repeat(60));

    if (failCount === 0) {
      console.log('\n🎉 All migrations completed successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some migrations failed. Please review the errors above.');
      process.exit(1);
    }

  } catch (err) {
    console.error('❌ Migration process error:', err);
    process.exit(1);
  }
}

runMigrations();
