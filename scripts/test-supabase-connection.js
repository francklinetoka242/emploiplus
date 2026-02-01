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
    // Remove surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

async function main() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    let content = '';
    try {
      content = await readFile(envPath, 'utf8');
    } catch (e) {
      console.warn('.env not found in project root; falling back to process.env');
    }

    const fileEnv = content ? parseEnv(content) : {};

    const url = fileEnv.VITE_SUPABASE_URL || fileEnv.NEXT_PUBLIC_SUPABASE_URL || fileEnv.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const anon = fileEnv.VITE_SUPABASE_ANON_KEY || fileEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || fileEnv.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!url || !anon) {
      console.error('Supabase URL or anon key not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env or env.');
      process.exit(2);
    }

    console.log('Using Supabase URL:', url);

    const supabase = createClient(url, anon, {
      // small timeout
      global: { headers: { 'x-test': '1' } },
    });

    const table = process.argv[2] || 'profiles';
    console.log(`Running test query: select id from ${table} limit 1`);
    const { data, error, status } = await supabase.from(table).select('id').limit(1);
    if (error) {
      console.error('Error querying profiles:', error);
      process.exit(3);
    }

    console.log('Query status:', status);
    console.log('Data:', data);
    console.log('✅ Supabase connection OK');
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(4);
  }
}

main();
