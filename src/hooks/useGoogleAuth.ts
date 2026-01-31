import { supabase } from '../lib/supabase';

export type UserRole = 'candidate' | 'company';

/**
 * Hook pour la connexion OAuth Google via Supabase
 * 
 * Flow:
 * 1. Appel direct à supabase.auth.signInWithOAuth (pas de backend Render)
 * 2. Passe le rôle (candidate/company) en query param
 * 3. Google redirect → /auth/callback?code=...&role=...
 * 4. Route Vercel synchronise avec Supabase et profiles table
 * 
 * LinkedIn-scale: Pas de latence d'appel backend, OAuth géré natif par Supabase
 */
export const useGoogleAuth = () => {
  const handleGoogleLogin = async (userRole: UserRole = 'candidate') => {
    try {
      // ====================================================================
      // CONFIGURATION REDIRECT URL
      // ====================================================================
      // Production: Vercel deployment
      // Development: Local + network debugging
      
      // Prefer explicit site URL from environment when available (Vite)
      const envSite = import.meta.env.VITE_SITE_URL as string | undefined;
      const baseUrl = envSite && envSite.length > 0 ? envSite : window.location.origin;
      // Persist desired role in localStorage so callback can recover it (avoid passing role in redirectTo)
      try { localStorage.setItem('auth_role', userRole); } catch (e) { /* ignore */ }
      const redirectTo = `${baseUrl.replace(/\/$/, '')}/auth/callback`;

      console.log('🔐 Google OAuth redirectTo:', redirectTo);

      const isProduction = (envSite && envSite.includes('vercel.app')) ||
        window.location.hostname.includes('vercel.app') ||
        window.location.hostname.includes('emploiplus');

      console.log('🔐 Google OAuth configuration', {
        environment: isProduction ? 'production' : 'development',
        redirectTo,
        role: userRole,
        timestamp: new Date().toISOString(),
      });

      // ====================================================================
      // APPEL OAUTH SUPABASE (DIRECT, PAS DE BACKEND)
      // ====================================================================
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo, // URL de callback après OAuth
          
          // Query parameters pour Google OAuth
          queryParams: {
            access_type: 'offline',     // Permet refresh token
            prompt: 'consent',          // Montre toujours le consent screen
          },
          
          // Scope: email + profile par défaut
          // Si besoin accès email secondaire, ajouter: email
          skipBrowserRedirect: false,   // Laisse le navigateur effectuer le redirect
        },
      });

      if (error) {
        console.error('❌ Google OAuth error:', {
          message: error.message,
          status: (error as any).status,
          code: (error as any).code,
        });
        
        return { 
          error: { 
            message: error.message || 'Erreur lors de la connexion Google. Vérifiez votre configuration.' 
          } 
        };
      }

      // Note: supabase.auth.signInWithOAuth gère le redirect automatiquement
      // Pas besoin d'utiliser data.url, le navigateur redirige
      console.log('✅ Google OAuth initiated successfully, awaiting Google redirect');
      
      return { 
        error: null, 
        user: data.user || null,
        session: data.session || null,
      };
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la connexion Google';
      console.error('❌ Google auth exception:', {
        message,
        stack: err instanceof Error ? err.stack : 'N/A',
        timestamp: new Date().toISOString(),
      });
      
      return { 
        error: { 
          message,
          originalError: err,
        } 
      };
    }
  };

  return { handleGoogleLogin };
};
