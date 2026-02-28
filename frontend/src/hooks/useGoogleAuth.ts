import { useCallback } from 'react';

export type UserRole = 'candidate' | 'company' | 'admin' | 'recruiter';

/**
 * Stubbed Google auth hook — real OAuth provider removed in static mode.
 * Components expect `useGoogleAuth()` to return `{ handleGoogleLogin }`.
 */
export const useGoogleAuth = () => {
  const handleGoogleLogin = useCallback(async (userRole: UserRole = 'candidate') => {
    console.warn('⚠️ Google OAuth not configured - Supabase has been removed');
    console.warn('ℹ️ Please implement alternative OAuth provider or use email/password auth');
    return {
      error: {
        message: 'Google OAuth temporarily unavailable. Please use email/password authentication or contact support.',
      },
    };
  }, []);

  return { handleGoogleLogin };
};

export default useGoogleAuth;
