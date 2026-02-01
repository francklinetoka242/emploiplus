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

async function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  let content = '';
  try { content = await readFile(envPath, 'utf8'); } catch (e) { /* ignore */ }
  return content ? parseEnv(content) : {};
}

async function run() {
  const fileEnv = await loadEnv();
  const url = fileEnv.VITE_SUPABASE_URL || fileEnv.NEXT_PUBLIC_SUPABASE_URL || fileEnv.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anon = fileEnv.VITE_SUPABASE_ANON_KEY || fileEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || fileEnv.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !anon) {
    console.error('Supabase URL or anon key not found. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    process.exit(2);
  }

  console.log('\n=== Supabase Test Suite ===\n');
  console.log('Using Supabase URL:', url);

  const supabase = createClient(url, anon);
  const summary = [];

  // Test 1: Basic connectivity - select from entreprises
  try {
    const { data, error, status } = await supabase.from('entreprises').select('id').limit(1);
    if (error) throw error;
    summary.push({ test: 'connectivity_entreprises', ok: true, info: `status ${status}` });
    console.log('[OK] connectivity_entreprises');
  } catch (err) {
    summary.push({ test: 'connectivity_entreprises', ok: false, info: String(err) });
    console.warn('[FAIL] connectivity_entreprises', err.message || err);
  }

  // Test 2: publications select
  try {
    const { data, error, status } = await supabase.from('publications').select('id').limit(1);
    if (error) throw error;
    summary.push({ test: 'connectivity_publications', ok: true, info: `status ${status}` });
    console.log('[OK] connectivity_publications');
  } catch (err) {
    summary.push({ test: 'connectivity_publications', ok: false, info: String(err) });
    console.warn('[FAIL] connectivity_publications', err.message || err);
  }

  // Test 3: auth signup + signin + profile read
  const email = randomEmail();
  const password = 'P@ssw0rd!12345';
  try {
    const { data: signData, error: signError } = await supabase.auth.signUp({ email, password });
    if (signError) {
      summary.push({ test: 'auth_signup', ok: false, info: signError.message });
      console.warn('[FAIL] auth_signup', signError.message);
    } else {
      summary.push({ test: 'auth_signup', ok: true, info: `user ${signData.user?.id}` });
      console.log('[OK] auth_signup', signData.user?.id);

      // sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        summary.push({ test: 'auth_signin', ok: false, info: signInError.message });
        console.warn('[FAIL] auth_signin', signInError.message);
      } else {
        summary.push({ test: 'auth_signin', ok: true, info: `session ${!!signInData.session}` });
        console.log('[OK] auth_signin');

        // try reading profile
        try {
          const userId = signInData.session?.user?.id;
          if (!userId) throw new Error('No user id in session');
          const { data: profileData, error: profileErr } = await supabase.from('profiles').select('*').eq('id', userId).single();
          if (profileErr) throw profileErr;
          summary.push({ test: 'profile_read', ok: true, info: JSON.stringify(profileData) });
          console.log('[OK] profile_read');
        } catch (err) {
          summary.push({ test: 'profile_read', ok: false, info: String(err) });
          console.warn('[WARN] profile_read', err.message || err);
        }
      }
    }
  } catch (err) {
    summary.push({ test: 'auth_flow', ok: false, info: String(err) });
    console.warn('[FAIL] auth_flow', err.message || err);
  }

  // Test 4: storage public URL generation (avatars bucket)
  try {
    const filePath = 'test-nonexistent-file.png';
    const { data: publicUrlData } = await supabase.storage.from('avatars').getPublicUrl(filePath);
    if (publicUrlData && publicUrlData.publicUrl) {
      summary.push({ test: 'storage_getPublicUrl', ok: true, info: publicUrlData.publicUrl });
      console.log('[OK] storage_getPublicUrl');
    } else {
      throw new Error('No publicUrl returned');
    }
  } catch (err) {
    summary.push({ test: 'storage_getPublicUrl', ok: false, info: String(err) });
    console.warn('[WARN] storage_getPublicUrl', err.message || err);
  }

  // Test 5: v_newsfeed_feed view
  try {
    const { data, error } = await supabase.from('v_newsfeed_feed').select('id').limit(1);
    if (error) throw error;
    summary.push({ test: 'v_newsfeed_feed', ok: true, info: `rows ${data?.length || 0}` });
    console.log('[OK] v_newsfeed_feed');
  } catch (err) {
    summary.push({ test: 'v_newsfeed_feed', ok: false, info: String(err) });
    console.warn('[WARN] v_newsfeed_feed', err.message || err);
  }

  console.log('\n=== Summary ===');
  for (const s of summary) {
    console.log(`${s.ok ? '[OK ]' : '[FAIL]'} ${s.test} - ${s.info}`);
  }
  console.log('\nTest suite finished.');
}

run();
