/**
 * HEADERS & API STUBS - Site Statique Pur
 * Aucun appel API réel, juste des stubs
 */

// Get API base URL - Retourne une URL locale
export function getApiBaseUrl() {
  return typeof window !== 'undefined' ? window.location.origin : 'https://emploiplus-group.com';
}

// Build full API URL
export function buildApiUrl(path: string) {
  const baseUrl = getApiBaseUrl();
  let cleanPath = path.startsWith('/') ? path : `/${path}`;
  cleanPath = cleanPath.replace(/\/+/g, '/');
  if (!baseUrl) return cleanPath;
  
  let rest = cleanPath.replace(/^\/api(\/|$)/, '/');
  const joined = `${baseUrl.replace(/\/+$/g, '')}/api${rest}`;
  const withoutDupApi = joined.replace(/\/api\/+(api)\//g, '/api/');
  const protoSafe = withoutDupApi.replace(/:\/\//, '___PROTO___');
  const collapsed = protoSafe.replace(/([^_])\/+/g, '$1/').replace(/___PROTO___/, '://');
  return collapsed;
}

// Get auth headers - Retourne des headers vides
export function authHeaders(contentType?: string, tokenKey = 'token') {
  const headers: Record<string, string> = {};
  if (contentType) headers['Content-Type'] = contentType;
  return headers;
}

// Stub pour apiFetch - Pas de vrais appels API
export async function apiFetch(
  url: string,
  init: RequestInit = {},
  opts: { admin?: boolean; expectArray?: boolean } = {}
) {
  console.warn('[STATIC SITE] apiFetch stubbed - no actual API calls:', url);
  await new Promise(resolve => setTimeout(resolve, 100));
  return opts.expectArray ? [] : { data: null };
}

// Dummy function for compatibility
export function decodeJWT(token: string) {
  return null;
}

// Dummy function for compatibility
export function isTokenExpired(token: string): boolean {
  return true;
}

