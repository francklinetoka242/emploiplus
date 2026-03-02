import { useState, useCallback, useRef, useEffect } from 'react';

interface CacheEntry {
  data: any;
  timestamp: number;
}

interface UseOptimizedSearchOptions {
  debounceMs?: number;
  minChars?: number;
  cacheExpireMs?: number;
  onSearch: (query: string) => Promise<any>;
}

/**
 * Hook personnalisé pour optimiser les recherches avec:
 * - Debouncing (délai configurable)
 * - Condition minimale de caractères
 * - Mise en cache frontend
 * - Limitation des requêtes serveur
 */
export const useOptimizedSearch = ({
  debounceMs = 500,
  minChars = 3,
  cacheExpireMs = 60000, // 1 minute par défaut
  onSearch,
}: UseOptimizedSearchOptions) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false); // Query meet minimum chars requirement

  // Cache en mémoire
  const cacheRef = useRef<Record<string, CacheEntry>>({});
  
  // Timeout pour debouncing
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Exécute la recherche (avec appel API ou récupération du cache)
   */
  const executeSearch = useCallback(
    async (searchQuery: string) => {
      // Vérifier la cache
      if (cacheRef.current[searchQuery]) {
        const cached = cacheRef.current[searchQuery];
        if (Date.now() - cached.timestamp < cacheExpireMs) {
          setResults(cached.data);
          setLoading(false);
          return;
        } else {
          // Cache expiré
          delete cacheRef.current[searchQuery];
        }
      }

      // Appel API
      setLoading(true);
      setError(null);
      try {
        const data = await onSearch(searchQuery);
        setResults(data);
        
        // Stocker en cache
        cacheRef.current[searchQuery] = {
          data,
          timestamp: Date.now(),
        };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erreur de recherche';
        setError(errorMsg);
        setResults(null);
      } finally {
        setLoading(false);
      }
    },
    [onSearch, cacheExpireMs]
  );

  /**
   * Gérer les changements de query avec debouncing
   */
  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      setError(null);

      // Vérifier condition minimale
      const meetsMinimum = newQuery.trim().length >= minChars;
      setIsValid(meetsMinimum);

      // Annuler le timeout précédent
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Si la query est vide, réinitialiser
      if (newQuery.trim().length === 0) {
        setResults(null);
        return;
      }

      // Si la query ne respecte pas la condition minimale, ne rien faire
      if (!meetsMinimum) {
        setResults(null);
        return;
      }

      // Debouncing: attendre avant d'exécuter
      debounceTimeoutRef.current = setTimeout(() => {
        executeSearch(newQuery.trim());
      }, debounceMs);
    },
    [minChars, debounceMs, executeSearch]
  );

  /**
   * Nettoyer les timeouts au démontage
   */
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Vider la cache (utile au moment du démontage ou réinitialisation)
   */
  const clearCache = useCallback(() => {
    cacheRef.current = {};
  }, []);

  /**
   * Réinitialiser tout
   */
  const reset = useCallback(() => {
    setQuery('');
    setResults(null);
    setLoading(false);
    setError(null);
    setIsValid(false);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  return {
    query,
    results,
    loading,
    error,
    isValid,
    minCharsRequired: minChars,
    charsRemaining: Math.max(0, minChars - query.trim().length),
    handleQueryChange,
    reset,
    clearCache,
  };
};
