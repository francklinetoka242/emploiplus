// Get API base URL from environment variable - use for all API calls on Vercel
export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || '';
}

// Build full API URL
export function buildApiUrl(path: string) {
  const baseUrl = getApiBaseUrl();
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (baseUrl) {
    return `${baseUrl}${cleanPath}`;
  }
  return cleanPath;
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

