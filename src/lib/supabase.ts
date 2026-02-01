// Supabase client initialization for authentication and real-time features
// Priority: VITE_ vars (for Vite) -> NEXT_PUBLIC_ vars (Vercel integration) -> process.env fallbacks
import { createClient, SupabaseClient } from '@supabase/supabase-js'

function readEnvVar(name: string): string | undefined {
  // Prefer import.meta.env for Vite apps
  // @ts-ignore - import.meta.env is Vite injected
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]) {
    return String(import.meta.env[name]);
  }
  // Fallback to process.env (useful in some build environments)
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return String(process.env[name]);
  }
  return undefined;
}

const supabaseUrl = readEnvVar('VITE_SUPABASE_URL')
  || readEnvVar('NEXT_PUBLIC_SUPABASE_URL')
  || readEnvVar('SUPABASE_URL')
  || '';

const supabaseAnonKey = readEnvVar('VITE_SUPABASE_ANON_KEY')
  || readEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  || readEnvVar('SUPABASE_ANON_KEY')
  || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found in environment. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (preferred) or NEXT_PUBLIC_SUPABASE_* are set.');
}

export function createSupabaseClient(url?: string, anonKey?: string): SupabaseClient {
  const u = url || supabaseUrl;
  const k = anonKey || supabaseAnonKey;
  return createClient(u, k);
}

export const supabase = createSupabaseClient();
