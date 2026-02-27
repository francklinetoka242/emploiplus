/**
 * Redis Configuration Helper - VPS Production
 * Configure la connexion pour BullMQ et le cache.
 */

interface RedisConfig {
  host?: string;
  port?: number;
  password?: string;
  url?: string;
  maxRetriesPerRequest: null; // Obligatoire pour BullMQ
}

export function getRedisConfig(): RedisConfig {
  const redisUrl = process.env.REDIS_URL;

  // Priorité à l'URL complète si elle existe dans le .env
  if (redisUrl) {
    return {
      url: redisUrl,
      maxRetriesPerRequest: null,
    };
  }

  // Fallback sur configuration Hôte/Port
  // Utilisation de 127.0.0.1 au lieu de localhost pour la stabilité VPS
  const host = process.env.REDIS_HOST || '127.0.0.1';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD;

  console.log(`[Redis] Connexion établie sur ${host}:${port}`);

  return {
    host,
    port,
    password: password || undefined,
    maxRetriesPerRequest: null,
  };
}

export const redisConfig = getRedisConfig();