import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

/**
 * OAuth Callback Handler
 * 
 * ⚠️ DEPRECATED: Supabase OAuth has been removed
 * 
 * This page was used to handle OAuth redirects from Google/GitHub/etc.
 * Since Supabase has been removed, OAuth needs to be reconfigured.
 */
export const AuthCallback = () => {
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const handleCallback = async () => {
      try {
        toast.error('OAuth callback service unavailable - Supabase removed');
        console.warn('⚠️ OAuth callback - Supabase authentication has been removed');
        
        setTimeout(() => {
          navigate('/connexion', { replace: true });
        }, 2000);
      } catch (error) {
        console.error('Error in callback handler:', error);
        navigate('/connexion', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-6 bg-white rounded-lg shadow-lg">
        <div className="mb-4 animate-spin inline-block">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
        <p className="text-gray-600 mb-2">Authentification en cours...</p>
        <p className="text-sm text-gray-500">Veuillez patienter</p>
      </div>
    </div>
  );
};
