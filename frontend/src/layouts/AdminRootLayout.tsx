/**
 * Admin Root Layout
 * Ajoute le système de revalidation de token à toute l'interface admin
 */

import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminRootLayoutProps {
  children: React.ReactNode;
}

export function AdminRootLayout({ children }: AdminRootLayoutProps) {
  const { isAuthenticated, loading } = useAdminAuth();
  const navigate = useNavigate();

  // Rediriger vers login si non authentifié
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.warn('🔐 Non authentifié, redirection vers /admin/login');
      navigate('/admin/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
