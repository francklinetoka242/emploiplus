/**
 * PHASE 2 - Exemple d'Utilisation du Module d'Authentification (Frontend)
 * 
 * Ce fichier montre comment utiliser l'API d'authentification depuis React/Vue/Angular
 * ou n'importe quel framework frontend.
 */

// ============================================================
// 1. SERVICE D'AUTHENTIFICATION (Frontend)
// ============================================================

// services/authService.ts (TypeScript)
export class AuthService {
  private baseUrl = 'https://api.emploiplus-group.com/api';
  private tokenKey = 'auth_token';

  /**
   * Login - Authentifie l'admin
   * @param email - Email de l'admin
   * @param password - Mot de passe de l'admin
   * @returns Token JWT ou erreur
   */
  async login(email: string, password: string) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Erreur (401, 400, 500, etc.)
        throw new Error(data.message || 'Authentification échouée');
      }

      // ✅ Succès - Stocker le token
      if (data.data?.token) {
        localStorage.setItem(this.tokenKey, data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.admin));
      }

      return data.data;
    } catch (error) {
      console.error('❌ Erreur login:', error);
      throw error;
    }
  }

  /**
   * GetMe - Récupère le profil de l'utilisateur connecté
   * @returns Profil de l'admin
   */
  async getMe() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Token manquant');
      }

      const response = await fetch(`${this.baseUrl}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Token expiré ou invalide
        if (response.status === 401) {
          this.logout(); // Nettoyer et rediriger
          throw new Error('Session expirée');
        }
        throw new Error(data.message || 'Erreur');
      }

      return data.data;
    } catch (error) {
      console.error('❌ Erreur getMe:', error);
      throw error;
    }
  }

  /**
   * Logout - Déconnecte l'utilisateur
   */
  async logout() {
    try {
      const token = this.getToken();
      if (token) {
        // Appel optionnel au backend
        await fetch(`${this.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('⚠️  Erreur logout backend:', error);
    } finally {
      // Nettoyer le storage côté client
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem('user');
    }
  }

  /**
   * GetToken - Récupère le token stocké
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * IsAuthenticated - Vérifie si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * GetUser - Retourne les infos de l'admin stockées localement
   */
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

// ============================================================
// 2. EXEMPLE D'UTILISATION - REACT
// ============================================================

