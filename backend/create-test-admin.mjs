import bcryptjs from 'bcryptjs';
import pkg from 'pg';

const { Pool } = pkg;

const pool = new Pool({
  user: 'emploip01_admin',
  password: 'vcybk24235GDWe',
  host: '127.0.0.1',
  port: 5432,
  database: 'emploiplus_db',
});

async function createTestAdmin() {
  try {
    const password = 'Test123456!';
    const email = 'testadmin@test.local';
    
    // Hasher le password
    const saltRounds = 10;
    const passwordHash = await bcryptjs.hash(password, saltRounds);
    
    // Insérer l'admin
    const query = `
      INSERT INTO admins (
        first_name, last_name, email, password, role, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, email, role
    `;
    
    const result = await pool.query(query, [
      'Test',
      'Admin',
      email,
      passwordHash,
      'admin',
      'active'
    ]);
    
    console.log('✅ Admin créé avec succès:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: admin`);
    console.log(`   ID: ${result.rows[0].id}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

createTestAdmin();
