import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

/**
 * Configuration de la connexion à PostgreSQL
 */
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'postgres',
});

/**
 * Initialiser la connexion à la base de données
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Test de connexion
    const client = await pool.connect();
    console.log('✅ Base de données connectée');

    // Récupérer les infos de version
    const result = await client.query('SELECT version()');
    const dbVersion = result.rows[0].version.split(',')[0];
    console.log(`   📊 ${dbVersion}`);

    // Récupérer le nom de la base de données actuelle
    const dbNameResult = await client.query(
      "SELECT current_database() as current_db, current_user as current_user"
    );
    const { current_db, current_user } = dbNameResult.rows[0];
    console.log(`   📁 Base: ${current_db}`);
    console.log(`   👤 Utilisateur: ${current_user}`);

    client.release();
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    throw error;
  }
}

/**
 * Exécuter une requête SQL
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number }> {
  try {
    const result = await pool.query(text, params);
    return {
      rows: result.rows as T[],
      rowCount: result.rowCount ?? 0,
    };
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution de la requête:', error);
    throw error;
  }
}

/**
 * Obtenir un client pool (pour les transactions)
 */
export async function getClient() {
  return pool.connect();
}

/**
 * Fermer la connexion au pool
 */
export async function closeDatabase(): Promise<void> {
  try {
    await pool.end();
    console.log('✅ Connexion à la base de données fermée');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture de la base de données:', error);
    throw error;
  }
}

export default pool;
