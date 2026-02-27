#!/usr/bin/env node
// Script pour mettre à jour le password du super_admin de test

import bcryptjs from 'bcryptjs';
import pkg from 'pg';
const { Pool } = pkg;

const password = 'SecureAdmin123!@#';
const email = 'admin@emploiplus-group.com';

async function updateTestAdminPassword() {
  // Hacher le password
  const hashedPassword = await bcryptjs.hash(password, 10);
  console.log('🔐 Password hasé:', hashedPassword);

  // Connexion à la DB
  const pool = new Pool({
    host: '127.0.0.1',
    port: 5432,
    user: 'emploip01_admin',
    password: 'vcybk24235GDWe',
    database: 'emploiplus_db',
  });

  try {
    // Mettre à jour le password
    const result = await pool.query(
      `UPDATE admins 
       SET password = $1, updated_at = NOW()
       WHERE email = $2
       RETURNING id, email, role`,
      [hashedPassword, email]
    );

    if (result.rows.length === 0) {
      console.log('❌ Admin non trouvé:', email);
      process.exit(1);
    }

    console.log('✅ Password mis à jour avec succès:');
    console.log('   Email:', result.rows[0].email);
    console.log('   Role:', result.rows[0].role);
    console.log('\n🔑 Identifiants de test:');
    console.log('   Email:', email);
    console.log('   Password:', password);

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updateTestAdminPassword();
