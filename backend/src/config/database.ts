// backend/src/config/database.ts
import type { Pool as PgPool } from "pg";
import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || null;

// Log connection info at startup
if (connectionString) {
  console.log('📡 Connecté à la DB via : DATABASE_URL (SSH tunnel via port 5444)');
  console.log('🔌 Connection URL:', connectionString);
} else {
  console.log('⚠️  DATABASE_URL non défini, utilisation des variables DB_HOST/DB_PORT/DB_NAME');
}

export const pool: PgPool = connectionString
  ? new Pool({ connectionString, connectionTimeoutMillis: 2000 })
  : new Pool({
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || "emploi_plus_db_cg",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "1414",
      connectionTimeoutMillis: 2000,
    });

export let isConnected = false;

async function tryConnect(retries = 5, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      client.release();
      isConnected = true;
      console.log("PostgreSQL connecté");
      return;
    } catch (err) {
      const attempt = i + 1;
      console.error(`Postgres connection attempt ${attempt} failed:`, (err as Error).message || err);
      if (attempt < retries) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  console.error("Unable to connect to PostgreSQL after retries. Running in DB-unavailable mode.");
}

// Expose the connection attempt as a promise so callers can await DB readiness
export const connectedPromise = tryConnect().catch((err) => {
  console.error("Unexpected DB connection error:", err);
});

pool.on("error", (err: Error) => console.error("Erreur DB:", err));

// Wrap pool.query to gracefully handle DB-unavailable mode during development
const _realQuery = (pool as any).query.bind(pool);
(pool as any).query = async (...args: any[]) => {
  if (!isConnected) {
    return Promise.resolve({ rows: [], rowCount: 0, command: 'NOOP' });
  }
  return _realQuery(...args);
};