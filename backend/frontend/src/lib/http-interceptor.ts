/**
 * HTTP Interceptor - Global request/response management
 * 
 * ✅ Ajoute Authorization: Bearer <token> à TOUTES les requêtes
 * ✅ Gère les erreurs 401 (logout) vs 5xx (maintien session)
 * ✅ Logs détaillés des requêtes et réponses
 * ✅ Support localStorage + cookies
 */

import { buildApiUrl } from '@/lib/headers';

export interface RequestConfig {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  admin?: boolean;
  retryCount?: number;
  timeout?: number;
}

export interface ResponseData {
  data?: any;
  status: number;
  statusText: string;
  error?: string;
  headers?: Record<string, string>;
}

/**
 * Classe d'intercepteur HTTP centralisé
 */
class HttpInterceptor {
  private requestCount = 0;
  private activeRequests = new Map<string, AbortController>();

  /**
   * Récupérer token depuis localStorage ou cookies
   */
  private getToken(admin: boolean = false): string | null {
    const tokenKey = admin ? 'adminToken' : 'token';
    
    // Priorité: localStorage, puis cookies
    let token = localStorage.getItem(tokenKey);
    if (!token && typeof document !== 'undefined') {
      token = this.getFromCookie(tokenKey);
    }
    
    return token;
  }

