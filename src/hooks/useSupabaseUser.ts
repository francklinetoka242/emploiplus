import { useState, useEffect } from 'react';

/**
 * Hook pour récupérer l'utilisateur Supabase
 * 
 * ⚠️ DEPRECATED: Supabase has been removed
 */
export const useSupabaseUser = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.warn('⚠️ useSupabaseUser - Supabase authentication has been removed');
    setLoading(false);
    setUser(null);
  }, []);

  return { user, loading };
};
