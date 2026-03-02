/**
 * HEADERS & API HELPERS - version dynamique
 *
 * Lorsque l'application s'exécute avec un back‑end accessible, ces helpers
 * construisent des URL basées sur `VITE_API_BASE_URL`/`VITE_API_URL` et
 * ajoutent les en-têtes d'authentification appropriés.  Le flag
 * `VITE_USE_STATIC=true` peut être utilisé pour revenir en arrière vers les
 * stubs (utile pour générer un site exporté).
 */

/**
 * retourne la base de l'API (sans slash final).  Si plusieurs variables sont
 * définies, on privilégie `VITE_API_BASE_URL`.
 */
export function getApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return String(import.meta.env.VITE_API_BASE_URL).replace(/\/+$/g, '');
  }
  if (import.meta.env.VITE_API_URL) {
    return String(import.meta.env.VITE_API_URL).replace(/\/+$/g, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}

/**
 * Concatène correctement un chemin à la base de l'API, en s'assurant qu'un
 * seul `/api` figure dans l'URL finale et en nettoyant les slashes doubles.
 */
export function buildApiUrl(path: string) {
  const base = getApiBaseUrl();
  let clean = path.startsWith('/') ? path : `/${path}`;
  clean = clean.replace(/\/+$/g, '');
  let rest = clean.replace(/^\/api(\/|$)/, '/');
  const joined = `${base.replace(/\/+$/g, '')}/api${rest}`;
  return joined.replace(/([^:]\/)\/+/g, '$1');
}

/**
 * Renvoie un objet d'en-têtes avec `Authorization` si un token est trouvé
 * dans `localStorage`.  Le paramètre `tokenKey` permet d'utiliser le token
 * d'administration (`adminToken`).
 */
export function authHeaders(contentType?: string, tokenKey = 'token') {
  const headers: Record<string, string> = {};
  if (contentType) headers['Content-Type'] = contentType;
  try {
    const token = localStorage.getItem(tokenKey);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (_e) {
    // silent (peut lever en SSR)
  }
  return headers;
}

/**
 * Wrapper simplifié autour de `fetch` pour interroger notre API.  Il se charge
 * du préfixe `/api`, des headers d'auth et d'analyser automatiquement la
 * réponse JSON.
 */
export async function apiFetch(
  url: string,
  init: RequestInit = {},
  opts: { admin?: boolean; expectArray?: boolean } = {}
) {
  const fullUrl = buildApiUrl(url);
  const headers = {
    ...init.headers,
    ...authHeaders(undefined, opts.admin ? 'adminToken' : 'token'),
  };
  const response = await fetch(fullUrl, { ...init, headers });
  const ct = response.headers.get('content-type') || '';
  let data: any;
  if (ct.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }
  if (!response.ok) {
    throw new Error(data?.message || response.statusText);
  }
  if (opts.expectArray) {
    return Array.isArray(data) ? data : data?.data || [];
  }
  return data;
}

/**
 * Décodage sommaire d'un JWT (sans vérification) pour récupérer le payload.
 */
export function decodeJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(payload);
    return JSON.parse(json);
  } catch (_e) {
    return null;
  }
}

/**
 * Indique si un token JWT est expiré en regardant le champ `exp`.
 */
export function isTokenExpired(token: string): boolean {
  const payload: any = decodeJWT(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}
