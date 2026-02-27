// Get API base URL from environment variable - use for all API calls on Vercel
export function getApiBaseUrl() {
  // Prefer VITE_API_URL (new) but fall back to VITE_API_BASE_URL (legacy)
  const raw = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
  // If no env configured, default to the current page origin to avoid CORS
  const fallback = (typeof window !== 'undefined' && window.location && window.location.origin)
    ? window.location.origin
    : 'https://emploiplus-group.com';
  if (!raw) return fallback;
  // Normalize: remove trailing slashes and any trailing "/api" so callers can
  // append "/api" exactly once when needed.
  return raw.toString().trim().replace(/\/+$|\/api$/g, '').replace(/\/api$/g, '');
}

// Build full API URL. When `VITE_API_URL` is set, we ensure the final URL
// contains a single `/api` segment and avoid duplicates when callers pass
// paths that already include `/api`.
export function buildApiUrl(path: string) {
  const baseUrl = getApiBaseUrl();
  // Ensure path starts with a single leading slash
  let cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Collapse duplicate slashes in the provided path
  cleanPath = cleanPath.replace(/\/+/g, '/');

  if (!baseUrl) {
    // No external base set (local development) — return normalized path
    return cleanPath;
  }

  // Remove any leading /api from the path to avoid double '/api/api'
  let rest = cleanPath.replace(/^\/api(\/|$)/, '/');

  // Compose URL and collapse accidental duplicate segments (but preserve protocol)
  const joined = `${baseUrl.replace(/\/+$/g, '')}/api${rest}`;

  // Collapse duplicate '/api/api' if still present and multiple slashes (excluding protocol)
  const withoutDupApi = joined.replace(/\/api\/+(api)\//g, '/api/');

  // Remove any duplicate slashes except the '://' after protocol
  const protoSafe = withoutDupApi.replace(/:\/\//, '___PROTO___');
  const collapsed = protoSafe.replace(/([^_])\/+/g, '$1/').replace(/___PROTO___/, '://');

  return collapsed;
}

// Get auth headers with token (supports both JWT formats: admin token and user token)
export function authHeaders(contentType?: string, tokenKey = 'token') {
  const token = localStorage.getItem(tokenKey);
  const headers: Record<string, string> = {};
  if (contentType) headers['Content-Type'] = contentType;
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    
    // Log avec détails de la session
    try {
      const payload = decodeJWT(token);
      if (payload && payload.exp) {
        const expiresAt = payload.exp * 1000;
        const now = Date.now();
        const secondsUntilExpiry = Math.round((expiresAt - now) / 1000);
        const minutesUntilExpiry = Math.round(secondsUntilExpiry / 60);
        const sessionEndTime = new Date(expiresAt).toLocaleString('fr-FR');
        
        console.log(
          `✅ [${tokenKey === 'adminToken' ? 'ADMIN' : 'USER'}] Authorization inclus | ` +
          `🕐 Session active jusqu'à : ${sessionEndTime} (${minutesUntilExpiry}min restants)`
        );
      }
    } catch (e) {
      console.log(`✅ [${tokenKey === 'adminToken' ? 'ADMIN' : 'USER'}] Authorization header inclus`);
    }
  } else {
    console.warn(`⚠️ Pas de token ${tokenKey} trouvé dans localStorage`);
  }
  return headers;
}

// Legacy: Get auth headers with Supabase session
// DEPRECATED: Use authHeaders() instead for admin auth
export async function supabaseAuthHeaders(contentType?: string): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  if (contentType) headers['Content-Type'] = contentType;

  // For backward compatibility, try to get token from localStorage
  try {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    console.error('Error getting auth headers:', e);
  }

  return headers;
}

/**
 * Décoder un JWT et retourner le payload
 */
