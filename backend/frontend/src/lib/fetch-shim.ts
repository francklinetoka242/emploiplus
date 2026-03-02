// Global fetch shim: ajoute automatiquement le token (adminToken ou token)
// pour les appels `/api/admin` et `/api/*` quand approprié, et supprime
// `adminToken` du localStorage si le serveur répond 401.
import { getApiBaseUrl } from './headers';

const _origFetch = window.fetch.bind(window);

function isAdminUrl(url: string) {
  try {
    const u = new URL(url, window.location.origin);
    return u.pathname.startsWith('/api/admin') || u.pathname.includes('/admin/');
  } catch (e) {
    return String(url).includes('/api/admin') || String(url).includes('/admin/');
  }
}

function isApiUrl(url: string) {
  try {
    const u = new URL(url, window.location.origin);
    return u.pathname.startsWith('/api');
  } catch (e) {
    return String(url).includes('/api');
  }
}

window.fetch = async (input: RequestInfo, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof Request ? input.url : (input as any).url;
  const newInit: RequestInit = { ...(init || {}) };
  const headers: Record<string, string> = {};

  // copy existing headers (Headers, object or array)
  if (newInit.headers) {
    if (newInit.headers instanceof Headers) {
      newInit.headers.forEach((v, k) => { headers[k] = v; });
    } else if (Array.isArray(newInit.headers)) {
      (newInit.headers as Array<[string,string]>).forEach(([k,v]) => { headers[k] = v; });
    } else {
      Object.assign(headers, newInit.headers as Record<string,string>);
    }
  }

  try {
    if (isAdminUrl(url)) {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken && !headers['Authorization']) headers['Authorization'] = `Bearer ${adminToken}`;
    } else if (isApiUrl(url)) {
      const token = localStorage.getItem('token');
      if (token && !headers['Authorization']) headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore localStorage errors
  }

  if (newInit.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  newInit.headers = headers;

  const res = await _origFetch(input, newInit);

  if (res.status === 401) {
    try { localStorage.removeItem('adminToken'); } catch (e) { /* ignore */ }
  }

  return res;
};

export {};
