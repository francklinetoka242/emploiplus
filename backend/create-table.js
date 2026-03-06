import pool from './config/db.js';

async function createTable() {
  try {
    console.log('Checking if documentations table exists...');

    const checkResult = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_name = 'documentations'
    `);

    if (checkResult.rows.length > 0) {
      console.log('✅ Table documentations already exists');
      return;
    }

    console.log('Creating documentations table...');

    await pool.query(`
      CREATE TABLE documentations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        type VARCHAR(50) NOT NULL DEFAULT 'document',
        content TEXT NOT NULL,
        is_published BOOLEAN DEFAULT false,
        created_by INTEGER,
        updated_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL,
        CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES admins(id) ON DELETE SET NULL
      )
    `);

    console.log('✅ Table documentations created successfully');

    // Create indexes
    console.log('Creating indexes...');

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_documentations_slug ON documentations(slug)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_documentations_type ON documentations(type)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_documentations_published ON documentations(is_published)`);

    console.log('✅ Indexes created successfully');

    // Verify table structure
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'documentations'
      ORDER BY ordinal_position
    `);

    console.log('\nTable structure:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

createTable();