// pages/LoginPage.tsx (React)
import { useState } from 'react';
import { AuthService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const authService = new AuthService();

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Appeler le service d'authentification
      const result = await authService.login(email, password);

      console.log('✅ Login réussi:', result.admin);

      // Rediriger vers le dashboard
      navigate('/dashboard');
    } catch (err) {
      // Afficher l'erreur (ex: "Email ou mot de passe incorrect")
      setError(err instanceof Error ? err.message : 'Erreur login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <h2>Connexion Admin</h2>

        {error && <div className="error-message">{error}</div>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}

// ============================================================
// 3. AXIOS INTERCEPTOR (Pour ajouter le token automatiquement)
// ============================================================

// api/axiosInstance.ts
import axios from 'axios';
import { AuthService } from '../services/authService';

const authService = new AuthService();

export const axiosInstance = axios.create({
  baseURL: 'https://api.emploiplus-group.com/api',
});

// Interceptor pour ajouter le token à chaque requête
axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor pour gérer les erreurs 401 (token expiré)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré - déconnecter
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================
// 4. PROTECTED ROUTE COMPONENT
// ============================================================

// components/ProtectedRoute.tsx (React Router)
import { Navigate } from 'react-router-dom';
import { AuthService } from '../services/authService';

const authService = new AuthService();

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();

  // Pas de token -> rediriger vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Vérifier le rôle si spécifié
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// ============================================================
// 5. EXEMPLE D'INTÉGRATION - VUE/NUXT
// ============================================================

// composables/useAuth.ts (Vue 3)
import { ref, computed } from 'vue';
import { AuthService } from '../services/authService';

const authService = new AuthService();

export function useAuth() {
  const user = ref(authService.getUser());
  const token = ref(authService.getToken());
  const loading = ref(false);
  const error = ref('');

  const isAuthenticated = computed(() => !!token.value);

  const login = async (email: string, password: string) => {
    loading.value = true;
    error.value = '';

    try {
      const result = await authService.login(email, password);
      user.value = result.admin;
      token.value = result.token;
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur login';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    await authService.logout();
    user.value = null;
    token.value = null;
  };

  const getMe = async () => {
    try {
      const profile = await authService.getMe();
      user.value = profile;
      return profile;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur';
      throw err;
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    getMe,
  };
}

// App.vue
<template>
  <div class="app">
    <LoginPage v-if="!isAuthenticated" />
    <Dashboard v-else />
  </div>
</template>

<script setup lang="ts">
import { useAuth } from './composables/useAuth';
import LoginPage from './pages/LoginPage.vue';
import Dashboard from './pages/Dashboard.vue';

const { isAuthenticated } = useAuth();
</script>

// ============================================================
// 6. FLUX D'AUTHENTIFICATION COMPLET
// ============================================================

/**
 * FLUX D'AUTHENTIFICATION CÔTÉ FRONTEND
 * 
 * 1. Utilisateur arrive sur la page login
 *    ├─ Si token en localStorage → Rediriger vers dashboard
 *    └─ Sinon → Afficher le formulaire login
 * 
 * 2. Utilisateur entre email/password et clique "Connexion"
 *    ├─ Front envoie POST /api/auth/login
 *    ├─ Backend valide et retourne { token, admin, expiresIn }
 *    └─ Front stocke le token dans localStorage
 * 
 * 3. Utilisateur accède à une page protégée
 *    ├─ Front ajoute "Authorization: Bearer <token>" aux headers
 *    ├─ Backend valide le token avec authMiddleware
 *    ├─ Si valide → Traiter la requête
 *    └─ Si expiré → Retourner 401
 * 
 * 4. Frontend reçoit 401 (token expiré)
 *    ├─ Appeler authService.logout()
 *    ├─ Supprimer token du localStorage
 *    └─ Rediriger vers /login
 * 
 * 5. Utilisateur se déconnecte
 *    ├─ Front appelle POST /api/auth/logout (optionnel)
 *    ├─ Front supprime le token du localStorage
 *    └─ Frontend redirige vers /login
 */

// ============================================================
// 7. TEST MANUEL - CURL
// ============================================================

/**
 * # 1. Login
 * curl -X POST http://localhost:5000/api/auth/login \
 *   -H "Content-Type: application/json" \
 *   -d '{"email":"admin@emploiplus-group.com","password":"changeme123"}'
 * 
 * Réponse:
 * {
 *   "success": true,
 *   "data": {
 *     "token": "eyJhbGciOiJIUzI1NiIs...",
 *     "admin": { "id": "123", "email": "...", "role": "admin", ... },
 *     "expiresIn": 86400
 *   }
 * }
 * 
 * # 2. Récupérer le profil (remplacer TOKEN)
 * curl http://localhost:5000/api/auth/me \
 *   -H "Authorization: Bearer <TOKEN>"
 * 
 * Réponse:
 * {
 *   "success": true,
 *   "data": { "id": "123", "email": "admin@emploiplus-group.com", ... }
 * }
 * 
 * # 3. Logout
 * curl -X POST http://localhost:5000/api/auth/logout \
 *   -H "Authorization: Bearer <TOKEN>"
 * 
 * Réponse:
 * {
 *   "success": true,
 *   "message": "Déconnexion réussie"
 * }
 */

// ============================================================
// 8. GESTION DES ERREURS AU FRONTEND
// ============================================================

/**
 * Erreurs possibles et comment les gérer:
 * 
 * 400 - Bad Request
 *   └─ Message: "L'email est requis et doit être une chaîne non vide"
 *   └─ Action: Vérifier que les inputs ne sont pas vides
 * 
 * 401 - Unauthorized
 *   └─ Message: "Email ou mot de passe incorrect"
 *   └─ Action: Afficher "Identifiants invalides"
 *   └─ Message: "Token manquant. Format attendu: Authorization: Bearer <token>"
 *   └─ Action: Rediriger vers /login
 * 
 * 403 - Forbidden
 *   └─ Message: "Compte désactivé (statut: blocked)"
 *   └─ Action: Afficher "Votre compte a été désactivé contactez l'admin"
 * 
 * 404 - Not Found
 *   └─ Message: "Admin non trouvé"
 *   └─ Action: Impossible en production (au login), ignorer
 * 
 * 500 - Internal Server Error
 *   └─ Message: "Erreur lors de l'authentification: ..."
 *   └─ Action: Afficher "Erreur serveur, réessayez plus tard"
 */
