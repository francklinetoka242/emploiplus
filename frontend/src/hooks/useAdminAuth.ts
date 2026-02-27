/**
 * Admin Authentication Hook
 * Gère la persistance du token JWT et la revalidation en arrière-plan
 */

import { useEffect, useState, useCallback } from 'react';
import { buildApiUrl } from '@/lib/headers';

interface AdminUser {
  id: number;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
}

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Décoder un JWT et vérifier sa validité
   */
  const decodeJWT = useCallback((jwtToken: string) => {
    try {
      const parts = jwtToken.split('.');
      if (parts.length !== 3) {
        console.error('❌ JWT malformé');
        return null;
      }

      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (e) {
      console.error('❌ Erreur décodage JWT:', e);
      return null;
    }
  }, []);

  /**
   * Vérifier si le token est expiré
   */
  const isTokenValid = useCallback(
    (jwtToken: string) => {
      const payload = decodeJWT(jwtToken);
      if (!payload || !payload.exp) {
        console.warn('⚠️ Token malformé ou pas de exp claim');
        return false;
      }

      const expiresAt = payload.exp * 1000; // exp est en secondes
      const now = Date.now();
      const secondsUntilExpiry = Math.round((expiresAt - now) / 1000);

      console.log('📋 Token validation:', {
        expiresAt: new Date(expiresAt).toISOString(),
        now: new Date(now).toISOString(),
        secondsUntilExpiry,
      });

      // Token expiré
      if (secondsUntilExpiry <= 0) {
        console.warn('⏱️ Token expiré');
        return false;
      }

      // Token expira bientôt (< 1 min)
      if (secondsUntilExpiry < 60) {
        console.warn('⚠️ Token expira dans moins d\'une minute');
        return false;
      }

      return true;
    },
    [decodeJWT]
  );

  /**
   * Initialiser depuis localStorage
   */
  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('admin');

    if (storedToken && storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin);

        if (isTokenValid(storedToken)) {
          setToken(storedToken);
          setAdmin(adminData);
          setIsAuthenticated(true);
          console.log('✅ Admin authentifié depuis localStorage:', adminData.email);
        } else {
          console.warn('⏱️ Token stocké est expiré');
          logout();
        }
      } catch (e) {
        console.error('❌ Erreur parsing admin data:', e);
        logout();
      }
    }

    setLoading(false);
  }, [isTokenValid]);

  /**
   * Revalider le token avec le backend
   */
  const validateTokenWithBackend = useCallback(async (jwtToken: string) => {
    try {
      const res = await fetch(buildApiUrl('/api/admin-auth/verify-token'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (res.status === 401) {
        console.warn('❌ Token rejeté par le backend (401)');
        logout();
        return false;
      }

      if (!res.ok) {
        console.warn('⚠️ Erreur revalidation token:', res.status);
        return false;
      }

      const data = await res.json();
      console.log('✅ Token revalidé avec le backend');

      // Mettre à jour l'admin si nécessaire
      if (data.admin) {
        setAdmin(data.admin);
        localStorage.setItem('admin', JSON.stringify(data.admin));
      }

      return true;
    } catch (e) {
      console.error('❌ Erreur revalidation backend:', e);
      return false;
    }
  }, []);

  /**
   * Revalider tous les 5 minutes
   */
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(async () => {
      console.log('🔄 Revalidation du token...');
      if (!isTokenValid(token)) {
        console.error('❌ Token expiration détectée');
        logout();
        return;
      }

      await validateTokenWithBackend(token);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [token, isTokenValid, validateTokenWithBackend]);

  /**
   * Déconnexion
   */
  function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    setToken(null);
    setAdmin(null);
    setIsAuthenticated(false);
    console.log('✅ Déconnecté');
  }

  return {
    isAuthenticated,
    admin,
    token,
    loading,
    logout,
    isTokenValid,
  };
}
