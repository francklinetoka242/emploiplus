/**
 * Admin Authentication Context
 * Gère la persistance du token JWT et la revalidation en arrière-plan
 * ✅ Support des cookies persistants et localStorage
 * ✅ Maintien de session robuste (distinction 401 vs 5xx)
 * ✅ Logs détaillés de session active
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { buildApiUrl } from '@/lib/headers';

interface AdminUser {
  id: number;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  admin: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkTokenValidity: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🔧 Utilitaires pour gérer les cookies
function setAuthCookie(name: string, value: string, daysToExpire: number = 7) {
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));
  const cookieString = `${name}=${encodeURIComponent(value)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
  document.cookie = cookieString;
}

function getAuthCookie(name: string): string | null {
  const nameEQ = name + '=';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(nameEQ)) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
}

function deleteAuthCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialiser depuis localStorage OU cookies
  useEffect(() => {
    // Priorité: localStorage, puis cookies
    let storedToken = localStorage.getItem('adminToken') || getAuthCookie('adminToken');
    let storedAdmin = localStorage.getItem('admin') || getAuthCookie('admin');

    if (storedToken && storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin);
        
        // Vérifier l'expiration du token
        if (isTokenValid(storedToken)) {
          setToken(storedToken);
          setAdmin(adminData);
          
          // Assurer la persistance dans localStorage ET cookies
          localStorage.setItem('adminToken', storedToken);
          localStorage.setItem('admin', storedAdmin);
          setAuthCookie('adminToken', storedToken, 7);
          setAuthCookie('admin', storedAdmin, 7);
          
          console.log('✅ Token restauré:', {
            source: localStorage.getItem('adminToken') ? 'localStorage' : 'cookies',
            email: adminData.email,
            role: adminData.role,
          });
          
          // 🕐 LOG DÉTAILLÉ SESSION ACTIVE AU DÉMARRAGE
          logSessionActive(storedToken, 'INITIALISATION');
          
          // Revalider en arrière-plan
          revalidateTokenInBackground(storedToken);
        } else {
          console.warn('⏱️ Token expiré au démarrage');
          clearAuth();
        }
      } catch (e) {
        console.error('❌ Erreur parsing admin data:', e);
        clearAuth();
      }
    } else {
      console.log('ℹ️ Pas de session trouvée (premier login)');
    }
    setLoading(false);
  }, []);

  // 🕐 Fonction de log centralisée pour la session active
  function logSessionActive(jwtToken: string, context: string = 'REQUÊTE') {
    try {
      const parts = jwtToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const expiresAt = new Date(payload.exp * 1000);
        const now = Date.now();
        const secondsUntilExpiry = Math.round((payload.exp * 1000 - now) / 1000);
        const minutesUntilExpiry = Math.round(secondsUntilExpiry / 60);
        const hoursUntilExpiry = Math.round(secondsUntilExpiry / 3600);
        
        if (secondsUntilExpiry > 0) {
          const timeStr = hoursUntilExpiry > 0 
            ? `${hoursUntilExpiry}h${minutesUntilExpiry % 60}min`
            : `${minutesUntilExpiry}min`;
          console.log(
            `🟢 [${context}] SESSION ACTIVE JUSQU'À : ${expiresAt.toLocaleString('fr-FR')} ` +
            `(${timeStr} | ${secondsUntilExpiry}s)`
          );
        } else {
          console.warn('🔴 [SESSION EXPIRÉE] La session a expiré');
        }
      }
    } catch (e) {
      console.warn('⚠️ Impossible de décoder le token pour afficher la session');
    }
  }

  // Vérifier s'il y a un décalage d'horloge et log quand la session expire
  function isTokenValid(jwtToken: string): boolean {
    try {
      const parts = jwtToken.split('.');
      if (parts.length !== 3) {
        console.error('❌ Token JWT malformé');
        return false;
      }

      // Décoder le payload (partie 2)
      const payload = JSON.parse(atob(parts[1]));
      const expiresAt = payload.exp * 1000; // exp est en secondes
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
      const secondsUntilExpiry = Math.round(timeUntilExpiry / 1000);

      const logData = {
        issuedAt: new Date(payload.iat * 1000).toISOString(),
        expiresAt: new Date(expiresAt).toISOString(),
        now: new Date(now).toISOString(),
        secondsUntilExpiry,
        minutesUntilExpiry: Math.round(secondsUntilExpiry / 60),
        hourUntilExpiry: Math.round(secondsUntilExpiry / 3600),
        sessionActiveUntil: new Date(expiresAt).toLocaleString('fr-FR'),
      };

      console.log('📋 Token Validation - SYNC HORLOGE:', logData);
      
      // 🕐 LOG PRINCIPAL : Quand la session doit expirer
      if (secondsUntilExpiry > 0) {
        console.log(`✅ 🕐 Session active jusqu'à : ${new Date(expiresAt).toLocaleString('fr-FR')} (${secondsUntilExpiry}s restants)`);
      }

      // Considérer le token comme valide s'il n'expire pas dans les 60 prochaines secondes
      if (timeUntilExpiry < 60000) {
        console.warn('⚠️ ⏰ Token expira dans moins de 60 secondes:', {
          secondsUntilExpiry,
          expiresAt: new Date(expiresAt).toISOString()
        });
        return false;
      }

      return true;
    } catch (e) {
      console.error('❌ Erreur vérification token:', e);
      return false;
    }
  }

  // Revalider le token en arrière-plan
  async function revalidateTokenInBackground(jwtToken: string) {
    try {
      const res = await fetch(buildApiUrl('/api/admin-auth/verify-token'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!res.ok) {
        console.warn('⚠️ Token revalidation échouée:', res.status);
        
        // ⚠️ Ne pas rediriger sur 500 - seulement sur 401
        if (res.status === 401) {
          console.error('❌ Token invalide (401) - Suppression et redirection');
          clearAuth();
          window.location.href = '/#/admin/login';
        }
        // 500 ou autre: Log mais continue la session
        else if (res.status >= 500) {
          console.warn('⚠️ Erreur serveur 5xx - Session maintenue');
        }
        return;
      }

      const data = await res.json();
      console.log('✅ Token revalidé avec succès');
      
      // Mettre à jour l'admin si les données ont changé
      if (data.admin) {
        setAdmin(data.admin);
        localStorage.setItem('admin', JSON.stringify(data.admin));
      }
    } catch (e) {
      console.error('❌ Erreur revalidation background:', e);
      // Continue la session même si erreur réseau
    }
  }

  function clearAuth() {
    // Effacer localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    
    // Effacer les cookies
    deleteAuthCookie('adminToken');
    deleteAuthCookie('admin');
    
    // Effacer l'état React
    setToken(null);
    setAdmin(null);
    
    console.log('✅ Authentification supprimée (localStorage + cookies)');
  }

  async function login(email: string, password: string) {
    try {
      const res = await fetch(buildApiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important pour CORS
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('❌ Erreur login:', data.message || res.statusText);
        return {
          success: false,
          error: data.message || 'Erreur de connexion',
        };
      }

      if (data.token && data.admin) {
        // Sauvegarder dans localStorage
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('admin', JSON.stringify(data.admin));
        
        // Sauvegarder dans les cookies (persistance 7 jours)
        setAuthCookie('adminToken', data.token, 7);
        setAuthCookie('admin', JSON.stringify(data.admin), 7);
        
        // Mettre à jour l'état React
        setToken(data.token);
        setAdmin(data.admin);
        
        // 🕐 LOG DÉTAILLÉ APRÈS CONNEXION
        logSessionActive(data.token, 'CONNEXION');
        
        console.log('✅ Connexion réussie:', {
          email: data.admin.email,
          role: data.admin.role,
          persistence: 'localStorage + cookies (7j)',
        });
        
        return { success: true };
      }

      return {
        success: false,
        error: 'Réponse serveur invalide',
      };
    } catch (e) {
      console.error('❌ Erreur login:', e);
      return {
        success: false,
        error: 'Erreur serveur',
      };
    }
  }

  function logout() {
    console.log('🔴 Déconnexion en cours...');
    clearAuth();
    // Petite attente avant redirection
    setTimeout(() => {
      window.location.href = '/#/admin/login';
    }, 300);
  }

  function checkTokenValidity(): boolean {
    return token ? isTokenValid(token) : false;
  }

  // 🕐 Afficher régulièrement l'état de la session (toutes les minutes)
  useEffect(() => {
    if (!token) return;

    const logSessionStatus = () => {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const expiresAt = new Date(payload.exp * 1000);
          const now = Date.now();
          const secondsUntilExpiry = Math.round((payload.exp * 1000 - now) / 1000);
          const minutesUntilExpiry = Math.round(secondsUntilExpiry / 60);
          const hoursUntilExpiry = Math.round(secondsUntilExpiry / 3600);
          
          if (secondsUntilExpiry > 0) {
            const timeStr = hoursUntilExpiry > 0 
              ? `${hoursUntilExpiry}h${minutesUntilExpiry % 60}min`
              : `${minutesUntilExpiry}min`;
            console.log(
              `🟢 [SESSION ACTIVE] Vous resterez connecté ${timeStr} ` +
              `(jusqu'à ${expiresAt.toLocaleString('fr-FR')})`
            );
          } else {
            console.warn('🔴 [SESSION EXPIRÉE] La session a expiré, déconnexion en cours...');
            clearAuth();
          }
        }
      } catch (e) {
        console.warn('⚠️ Erreur vérification session:', e);
      }
    };

    // Log immédiatement au montage
    logSessionStatus();

    // Puis log toutes les minutes
    const interval = setInterval(logSessionStatus, 60000);
    
    // Aussi vérifier l'expiration toutes les 30 secondes (5 min avant expiration)
    const expirationCheck = setInterval(() => {
      try {
        if (token) {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const secondsUntilExpiry = Math.round((payload.exp * 1000 - Date.now()) / 1000);
            
            // Si expiration dans 5 minutes, afficher un avertissement
            if (secondsUntilExpiry <= 300 && secondsUntilExpiry > 0) {
              console.warn(
                `⏰ [EXPIRATION PROCHE] Vous serez déconnecté dans ${Math.round(secondsUntilExpiry / 60)}min ` +
                `(${new Date(payload.exp * 1000).toLocaleTimeString('fr-FR')})`
              );
            }
          }
        }
      } catch (e) {
        // ignore
      }
    }, 30000);
    
    return () => {
      clearInterval(interval);
      clearInterval(expirationCheck);
    };
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        admin,
        token,
        loading,
        login,
        logout,
        checkTokenValidity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext doit être utilisé dans AuthProvider');
  }
  return context;
}
