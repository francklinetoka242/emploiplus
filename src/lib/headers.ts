// Get API base URL from environment variable - use for all API calls on Vercel
export function getApiBaseUrl() {
  // Prefer VITE_API_URL (new) but fall back to VITE_API_BASE_URL (legacy)
  const raw = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
  if (!raw) return '';
  // Normalize: remove trailing slashes and any trailing "/api" so callers can
  // append "/api" exactly once when needed.
  return raw.toString().trim().replace(/\/+$|\/api$/g, '').replace(/\/api$/g, '');
}

// Build full API URL. When `VITE_API_URL` is set, we ensure the final URL
// contains a single `/api` segment and avoid duplicates when callers pass
// paths that already include `/api`.
export function buildApiUrl(path: string) {
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (!baseUrl) {
    // No external base set (local development) — return path unchanged
    return cleanPath;
  }

  // If path already starts with /api, strip it so we add /api exactly once
  const rest = cleanPath.startsWith('/api') ? cleanPath.slice(4) : cleanPath;
  return `${baseUrl}/api${rest}`;
}

// Get auth headers with token (supports both JWT formats: admin token and user token)
export function authHeaders(contentType?: string, tokenKey = 'token') {
  const token = localStorage.getItem(tokenKey);
  const headers: Record<string, string> = {};
  if (contentType) headers['Content-Type'] = contentType;
  if (token) headers['Authorization'] = `Bearer ${token}`;
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

