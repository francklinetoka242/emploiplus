import pool from '../config/db.js';

async function listFKs() {
  try {
    const query = `
      SELECT
        con.conname AS constraint_name,
        tbl.relname AS table_from,
        ARRAY_AGG(col_from.attname) AS columns_from,
        ref.relname AS referenced_table,
        ARRAY_AGG(col_ref.attname) AS columns_ref
      FROM pg_constraint con
      JOIN pg_class tbl ON tbl.oid = con.conrelid
      JOIN pg_class ref ON ref.oid = con.confrelid
      LEFT JOIN LATERAL (
        SELECT unnest(con.conkey) AS attnum
      ) ck ON true
      LEFT JOIN pg_attribute col_from ON col_from.attrelid = con.conrelid AND col_from.attnum = ANY(con.conkey)
      LEFT JOIN LATERAL (
        SELECT unnest(con.confkey) AS attnum
      ) rk ON true
      LEFT JOIN pg_attribute col_ref ON col_ref.attrelid = con.confrelid AND col_ref.attnum = ANY(con.confkey)
      WHERE con.contype = 'f'
        AND con.confrelid = 'users'::regclass
      GROUP BY con.conname, tbl.relname, ref.relname
      ORDER BY tbl.relname;
    `;

    const res = await pool.query(query);
    if (res.rowCount === 0) {
      console.log('No foreign key constraints reference users table.');
    } else {
      console.log('Foreign key constraints referencing users (raw rows):');
      console.log(JSON.stringify(res.rows, null, 2));
    }
  } catch (err) {
    console.error('Error listing FKs:', err.message || err);
  } finally {
    await pool.end();
  }
}

listFKs();
