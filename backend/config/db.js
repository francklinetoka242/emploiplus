// db.js - configuration du pool PostgreSQL
// utilise la librairie `pg` pour gérer les connexions à la base de données
// utilise une chaîne de connexion unique (DATABASE_URL) au lieu de variables individuelles

const { Pool } = require('pg');
const { DATABASE_URL } = require('./env');

// Crée un pool de connexions partagé à partir de DATABASE_URL
// DATABASE_URL doit être au format: postgresql://user:password@host:port/database
const pool = new Pool({
  connectionString: DATABASE_URL,
  // options additionnelles peuvent être ajoutées ici:
  // max: 20,                          // nombre max de connexions
  // idleTimeoutMillis: 30000,         // timeout d'inactivité
  // connectionTimeoutMillis: 5000,    // timeout de connexion
});

// Gestion des événements du pool pour debug/monitoring
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Fonction utilitaire pour tester la connexion au démarrage de l'application
async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ PostgreSQL connection successful');
    return true;
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
    process.exit(1); // arrêt en cas d'échec
  }
}

// Exporte le pool et la fonction de test pour qu'on puisse l'invoquer depuis
// server.js ou un script de démarrage.
module.exports = pool;
