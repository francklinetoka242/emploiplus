import { useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  user_type: string;
  full_name: string;
  [key: string]: any;
}

/**
 * ⚠️ DEPRECATED: Supabase authentication has been removed
 * @deprecated Use local API authentication instead
 * 
 * This hook previously used Supabase for authentication.
 * It now provides stub implementations to prevent runtime errors.
 * 
 * For login/registration, migrate to:
 * - /admin/register for admin registration
 * - /admin/login for admin login
 * - Standard form submission for other user types
 */
export const useSupabaseAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    '⚠️ Supabase authentication has been removed. Please use email/password authentication.'
  );

  useEffect(() => {
    console.warn('⚠️ useSupabaseAuth - Supabase authentication has been removed');
  }, []);

  const signUp = async (
    _email: string,
    _password: string,
    _metadata?: { full_name: string; user_type: string; [key: string]: any }
  ) => {
    console.warn('⚠️ useSupabaseAuth.signUp - Use API endpoint instead: POST /api/admin/register');
    return {
      error: { message: 'Supabase authentication removed. Use local API endpoints.' },
      user: null
    };
  };

  const signIn = async (_email: string, _password: string) => {
    console.warn('⚠️ useSupabaseAuth.signIn - Use API endpoint instead: POST /api/admin/login');
    return {
      error: { message: 'Supabase authentication removed. Use local API endpoints.' },
      user: null
    };
  };

  const signOut = async () => {
    console.warn('⚠️ useSupabaseAuth.signOut - Supabase removed');
    return { error: null };
  };

  const getToken = async (): Promise<string | null> => {
    console.warn('⚠️ useSupabaseAuth.getToken - Supabase removed');
    return null;
  };

  const signInWithGoogle = async () => {
    console.warn('⚠️ useSupabaseAuth.signInWithGoogle - Supabase OAuth removed');
    return {
      error: { message: 'Google OAuth not configured. Use email/password authentication.' },
      user: null
    };
  };

  return {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    getToken,
  };
};
