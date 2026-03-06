import pool from '../config/db.js';

export async function up() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS documentations (
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
        
        CONSTRAINT fk_created_by FOREIGN KEY (created_by) 
          REFERENCES admins(id) ON DELETE SET NULL,
        CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) 
          REFERENCES admins(id) ON DELETE SET NULL
      )
    `;
    
    await pool.query(query);
    console.log('✓ Table documentations créée avec succès');
    return true;
  } catch (err) {
    console.error('Migration error:', err);
    throw err;
  }
}

export async function down() {
  try {
    const query = `DROP TABLE IF EXISTS documentations`;
    await pool.query(query);
    console.log('✓ Table documentations supprimée avec succès');
    return true;
  } catch (err) {
    console.error('Rollback error:', err);
    throw err;
  }
}