  /**
   * Récupérer valeur depuis cookie
   */
  private getFromCookie(name: string): string | null {
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

  /**
   * Décoder JWT
   */
  private decodeJWT(token: string): Record<string, any> | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return JSON.parse(atob(parts[1]));
    } catch {
      return null;
    }
  }

  /**
   * Vérifier si token est expiré
   */
  private isTokenExpired(token: string, bufferSeconds: number = 60): boolean {
    const payload = this.decodeJWT(token);
    if (!payload || !payload.exp) return true;
    
    const expiresAt = payload.exp * 1000;
    const now = Date.now();
    return (expiresAt - now) < (bufferSeconds * 1000);
  }

  /**
   * Log de session active
   */
  private logSessionActive(token: string, context: string): void {
    const payload = this.decodeJWT(token);
    if (payload && payload.exp) {
      const expiresAt = new Date(payload.exp * 1000);
      const secondsUntilExpiry = Math.round((payload.exp * 1000 - Date.now()) / 1000);
      const minutesUntilExpiry = Math.round(secondsUntilExpiry / 60);
      
      if (secondsUntilExpiry > 0) {
        console.log(
          `🟢 [${context}] SESSION ACTIVE JUSQU'À : ${expiresAt.toLocaleString('fr-FR')} ` +
          `(${minutesUntilExpiry}min | ${secondsUntilExpiry}s)`
        );
      }
    }
  }

  /**
   * Effectuer une requête HTTP avec interception
   */
  async request(config: RequestConfig): Promise<ResponseData> {
    const {
      url,
      method = 'GET',
      headers = {},
      body,
      admin = false,
      timeout = 30000,
    } = config;

    this.requestCount++;
    const requestId = `REQ_${this.requestCount}`;
    const token = this.getToken(admin);

    // Préparer les headers
    const finalHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Ajouter Authorization si token disponible
    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
      this.logSessionActive(token, 'REQUÊTE');
    } else if (admin) {
      console.warn(`⚠️ [${requestId}] Pas de token admin trouvé`);
    }

    // Créer AbortController pour timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    this.activeRequests.set(requestId, controller);

    // Préparer la requête
    const fetchConfig: RequestInit = {
      method,
      headers: finalHeaders,
      credentials: 'include', // Important pour CORS et cookies
      signal: controller.signal,
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchConfig.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    try {
      console.log(`📤 [${requestId}] ${method} ${url}`);
      
      const response = await fetch(url, fetchConfig);
      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      let responseData: any = null;

      if (contentType?.includes('application/json')) {
        try {
          responseData = await response.json();
        } catch {
          responseData = null;
        }
      } else if (response.ok) {
        responseData = await response.text();
      }

      // Gestion des erreurs
      if (!response.ok) {
        return this.handleError(
          response.status,
          response.statusText,
          responseData,
          token,
          admin,
          requestId
        );
      }

      console.log(`✅ [${requestId}] ${method} ${response.status} ${response.statusText}`);
      
      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
      };

    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error(`❌ [${requestId}] Timeout après ${timeout}ms`);
        return {
          status: 408,
          statusText: 'Request Timeout',
          error: 'La requête a dépassé le délai imparti',
        };
      }

      console.error(`❌ [${requestId}] Erreur réseau:`, error.message);
      return {
        status: 0,
        statusText: 'Network Error',
        error: error.message || 'Erreur réseau',
      };

    } finally {
      this.activeRequests.delete(requestId);
    }
  }

  /**
   * Gestion centralisée des erreurs HTTP
   */
  private handleError(
    status: number,
    statusText: string,
    data: any,
    token: string | null,
    admin: boolean,
    requestId: string
  ): ResponseData {
    const errorMessage = data?.message || statusText;

    // ❌ Erreur 401 - Unauthorized
    if (status === 401) {
      console.error(`❌ [${requestId}] 401 Unauthorized`);

      // Vérifier si le token est vraiment expiré
      let shouldLogout = false;
      if (token) {
        const payload = this.decodeJWT(token);
        if (payload && payload.exp) {
          const secondsUntilExpiry = Math.round((payload.exp * 1000 - Date.now()) / 1000);
          if (secondsUntilExpiry <= 5) {
            shouldLogout = true;
            console.error(`   → Token vraiment expiré (${secondsUntilExpiry}s restants)`);
          } else {
            console.error(`   → Token semble valide (${secondsUntilExpiry}s restants) - Problème serveur/permissions`);
          }
        } else {
          shouldLogout = true;
        }
      } else {
        shouldLogout = true;
      }

      if (shouldLogout && admin) {
        console.log('🔐 Suppression du token et redirection vers login');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        setTimeout(() => {
          window.location.href = '/#/admin/login';
        }, 500);
      }

      return {
        status,
        statusText,
        error: errorMessage,
      };
    }

    // ⚠️ Erreurs 5xx - NE PAS REDIRIGER - MAINTENIR SESSION
    if (status >= 500) {
      console.error(`⚠️ [${requestId}] ${status} ${statusText} - SESSION MAINTENUE`);
      if (token) {
        this.logSessionActive(token, 'ERREUR 5xx');
      }
      return {
        status,
        statusText,
        error: `Erreur serveur ${status}: ${errorMessage}`,
      };
    }

    // Autres erreurs 4xx
    if (status >= 400 && status < 500) {
      console.error(`⚠️ [${requestId}] ${status} ${statusText}`);
      
      if (status === 403) {
        console.error('   → Accès refusé (permissions insuffisantes)');
      } else if (status === 404) {
        console.error('   → Ressource non trouvée');
      }

      return {
        status,
        statusText,
        error: errorMessage,
      };
    }

    // Autres erreurs
    console.error(`❌ [${requestId}] ${status} ${statusText}`);
    return {
      status,
      statusText,
      error: errorMessage,
    };
  }

  /**
   * GET request
   */
  get<T = any>(url: string, config: Partial<RequestConfig> = {}): Promise<ResponseData> {
    return this.request({
      ...config,
      url,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  post<T = any>(url: string, body: any, config: Partial<RequestConfig> = {}): Promise<ResponseData> {
    return this.request({
      ...config,
      url,
      method: 'POST',
      body,
    });
  }

  /**
   * PUT request
   */
  put<T = any>(url: string, body: any, config: Partial<RequestConfig> = {}): Promise<ResponseData> {
    return this.request({
      ...config,
      url,
      method: 'PUT',
      body,
    });
  }

  /**
   * PATCH request
   */
  patch<T = any>(url: string, body: any, config: Partial<RequestConfig> = {}): Promise<ResponseData> {
    return this.request({
      ...config,
      url,
      method: 'PATCH',
      body,
    });
  }

  /**
   * DELETE request
   */
  delete<T = any>(url: string, config: Partial<RequestConfig> = {}): Promise<ResponseData> {
    return this.request({
      ...config,
      url,
      method: 'DELETE',
    });
  }

  /**
   * Annuler toutes les requêtes en cours
   */
  cancelAll(): void {
    this.activeRequests.forEach(controller => controller.abort());
    this.activeRequests.clear();
    console.log('🛑 Toutes les requêtes ont été annulées');
  }
}

// Export singleton
export const httpInterceptor = new HttpInterceptor();
