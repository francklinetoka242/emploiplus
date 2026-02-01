import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import path from 'path';

function parseEnv(content) {
  const lines = content.split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

function randomEmail() {
  const t = Date.now();
  return `test+${t}@example.com`;
}

async function main() {
  const envPath = path.join(process.cwd(), '.env');
  let content = '';
  try { content = await readFile(envPath, 'utf8'); } catch (e) { /* ignore */ }
  const fileEnv = content ? parseEnv(content) : {};
  const url = fileEnv.VITE_SUPABASE_URL || fileEnv.NEXT_PUBLIC_SUPABASE_URL || fileEnv.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anon = fileEnv.VITE_SUPABASE_ANON_KEY || fileEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || fileEnv.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !anon) {
    console.error('Supabase URL or anon key not found. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    process.exit(2);
  }

  console.log('Using Supabase URL:', url);
  const supabase = createClient(url, anon);

  // 1) Create test user
  const email = process.argv[2] || randomEmail();
  const password = 'P@ssw0rd!12345';
  console.log('Attempting signUp with:', email);
  try {
    const { data: signData, error: signError } = await supabase.auth.signUp({ email, password });
    if (signError) {
      console.error('SignUp error:', signError.message);
      if (signError.message && signError.message.toLowerCase().includes('disabled')) {
        console.log('Email signups disabled in Supabase project — cannot complete signUp test.');
        process.exit(3);
      }
    } else {
      console.log('SignUp response:', signData);
    }
  } catch (err) {
    console.error('Unexpected signUp error:', err);
  }

  // 2) Attempt signIn (may work immediately if confirmation not required)
  console.log('Attempting signInWithPassword...');
  try {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      console.error('SignIn error:', signInError.message);
      // If sign-in not allowed yet, show message and exit
    } else {
      console.log('SignIn success:', { session: signInData.session ? 'present' : null });
      // 3) Try reading profile
      if (signInData.session && signInData.session.user) {
        const userId = signInData.session.user.id;
        console.log('Fetching profile for user id:', userId);
        const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (profileError) {
          console.warn('Profile read error (may be created by trigger):', profileError.message);
        } else {
          console.log('Profile:', profileData);
        }
      }
    }
  } catch (err) {
    console.error('Unexpected signIn error:', err);
  }

  console.log('Test auth flows finished.');
}

main();
