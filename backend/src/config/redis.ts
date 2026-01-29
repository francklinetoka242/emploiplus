/**
 * ============================================================================
 * Redis Configuration Helper
 * ============================================================================
 * 
 * Parses REDIS_URL environment variable and creates BullMQ-compatible config.
 * Supports both local (host:port) and remote (redis://) formats.
 * 
 * Environment variables:
 * - REDIS_URL: Full connection string (e.g., redis://user:pass@host:port/db)
 * - REDIS_HOST: Fallback host (default: localhost)
 * - REDIS_PORT: Fallback port (default: 6379)
 * - REDIS_PASSWORD: Fallback password (optional)
 */

interface RedisConfig {
  host?: string;
  port?: number;
  password?: string;
  url?: string;
  maxRetriesPerRequest?: null;
}

export function getRedisConfig(): RedisConfig {
  const redisUrl = process.env.REDIS_URL;

  // If REDIS_URL is provided, use it directly (BullMQ supports URL format)
  if (redisUrl) {
    console.log('[Redis] Using REDIS_URL for connection');
    return {
      url: redisUrl,
      maxRetriesPerRequest: null,
    };
  }

  // Fallback to host:port configuration
  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD;

  console.log(`[Redis] Using host:port configuration (${host}:${port})`);

  return {
    host,
    port,
    password: password || undefined,
    maxRetriesPerRequest: null,
  };
}

// Export singleton instance
export const redisConfig = getRedisConfig();
