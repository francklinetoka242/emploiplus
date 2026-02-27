#!/usr/bin/env node
import bcryptjs from 'bcryptjs';
import pkg from 'pg';
const { Pool } = pkg;

const password = 'SecureAdmin123!@#';
const email = 'admin@emploiplus-group.com';

async function checkAndUpdatePassword() {
  const pool = new Pool({
    host: '127.0.0.1',
    port: 5432,
    user: 'emploip01_admin',
    password: 'vcybk24235GDWe',
    database: 'emploiplus_db',
  });

  try {
    // Récupérer le password actuel
    const checkResult = await pool.query(
      'SELECT id, email, password FROM admins WHERE email = $1',
      [email]
    );

    if (checkResult.rows.length === 0) {
      console.log('❌ Admin not found');
      process.exit(1);
    }

    const admin = checkResult.rows[0];
    console.log('Admin ID:', admin.id);
    console.log('Email:', admin.email);
    console.log('Current password hash:', admin.password);

    // Tester le password avec bcrypt
    const match = await bcryptjs.compare(password, admin.password);
    console.log('✅ Password verification:', match ? 'MATCHES' : 'DOES NOT MATCH');

    if (!match) {
      console.log('\n🔄 Updating password...');
      const newHash = await bcryptjs.hash(password, 10);
      console.log('New hash:', newHash);

      const updateResult = await pool.query(
        'UPDATE admins SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
        [newHash, admin.id]
      );

      if (updateResult.rows.length > 0) {
        console.log('✅ Password updated successfully');
      }
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkAndUpdatePassword();
