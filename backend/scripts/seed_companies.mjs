import bcrypt from 'bcryptjs';
import { pool } from '../src/config/database.js';

// Seed companies to users table and mark some as featured
const companies = [
  {
    company_name: 'Société Générale Congo',
    full_name: 'Société Générale Congo',
    email: 'contact@sg-congo.example',
    password: 'ChangeMe123!',
    city: 'Brazzaville',
    sector: 'Banque',
    description: 'Banque commerciale présente au Congo offrant des services aux particuliers et entreprises.',
    website: 'https://sg-congo.example',
    profile_image_url: null,
    is_featured: true,
  },
  {
    company_name: 'Congo Telecom',
    full_name: 'Congo Telecom',
    email: 'contact@congotel.example',
    password: 'ChangeMe123!',
    city: 'Pointe-Noire',
    sector: 'Télécommunications',
    description: 'Opérateur historique télécom proposant services mobile et internet.',
    website: 'https://congotel.example',
    profile_image_url: null,
    is_featured: true,
  },
  {
    company_name: 'Logista Congo',
    full_name: 'Logista Congo',
    email: 'hello@logista.example',
    password: 'ChangeMe123!',
    city: 'Brazzaville',
    sector: 'Logistique',
    description: 'Prestataire logistique et transport au Congo.',
    website: null,
    profile_image_url: null,
    is_featured: false,
  },
  {
    company_name: 'AgriPlus Congo',
    full_name: 'AgriPlus Congo',
    email: 'contact@agriplus.example',
    password: 'ChangeMe123!',
    city: 'Dolisie',
    sector: 'Agriculture',
    description: 'Solutions agricoles et support aux exploitations locales.',
    website: null,
    profile_image_url: null,
    is_featured: false,
  }
];

(async () => {
  try {
    console.log('Seeding companies...');
    // Ensure columns exist
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS description TEXT");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS website TEXT");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS sector TEXT");

    for (const c of companies) {
      const hash = await bcrypt.hash(c.password, 10);
      const now = new Date();
      const query = `INSERT INTO users (full_name, email, password, user_type, company_name, city, sector, description, website, profile_image_url, is_featured, is_verified, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, true, $12, $12)
        ON CONFLICT (email) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          company_name = EXCLUDED.company_name,
          password = EXCLUDED.password,
          city = EXCLUDED.city,
          sector = EXCLUDED.sector,
          description = EXCLUDED.description,
          website = EXCLUDED.website,
          profile_image_url = EXCLUDED.profile_image_url,
          is_featured = EXCLUDED.is_featured,
          is_verified = EXCLUDED.is_verified,
          updated_at = EXCLUDED.updated_at`;
      const values = [c.full_name, c.email, hash, 'company', c.company_name, c.city, c.sector, c.description, c.website, c.profile_image_url, c.is_featured, now.toISOString()];
      await pool.query(query, values);
      console.log('Upserted', c.company_name);
    }

    console.log('Seeding finished.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
})();
