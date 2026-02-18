import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [syncInProgress, setSyncInProgress] = useState(false);
  const processed = useRef(false);

  useEffect(() => {
    // Le useRef empêche React Strict Mode d'exécuter le code deux fois (évite d'invalider le code OAuth)
    if (processed.current) return;

    const handleAuth = async () => {
      try {
        // 1. Récupérer la session via Supabase (échange auto du code/hash)
        let {
          data: { session },
          error: authError,
        } = await supabase.auth.getSession();

        if (authError) throw authError;

        // If no session (provider used hash-based response), try to extract from URL
        if (!session) {
          try {
            const { data: urlData, error: urlError } = await supabase.auth.getSessionFromUrl();
            if (urlError) {
              console.warn('[Auth/Callback] getSessionFromUrl error:', urlError);
            } else if (urlData?.session) {
              session = urlData.session;
            }
          } catch (e) {
            console.warn('[Auth/Callback] getSessionFromUrl failed:', e);
          }
        }

        if (session && session.user) {
          processed.current = true;
          const user = session.user;
          // Role can come from query param OR localStorage (set before redirect)
          let roleParam = searchParams.get('role');
          if (!roleParam) {
            try {
              const stored = localStorage.getItem('auth_role');
              if (stored) {
                roleParam = stored;
                localStorage.removeItem('auth_role');
              }
            } catch (e) {
              // ignore
            }
          }

          console.log('✅ Authentifié:', user.email, 'roleParam:', roleParam);

          // Check if profile exists in Supabase
          setSyncInProgress(true);
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('user_type')
              .eq('id', user.id)
              .single();

            if (profile && profile.user_type) {
              // Persist token and profile for backend auth flow
              try {
                if (session?.access_token) localStorage.setItem('token', session.access_token);
                localStorage.setItem('user', JSON.stringify(profile));
              } catch (e) { /* noop */ }
              // Existing user -> redirect to their dashboard
              const dashboard = profile.user_type === 'company' ? '/company/dashboard' : '/fil-actualite';
              toast.success('Connexion réussie !');
              navigate(dashboard, { replace: true });
              return;
            }

            // No profile found: create based on roleParam if provided
            if (roleParam === 'candidate' || roleParam === 'company') {
              await supabase.from('profiles').upsert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                avatar_url: user.user_metadata?.avatar_url,
                user_type: roleParam === 'company' ? 'company' : 'candidate',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
              // Persist token and profile for backend auth flow
              try {
                if (session?.access_token) localStorage.setItem('token', session.access_token);
                const createdProfile = {
                  id: user.id,
                  email: user.email,
                  full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                  user_type: roleParam === 'company' ? 'company' : 'candidate',
                };
                localStorage.setItem('user', JSON.stringify(createdProfile));
              } catch (e) { /* noop */ }

              const dashboard = roleParam === 'company' ? '/company/dashboard' : '/fil-actualite';
              toast.success('Compte créé et connexion réussie !');
              navigate(dashboard, { replace: true });
              return;
            }

            // No role provided: ask user to choose (render choice UI)
            setSyncInProgress(false);
            // fallthrough to render choice buttons below
          } catch (syncErr) {
            console.error('❌ Erreur lors de la vérification du profil :', syncErr);
            setSyncInProgress(false);
            toast.error('Erreur lors de la synchronisation du profil');
            navigate('/connexion', { replace: true });
            return;
          }

          // If we reach here, there's no profile and no role param: show role choice to user
        } else {
          // Si après quelques secondes on n'a toujours pas de session
          console.warn("⏳ Aucune session détectée.");
          // On attend un peu pour laisser Supabase traiter l'URL
          const timer = setTimeout(() => {
            if (!processed.current) {
               toast.error("Session expirée ou lien invalide");
               navigate('/connexion', { replace: true });
            }
          }, 3000);
          return () => clearTimeout(timer);
        }
      } catch (err: any) {
        console.error('❌ Erreur critique Callback:', err.message);
        toast.error('Erreur lors de la validation du compte');
        navigate('/connexion', { replace: true });
      }
    };

    handleAuth();
  }, [navigate, searchParams]);

  // Role choice UI rendered when no profile exists and no role param provided
  const handleCreateRole = async (chosen: 'candidate' | 'company') => {
    setSyncInProgress(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error('Session manquante');

      const { data: upserted } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url,
        user_type: chosen === 'company' ? 'company' : 'candidate',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      // Persist token and profile for backend auth flow
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) localStorage.setItem('token', session.access_token);
        const profileToStore = upserted && upserted.length ? upserted[0] : { id: user.id, email: user.email, user_type: chosen };
        localStorage.setItem('user', JSON.stringify(profileToStore));
      } catch (e) { /* noop */ }

      const dashboard = chosen === 'company' ? '/company/dashboard' : '/fil-actualite';
      toast.success('Compte créé ! Redirection en cours...');
      navigate(dashboard, { replace: true });
    } catch (err) {
      console.error('❌ Impossible de créer le profil:', err);
      toast.error('Erreur lors de la création du compte');
      setSyncInProgress(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="text-center space-y-6 p-8 bg-white rounded-2xl shadow-xl border border-white/20">
        <div className="relative mx-auto h-16 w-16">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
          <div className="absolute inset-2 animate-pulse rounded-full bg-primary/10"></div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">Finalisation de la connexion</h2>
          <p className="text-muted-foreground text-sm">
            {syncInProgress ? 'Synchronisation avec votre profil...' : 'Choisissez le type de compte à créer'}
          </p>
        </div>

        {!syncInProgress && (
          <div className="mt-4 flex gap-4">
            <button
              className="px-4 py-2 rounded-md bg-gradient-primary text-white"
              onClick={() => handleCreateRole('candidate')}
            >
              Créer un compte Candidat
            </button>
            <button
              className="px-4 py-2 rounded-md bg-gradient-secondary text-white"
              onClick={() => handleCreateRole('company')}
            >
              Créer un compte Entreprise
            </button>
          </div>
        )}
      </div>
    </div>
  );
};