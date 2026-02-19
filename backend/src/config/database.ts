/**
 * PostgreSQL Connection Pool Configuration
 * Production-ready for Ubuntu VPS deployment
 * Uses node-postgres (pg) driver only - no Supabase SDK
 */

import pg from 'pg';

const { Pool } = pg;

/**
 * Build connection configuration from environment variables
 * Priority: DATABASE_URL (connection string) > individual env vars
 */
const buildConnectionConfig = () => {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    // Connection string takes priority (e.g., from SSH tunnel or managed database)
    return { connectionString };
  }

  // Fallback to individual environment variables for VPS deployment
  const dbHost = process.env.DB_HOST;
  const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;
  const dbName = process.env.DB_NAME;
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;

  if (!dbHost || !dbName || !dbUser || !dbPassword) {
    throw new Error(
      'Missing required database environment variables. Provide either DATABASE_URL or (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)'
    );
  }

  return {
    host: dbHost,
    port: dbPort,
    database: dbName,
    user: dbUser,
    password: dbPassword,
  };
};

/**
 * Production-grade connection pool configuration
 */
const getPoolConfig = () => {
  const connectionConfig = buildConnectionConfig();

  return {
    ...connectionConfig,
    // Connection pool settings optimized for production
    max: parseInt(process.env.DB_POOL_MAX || '20', 10), // max concurrent connections
    min: parseInt(process.env.DB_POOL_MIN || '2', 10), // maintain minimum connections
    allowExitOnIdle: false, // don't kill pool when idle
    idleTimeoutMillis: 30000, // close idle connections after 30s
    connectionTimeoutMillis: 5000, // fail fast if connection can't be established
    statement_timeout: 30000, // query timeout in milliseconds
    application_name: 'emploi-connect-backend',
  };
};

// Initialize connection pool
export const pool = new Pool(getPoolConfig());

export let isConnected = false;

/**
 * Attempt to establish database connection with exponential backoff
 */
async function initializeConnection(retries = 5, initialDelayMs = 2000) {
  let delay = initialDelayMs;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      await client.query('SELECT NOW()'); // verify connection works
      client.release();

      isConnected = true;
      console.log('✅ PostgreSQL connected successfully');
      return;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Database connection attempt ${attempt}/${retries} failed: ${errorMsg}`);

      if (attempt < retries) {
        console.log(`   Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * 2, 30000); // exponential backoff, max 30s
      }
    }
  }

  console.error('❌ Failed to connect to PostgreSQL after all retries');
  throw new Error('Database connection failed');
}

/**
 * Pool event listeners for monitoring
 */
pool.on('error', (error: Error) => {
  console.error('🚨 Unexpected pool error:', error.message);
});

pool.on('connect', () => {
  console.log('📡 New database connection established');
});

pool.on('remove', () => {
  console.log('🔌 Database connection removed from pool');
});

/**
 * Initialize the connection pool on startup
 * This will throw if database is unreachable
 */
export const connectedPromise = initializeConnection();

/**
 * Graceful pool shutdown
 */
export const shutdown = async () => {
  try {
    await pool.end();
    console.log('✅ Database pool closed');
  } catch (error) {
    console.error('Error closing database pool:', error);
  }
};