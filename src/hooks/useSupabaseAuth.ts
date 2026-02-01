import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  user_type: string;
  full_name: string;
  [key: string]: any;
}

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { session: initialSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(sessionError.message);
        }

        setSession(initialSession);

        // If session exists, fetch user profile from public users table
        if (initialSession?.user) {
          await fetchUserProfile(initialSession.user.id);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err instanceof Error ? err.message : 'Erreur d\'authentification');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event);
      setSession(newSession);

      if (newSession?.user) {
        // User signed in
        await fetchUserProfile(newSession.user.id);
      } else {
        // User signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Fetch user profile from public users table
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        setError(error.message);
        return null;
      }

      const profile = data as AuthUser;
      setUser(profile);
      return profile;
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Erreur');
      return null;
    }
  };

  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    metadata: {
      full_name: string;
      user_type: string;
      [key: string]: any;
    }
  ) => {
    try {
      setError(null);
      const envSite = import.meta.env.VITE_SITE_URL as string | undefined;
      const emailRedirectTo = envSite && envSite.length > 0
        ? `${envSite.replace(/\/$/, '')}/auth/callback`
        : `${window.location.origin}/auth/callback`;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata, // Store metadata in raw_user_meta_data
          emailRedirectTo,
        },
      });

      if (signUpError) {
        // Supabase may return "Email signups are disabled" if project disallows email signups.
        // The app currently runs without email verification; suppress that specific message and
        // treat it as a neutral success so the UX proceeds to login screen.
        const msg = signUpError.message || '';
        if (msg.toLowerCase().includes('email signups are disabled')) {
          console.warn('[Auth] Supabase email signups disabled — continuing UX without blocking.');
          return { error: null, user: null };
        }

        setError(signUpError.message);
        return { error: signUpError, user: null };
      }

      // Note: User profile will be created by the database trigger
      // after the trigger processes the auth.users insert
      
      return { error: null, user: data.user };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur d\'inscription';
      setError(message);
      return { error: { message }, user: null };
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        const msg = signInError.message || '';
        if (msg.toLowerCase().includes('email logins are disabled') || msg.toLowerCase().includes('email signups are disabled')) {
          // Friendly message and guidance — email auth is disabled in Supabase project
          const friendly = new Error("La connexion par e-mail est désactivée. Utilisez 'Continuer avec Google'.");
          setError(friendly.message);
          return { error: friendly, user: null };
        }

        setError(signInError.message);
        return { error: signInError, user: null };
      }

      // Fetch user profile after sign in
      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        return { error: null, user: profile };
      }

      return { error: null, user: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(message);
      return { error: { message }, user: null };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setError(null);
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        setError(signOutError.message);
        return { error: signOutError };
      }

      setUser(null);
      setSession(null);
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de déconnexion';
      setError(message);
      return { error: { message } };
    }
  };

  // Get current auth token
  const getToken = async (): Promise<string | null> => {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return null;
    return data.session.access_token;
  };

  // Sign in with Google OAuth
  const signInWithGoogle = async () => {
    try {
      setError(null);
      
      // Determine the redirect URL based on environment
      // Prefer explicit site URL from environment when available
      const envSite = import.meta.env.VITE_SITE_URL as string | undefined;
      const redirectTo = envSite && envSite.length > 0
        ? `${envSite.replace(/\/$/, '')}/auth/callback`
        : `${window.location.origin}/auth/callback`;

      console.log('🔐 signInWithGoogle redirectTo:', redirectTo);

      // ensure we save role if any previously set by UI
      try { /* noop - role is saved by UI before redirect */ } catch {}

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        return { error: oauthError, user: null };
      }

      return { error: null, user: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de connexion Google';
      setError(message);
      return { error: { message }, user: null };
    }
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
    supabase, // Export supabase client for direct use if needed
  };
};
