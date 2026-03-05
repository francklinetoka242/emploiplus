import pool from '../config/db.js';

async function describe() {
  try {
    const q = `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position`;
    const res = await pool.query(q);
    console.log('Users table columns:');
    res.rows.forEach(r => console.log(`- ${r.column_name}: ${r.data_type}`));
  } catch (err) {
    console.error('Error describing users table:', err.message || err);
  } finally {
    await pool.end();
  }
}

describe();
