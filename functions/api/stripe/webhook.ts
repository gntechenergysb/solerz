import type { Env } from '../../_utils';

const STRIPE_SIGNATURE_HEADER = 'stripe-signature';

const normalizeTier = (t: string) => {
  const v = String(t || '').trim().toUpperCase();
  if (v === 'STARTER' || v === 'PRO' || v === 'MERCHANT' || v === 'ENTERPRISE') return v;
  return null;
};

const timingSafeEqual = (a: ArrayBuffer, b: ArrayBuffer) => {
  if (a.byteLength !== b.byteLength) return false;
  const av = new Uint8Array(a);
  const bv = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < av.length; i += 1) diff |= av[i] ^ bv[i];
  return diff === 0;
};

const importHmacKey = async (secret: string) => {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
};

const hmacSha256Hex = async (secret: string, msg: string) => {
  const key = await importHmacKey(secret);
  const enc = new TextEncoder();
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
};

const verifyStripeSignature = async (payload: string, header: string, secret: string) => {
  // Header format: t=timestamp,v1=signature,v0=...
  const parts = header.split(',').map((p) => p.trim());
  const tPart = parts.find((p) => p.startsWith('t='));
  const v1Parts = parts.filter((p) => p.startsWith('v1='));
  const timestamp = tPart ? tPart.slice(2) : '';
  const signatures = v1Parts.map((p) => p.slice(3)).filter(Boolean);

  if (!timestamp || signatures.length === 0) return false;

  // optional: tolerate +/- 5 min
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  const now = Math.floor(Date.now() / 1000);
  const toleranceSec = 300;
  if (Math.abs(now - ts) > toleranceSec) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const expectedHex = await hmacSha256Hex(secret, signedPayload);

  const enc = new TextEncoder();
  const expectedBuf = enc.encode(expectedHex).buffer;
  for (const sig of signatures) {
    const sigBuf = enc.encode(sig).buffer;
    if (timingSafeEqual(expectedBuf, sigBuf)) return true;
  }
  return false;
};

const updateTierWithServiceRole = async (env: Env, userId: string, tier: string) => {
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return { ok: false, error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' };
  }

  const baseUrl = supabaseUrl.replace(/\/$/, '');

  // Fetch current role to avoid overwriting ADMIN/SELLER
  let currentRole = '';
  const roleRes = await fetch(`${baseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=role&limit=1`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Accept: 'application/json'
    }
  });
  if (roleRes.ok) {
    const arr = (await roleRes.json().catch(() => null)) as any;
    const row = Array.isArray(arr) && arr.length ? arr[0] : null;
    currentRole = String(row?.role || '').trim().toUpperCase();
  }

  const patch: any = {
    tier,
    updated_at: new Date().toISOString()
  };

  if (currentRole === 'BUYER') {
    patch.role = 'SELLER';
  }

  // Update profiles table directly (service role bypasses RLS)
  const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(patch)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return { ok: false, error: text || res.statusText };
  }
  return { ok: true };
};

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const secret = env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new Response('Missing STRIPE_WEBHOOK_SECRET', { status: 500 });
  }

  const sigHeader = request.headers.get(STRIPE_SIGNATURE_HEADER) || '';
  if (!sigHeader) {
    return new Response('Missing Stripe signature', { status: 400 });
  }

  const payload = await request.text();
  const ok = await verifyStripeSignature(payload, sigHeader, secret);
  if (!ok) {
    return new Response('Invalid signature', { status: 400 });
  }

  const event = JSON.parse(payload || '{}') as any;
  const type = String(event?.type || '');

  // We only need to update tier on successful payments.
  // - checkout.session.completed for one-time payment
  // - invoice.paid for subscriptions (recurring)
  let userId = '';
  let tier: string | null = null;

  if (type === 'checkout.session.completed') {
    const session = event?.data?.object;
    userId = String(session?.metadata?.user_id || session?.client_reference_id || '').trim();
    tier = normalizeTier(String(session?.metadata?.tier || ''));
  } else if (type === 'invoice.paid') {
    const invoice = event?.data?.object;
    userId = String(invoice?.subscription_details?.metadata?.user_id || invoice?.metadata?.user_id || '').trim();
    tier = normalizeTier(String(invoice?.subscription_details?.metadata?.tier || invoice?.metadata?.tier || ''));
  } else {
    // Ignore other events
    return new Response('ok', { status: 200 });
  }

  if (!userId || !tier) {
    return new Response('Missing metadata', { status: 200 });
  }

  const update = await updateTierWithServiceRole(env, userId, tier);
  if (!update.ok) {
    return new Response(`Failed to update tier: ${update.error || 'unknown'}`, { status: 500 });
  }

  return new Response('ok', { status: 200 });
};