function decodeJWT(token: string) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Validate base64url characters before attempting to decode
    const b64 = parts[1];
    if (!/^[A-Za-z0-9_-]+$/.test(b64)) {
      console.warn('decodeJWT: payload part not base64url, skipping decode');
      return null;
    }

    // base64url -> base64
    let payloadB64 = b64.replace(/-/g, '+').replace(/_/g, '/');
    // Pad with '=' to make length divisible by 4
    while (payloadB64.length % 4 !== 0) payloadB64 += '=';

    let decoded: string;
    try {
      decoded = atob(payloadB64);
    } catch (err) {
      console.error('decodeJWT: atob failed', err);
      return null;
    }

    try {
      return JSON.parse(decoded);
    } catch (e) {
      console.error('decodeJWT: JSON.parse failed', e);
      return null;
    }
  } catch (e) {
    console.error('Erreur décodage JWT (unexpected):', e);
    return null;
  }
}

/**
 * Vérifier si un token JWT est expiré
 */
function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    console.warn('⚠️ Token invalide ou pas de exp claim');
    return true;
  }

  const expiresAt = payload.exp * 1000; // exp est en secondes
  const now = Date.now();
  const secondsUntilExpiry = Math.round((expiresAt - now) / 1000);

  // Log seulement une fois par token expiration
  if (secondsUntilExpiry < 300) {
    console.warn('⏱️ Token expirant bientôt:', {
      expiresAt: new Date(expiresAt).toISOString(),
      now: new Date(now).toISOString(),
      secondsUntilExpiry,
    });
  }

  return expiresAt <= now;
}

