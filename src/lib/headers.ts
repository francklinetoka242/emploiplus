import { supabase } from '@/lib/supabase';

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

// Get auth headers with token (supports both old JWT and Supabase)
export function authHeaders(contentType?: string, tokenKey = 'token') {
  const token = localStorage.getItem(tokenKey);
  const headers: Record<string, string> = {};
  if (contentType) headers['Content-Type'] = contentType;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// Get Supabase auth headers (includes both JWT and Supabase API key if needed)
export async function supabaseAuthHeaders(contentType?: string): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  if (contentType) headers['Content-Type'] = contentType;

  // Try to get Supabase session token
  try {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session && !error) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    } catch (e) {
      console.error('Error getting Supabase session:', e);
    }
  } catch (e) {
    console.error('Error getting Supabase session:', e);
  }

  return headers;
}

