import pool from './config/db.js';

async function checkFormations() {
  try {
    const result = await pool.query('SELECT id, title, published, created_at FROM formations ORDER BY created_at DESC LIMIT 10');
    console.log('Formations en base:', result.rows);
  } catch (err) {
    console.error('Erreur:', err);
  } finally {
    process.exit(0);
  }
}

checkFormations();