// Centralized fetch wrapper that automatically attaches tokens and handles 401s.
export async function apiFetch(url: string, init: RequestInit = {}, opts: { admin?: boolean; expectArray?: boolean } = {}) {
  const headers: Record<string, string> = {};
  // copy provided headers (if any)
  if (init.headers) {
    try {
      const h = init.headers as Record<string, string>;
      Object.assign(headers, h);
    } catch (e) {
      // ignore
    }
  }

  const tokenKey = opts.admin ? 'adminToken' : 'token';
  let tokenPayload: any = null;
  
  try {
    // Essayer d'abord le localStorage, puis les cookies
    let token = localStorage.getItem(tokenKey);
    if (!token && typeof document !== 'undefined') {
      // Fallback sur les cookies si disponibles
      const cookies = document.cookie.split(';');
      const cookieName = opts.admin ? 'adminToken' : 'token';
      for (const cookie of cookies) {
        const [name, value] = cookie.split('=');
        if (name.trim() === cookieName) {
          token = decodeURIComponent(value);
          break;
        }
      }
    }
    
    // Vérifier l'expiration avant de faire la requête
    if (token) {
      tokenPayload = decodeJWT(token);
      
      // Log détaillé de la synchronisation temporelle
      if (tokenPayload && tokenPayload.exp) {
        const expiresAt = tokenPayload.exp * 1000; // exp est en secondes
        const now = Date.now();
        const secondsUntilExpiry = Math.round((expiresAt - now) / 1000);
        const minutesUntilExpiry = Math.round(secondsUntilExpiry / 60);
        
        console.log(`📤 [${tokenKey === 'adminToken' ? '👤 ADMIN' : '👥 USER'}] ${init.method || 'GET'} ${url}`);
        console.log(`🕐 [SESSION ACTIVE] Jusqu'à: ${new Date(expiresAt).toLocaleString('fr-FR')} (${minutesUntilExpiry}min, ${secondsUntilExpiry}s)`);
      }
      
      if (isTokenExpired(token)) {
        console.error('❌ Token expiré (vérifié avant requête), suppression', { tokenKey });
        localStorage.removeItem(tokenKey);
        if (opts.admin) {
          localStorage.removeItem('admin');
        }
        
        if (opts.admin && typeof window !== 'undefined') {
          console.warn('🔐 Redirection vers login (token expiré)');
          window.location.href = '/#/admin/login';
        }
        
        return opts.expectArray ? [] : null;
      }
      
      if (!headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log(`✅ [${tokenKey === 'adminToken' ? 'ADMIN' : 'USER'}] Authorization: Bearer xxxxxxx inclus`);
      }
    } else {
      console.warn(`⚠️ [${tokenKey}] Pas de token trouvé dans localStorage ni dans les cookies`);
    }
  } catch (e) {
    console.warn('Erreur gestion token:', e);
  }

  if (init.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

  // Ajouter les credentials CORS
  const fetchInit: RequestInit = {
    ...init,
    headers,
    credentials: 'include', // Important pour les cookies et CORS
  };

  const res = await fetch(url, fetchInit);

  // Gestion intelligente des erreurs - SEULEMENT 401 cause logout
  if (res.status === 401) {
    console.error('❌ [API 401 Unauthorized] - Analyse du token...');
    
    // Vérifier si le token est réellement expiré AVANT de le supprimer
    let shouldClearToken = false;
    
    if (tokenPayload && tokenPayload.exp) {
      const expiresAt = tokenPayload.exp * 1000;
      const now = Date.now();
      const secondsUntilExpiry = Math.round((expiresAt - now) / 1000);
      
      // Log détaillé au moment du 401
      console.error('🔍 [DIAGNOSTIC 401]', {
        tokenKey,
        secondsUntilExpiry,
        expiresAt: new Date(expiresAt).toISOString(),
        clientNow: new Date(now).toISOString(),
        message: secondsUntilExpiry > 0 
          ? 'Token techniquement valide mais serveur retourne 401' 
          : 'Token réellement expiré'
      });
      
      // Ne supprimer le token que s'il est vraiment expiré (avec une marge de 5 secondes)
      shouldClearToken = secondsUntilExpiry <= 5;
    } else {
      // Si on ne peut pas vérifier l'expiration, on le supprime (prudent)
      shouldClearToken = true;
      console.error('⚠️ Impossible de décoder le token, suppression par précaution');
    }
    
    if (shouldClearToken) {
      console.log(`🔄 Suppression du token ${tokenKey} (vraiment expiré)`);
      try {
        localStorage.removeItem(tokenKey);
        if (opts.admin) {
          localStorage.removeItem('admin');
        }
      } catch (e) {
        /* ignore */
      }
      
      // Rediriger vers la page de login UNIQUEMENT si token vraiment expiré
      if (opts.admin && typeof window !== 'undefined') {
        console.warn('🔐 Redirection vers login (401 + token expiré)');
        setTimeout(() => {
          window.location.href = '/#/admin/login';
        }, 500);
      }
    } else {
      // Token semble valide mais problème - log sans redirection immédiate
      console.error('⚠️ 401 reçu mais token valide - possible problème serveur, CORS ou permissions');
      console.error('   → Session MAINTENUE (redirection différée)');
    }
    
    return opts.expectArray ? [] : null;
  }

  // ⚠️ Gestion des erreurs 5xx - NE PAS REDIRIGER - MAINTENIR LA SESSION
  if (res.status >= 500) {
    const statusText = res.statusText || 'Server Error';
    console.error(`⚠️ [API ${res.status} ${statusText}] - Session MAINTENUE`);
    console.error(`   URL: ${url} (${init.method || 'GET'})`);
    console.error(`   ℹ️ Erreur serveur temporaire, session active continue. Veuillez réessayer.`);
    console.warn(`   Session active jusqu'à: ${tokenPayload?.exp ? new Date(tokenPayload.exp * 1000).toLocaleString('fr-FR') : 'N/A'}`);
    // Ne pas rediriger, juste retourner null pour que le composant gère l'erreur
    return opts.expectArray ? [] : null;
  }

  // Autres erreurs HTTP (4xx sauf 401)
  if (res.status >= 400 && res.status < 500 && res.status !== 401) {
    console.error(`⚠️ [API ${res.status} ${res.statusText}] ${url} - Session MAINTENUE`);
    
    if (res.status === 403) {
      console.error('   → Accès refusé (permissions insuffisantes)');
    } else if (res.status === 404) {
      console.error('   → Ressource non trouvée');
    }
    
    return opts.expectArray ? [] : null;
  }

  if (!res.ok) {
    console.error('❌ [API Error]', res.status, res.statusText, url);
    return opts.expectArray ? [] : null;
  }

  try {
    const parsed = await res.json();
    // Normalize to axios-like shape: return { data: parsed }
    // Backend responses may be { success, data } so callers can use
    // `response.data.data` to access the payload (matching new contract).
    return { data: parsed };
  } catch (e) {
    console.error('Erreur parsing réponse:', e);
    return { data: null };
  }
}

