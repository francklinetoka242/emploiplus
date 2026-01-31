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
        const { data: { session }, error: authError } = await supabase.auth.getSession();

        if (authError) throw authError;

        if (session && session.user) {
          processed.current = true;
          const user = session.user;
          const roleParam = searchParams.get('role') || 'candidate';

          console.log('✅ Authentifié:', user.email, 'Rôle souhaité:', roleParam);

          // 2. Tentative de synchronisation avec le Backend Render
          const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://emploiplus-backend.onrender.com';
          
          setSyncInProgress(true);
          try {
            const syncResponse = await fetch(`${apiUrl}/api/auth/sync-google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                profile_image_url: user.user_metadata?.avatar_url,
                user_type: roleParam,
              }),
            });

            if (!syncResponse.ok) console.warn("⚠️ Synchro backend incomplète, mais session Supabase active.");
          } catch (syncErr) {
            console.error("❌ Impossible de joindre le backend Render:", syncErr);
            // On ne bloque pas l'utilisateur ici, la session Supabase suffit pour naviguer
          } finally {
            setSyncInProgress(false);
          }

          // 3. Redirection finale - va vers le newsfeed
          toast.success('Connexion réussie !');
          navigate('/fil-actualite', { replace: true });

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
            {syncInProgress 
              ? "Synchronisation avec votre profil..." 
              : "Vérification de vos identifiants..."}
          </p>
        </div>
      </div>
    </div>
  );
};