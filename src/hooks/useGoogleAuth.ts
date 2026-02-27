export type UserRole = 'candidate' | 'company';

/**
 * Hook pour la connexion OAuth Google
 * 
 * ⚠️ DEPRECATED: Supabase OAuth a été supprimé
 * 
 * Migration requise: Implémenter Google OAuth via:
 * - Google Identity Services (oauth2-google package)
 * - Backend custom OAuth handler
 * - Alternative: Facebook/LinkedIn OAuth
 */
export const useGoogleAuth = () => {
  const handleGoogleLogin = async (userRole: UserRole = 'candidate') => {
    console.warn('⚠️ Google OAuth not configured - Supabase has been removed');
    console.warn('ℹ️ Please implement alternative OAuth provider or use email/password auth');
    
    return { 
      error: { 
        message: 'Google OAuth temporarily unavailable. Please use email/password authentication or contact support.' 
      } 
    };
  };

  return { handleGoogleLogin };
};
