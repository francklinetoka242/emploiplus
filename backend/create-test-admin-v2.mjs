#!/usr/bin/env node
// Script pour créer un super_admin de test à partir de la ligne de commande

import bcryptjs from 'bcryptjs';
import pkg from 'pg';
const { Pool } = pkg;

const password = 'SecureAdmin123!@#';
const email = 'admin@emploiplus-group.com';

async function createTestAdmin() {
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
    // Vérifier si l'admin existe
    const checkResult = await pool.query(
      'SELECT id FROM admins WHERE email = $1',
      [email]
    );

    if (checkResult.rows.length > 0) {
      console.log('✅ Admin de test existe déjà:', checkResult.rows[0].id);
      process.exit(0);
    }

    // Créer le super_admin de test
    const result = await pool.query(
      `INSERT INTO admins (email, password, role, first_name, last_name, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id, email, role`,
      [email, hashedPassword, 'super_admin', 'Test', 'Admin', 'active']
    );

    console.log('✅ Super Admin créé avec succès:');
    console.log('   Email:', result.rows[0].email);
    console.log('   Role:', result.rows[0].role);
    console.log('   ID:', result.rows[0].id);
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

createTestAdmin();
