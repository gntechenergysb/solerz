import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const raw = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const k = trimmed.slice(0, idx).trim();
    let v = trimmed.slice(idx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[k] = v;
  }
  return env;
}

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

const args = parseArgs(process.argv);
const env = loadEnvLocal();

const url = env.VITE_SUPABASE_URL;
const anon = env.VITE_SUPABASE_ANON_KEY;
if (!url || !anon) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const password = (args.password && String(args.password)) || process.env.SOLERZ_TEST_PASSWORD;
if (!password) {
  console.error('Missing password. Provide --password 123456 or set SOLERZ_TEST_PASSWORD.');
  process.exit(1);
}

const accounts = [
  { name: 'buyer', email: 'buyer@solerz.com' },
  { name: 'seller', email: 'seller_com@solerz.com' },
  { name: 'admin', email: 'admin@solerz.com' }
];

function client() {
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

async function testAccount({ name, email }) {
  const sb = client();

  const out = {
    name,
    email,
    signIn: { ok: false },
    getUser: { ok: false },
    signOut: { ok: false }
  };

  try {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      out.signIn.error = error.message;
      return out;
    }
    out.signIn.ok = true;
    out.signIn.userId = data.user?.id || null;

    const u = await sb.auth.getUser();
    if (u.error) {
      out.getUser.error = u.error.message;
    } else {
      out.getUser.ok = true;
      out.getUser.userId = u.data.user?.id || null;
    }

    const s = await sb.auth.signOut();
    if (s.error) {
      out.signOut.error = s.error.message;
    } else {
      out.signOut.ok = true;
    }

    return out;
  } catch (e) {
    out.signIn.error = String(e?.message || e);
    return out;
  }
}

async function main() {
  console.log('Auth smoke test starting...');
  console.log(`Supabase: ${url}`);

  const results = [];
  for (const acc of accounts) {
    // eslint-disable-next-line no-await-in-loop
    const r = await testAccount(acc);
    results.push(r);
  }

  let fail = 0;
  for (const r of results) {
    const ok = r.signIn.ok && r.signOut.ok;
    if (!ok) fail++;

    console.log('\n---');
    console.log(`${r.name}: ${r.email}`);
    console.log(`signIn: ${r.signIn.ok ? 'OK' : 'FAIL'}${r.signIn.error ? ` (${r.signIn.error})` : ''}`);
    console.log(`getUser: ${r.getUser.ok ? 'OK' : 'WARN'}${r.getUser.error ? ` (${r.getUser.error})` : ''}`);
    console.log(`signOut: ${r.signOut.ok ? 'OK' : 'FAIL'}${r.signOut.error ? ` (${r.signOut.error})` : ''}`);
  }

  console.log('\n---');
  console.log(`Done. Failed accounts: ${fail}/${results.length}`);

  process.exit(fail ? 1 : 0);
}

main();
