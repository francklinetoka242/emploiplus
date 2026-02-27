/**
 * ============================================================================
 * Cache Service for Jobs Search
 * ============================================================================
 * 
 * Système de cache en mémoire pour les résultats de recherche
 * - Cache temporaire: 5 minutes par défaut
 * - Clés basées sur les paramètres de recherche
 * - Invalidation automatique après TTL
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // en millisecondes
}

class SearchCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Génère une clé de cache basée sur les paramètres de recherche
   */
  generateKey(params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          acc[key] = params[key];
        }
        return acc;
      }, {} as Record<string, any>);

    return `jobs_search:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Récupère une valeur du cache si elle existe et n'est pas expirée
   */
  get(key: string): any | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Vérifier si le cache a expiré
    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl) {
      // Cache expiré, le supprimer
      this.cache.delete(key);
      return null;
    }

    // Retourner le cache valide
    console.log(`[CACHE HIT] ${key} - Age: ${Math.round(age / 1000)}s`);
    return entry.data;
  }

  /**
   * Stocke une valeur dans le cache
   */
  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
    console.log(`[CACHE SET] ${key} - TTL: ${Math.round(ttl / 1000)}s`);
  }

  /**
   * Invalide une entrée du cache
   */
  invalidate(key: string): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      console.log(`[CACHE INVALIDATED] ${key}`);
    }
  }

  /**
   * Invalide tous les caches associés à une recherche (pour les mises à jour)
   */
  invalidateAllSearches(): void {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith('jobs_search:')) {
        this.cache.delete(key);
        count++;
      }
    }
    console.log(`[CACHE CLEARED] ${count} search cache(s) invalidated`);
  }

  /**
   * Retourne les statistiques du cache
   */
  getStats(): {
    totalEntries: number;
    searchCaches: number;
    memoryUsage: number;
  } {
    let searchCount = 0;
    let totalSize = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (key.startsWith('jobs_search:')) {
        searchCount++;
      }
      totalSize += JSON.stringify(entry.data).length;
    }

    return {
      totalEntries: this.cache.size,
      searchCaches: searchCount,
      memoryUsage: totalSize, // en bytes
    };
  }

  /**
   * Nettoie les caches expirés
   */
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[CACHE CLEANUP] Removed ${cleaned} expired entry(ies)`);
    }
  }
}

// Exporter une instance singleton
export const jobsSearchCache = new SearchCache();

// Nettoyer les caches expirés toutes les minutes
setInterval(() => {
  jobsSearchCache.cleanup();
}, 60 * 1000);
