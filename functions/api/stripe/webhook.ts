import type { Env } from '../../_utils';

const STRIPE_SIGNATURE_HEADER = 'stripe-signature';

type StripeCatalogProductIds = Partial<
  Record<'STARTER' | 'PRO' | 'MERCHANT' | 'ENTERPRISE', Partial<Record<'monthly' | 'yearly', string>>>
>;

const DEFAULT_STRIPE_CATALOG_IDS: StripeCatalogProductIds = {
  STARTER: { monthly: 'prod_Tv7VBjeUan8T3x', yearly: 'prod_Tv8mSSNSh8jHx0' },
  PRO: { monthly: 'prod_Tv8mFLtMiHmUkw', yearly: 'prod_Tv8ntvfSKWhVk8' },
  MERCHANT: { monthly: 'prod_Tv8nCHHVEy2CJ5', yearly: 'prod_Tv8oYiJfNgpX9N' },
  ENTERPRISE: { monthly: 'prod_Tv8pxG4tKoelsQ', yearly: 'prod_Tv8pjvPDhz8sEq' }
};

const normalizeTier = (t: string) => {
  const v = String(t || '').trim().toUpperCase();
  if (v === 'STARTER' || v === 'PRO' || v === 'MERCHANT' || v === 'ENTERPRISE') return v;
  return null;
};

const getTierFromCatalogProductId = (env: Env, productId: string): string | null => {
  const pid = String(productId || '').trim();
  if (!pid) return null;

  const raw = String(env.STRIPE_CATALOG_PRODUCT_IDS_JSON || '').trim();
  const candidates: StripeCatalogProductIds[] = [DEFAULT_STRIPE_CATALOG_IDS];
  if (raw) {
    try {
      candidates.unshift(JSON.parse(raw) as StripeCatalogProductIds);
    } catch {
      // ignore
    }
  }

  const tiers: Array<keyof StripeCatalogProductIds> = ['STARTER', 'PRO', 'MERCHANT', 'ENTERPRISE'];
  for (const parsed of candidates) {
    for (const t of tiers) {
      const monthly = String(parsed?.[t]?.monthly || '').trim();
      const yearly = String(parsed?.[t]?.yearly || '').trim();
      if (monthly === pid || yearly === pid) return t;
    }
  }

  return null;
};

const getTierFromCatalogId = async (env: Env, id: string): Promise<string | null> => {
  const v = String(id || '').trim();
  if (!v) return null;
  if (v.startsWith('prod_')) return getTierFromCatalogProductId(env, v);

  // If mapping is price_*, resolve product via Stripe (best-effort)
  if (v.startsWith('price_') && env.STRIPE_SECRET_KEY) {
    const res = await fetch(`https://api.stripe.com/v1/prices/${encodeURIComponent(v)}`, {
      headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` }
    });
    if (res.ok) {
      const json = (await res.json().catch(() => null)) as any;
      const productId = String(json?.product || '').trim();
      if (productId) return getTierFromCatalogProductId(env, productId);
    }
  }

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
    console.log('missing env for supabase update', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceRoleKey: !!serviceKey
    });

    if (!supabaseUrl && !serviceKey) {
      return { ok: false, error: 'Missing SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY' };
    }
    if (!supabaseUrl) {
      return { ok: false, error: 'Missing SUPABASE_URL (or VITE_SUPABASE_URL)' };
    }
    return { ok: false, error: 'Missing SUPABASE_SERVICE_ROLE_KEY' };
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
    pending_tier: null,
    tier_effective_at: null,
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

const bestEffortPatchStripeFields = async (
  env: Env,
  userId: string,
  patch: Record<string, any>
) => {
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return;

  const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`,
    {
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() })
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.log('stripe webhook stripe-field patch skipped', res.status, text);
  }
};

const bestEffortPatchPendingFromSubscription = async (env: Env, sub: any) => {
  const userId = String(sub?.metadata?.user_id || '').trim();
  if (!userId) return;

  const cancelAtPeriodEnd = sub?.cancel_at_period_end;
  const currentPeriodEnd = Number(sub?.current_period_end ?? NaN);
  const patch: Record<string, any> = {
    stripe_cancel_at_period_end: typeof cancelAtPeriodEnd === 'boolean' ? cancelAtPeriodEnd : null
  };

  if (Number.isFinite(currentPeriodEnd)) {
    patch.stripe_current_period_end = currentPeriodEnd;
  }

  if (cancelAtPeriodEnd === true) {
    patch.pending_tier = 'UNSUBSCRIBED';
    if (Number.isFinite(currentPeriodEnd)) patch.tier_effective_at = currentPeriodEnd;
  } else if (cancelAtPeriodEnd === false) {
    patch.pending_tier = null;
    patch.tier_effective_at = null;
  }

  await bestEffortPatchStripeFields(env, userId, patch);
};

const fetchStripeSubscriptionMetadata = async (
  stripeSecretKey: string,
  subscriptionId: string
): Promise<{ userId: string; tier: string } | null> => {
  const res = await fetch(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`
    }
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.log('stripe subscription fetch failed', res.status, text);
    return null;
  }

  const sub = (await res.json().catch(() => null)) as any;
  const userId = String(sub?.metadata?.user_id || '').trim();
  const tier = String(sub?.metadata?.tier || '').trim();
  const normalized = normalizeTier(tier);
  if (!userId || !normalized) return null;
  return { userId, tier: normalized };
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
    console.log('stripe webhook invalid signature');
    return new Response('Invalid signature', { status: 400 });
  }

  const event = JSON.parse(payload || '{}') as any;
  const type = String(event?.type || '');
  console.log('stripe webhook event', type);

  // We only need to update tier on successful payments.
  // - checkout.session.completed for one-time payment
  // - invoice.paid for subscriptions (recurring)
  let userId = '';
  let tier: string | null = null;
  let stripeCustomerId = '';
  let stripeSubscriptionId = '';
  let stripeSubscriptionStatus = '';
  let stripeCurrentPeriodEnd: number | null = null;
  let stripeCancelAtPeriodEnd: boolean | null = null;

  if (type === 'checkout.session.completed') {
    const session = event?.data?.object;
    userId = String(session?.metadata?.user_id || session?.client_reference_id || '').trim();
    tier = normalizeTier(String(session?.metadata?.tier || ''));
    stripeCustomerId = String(session?.customer || '').trim();
    stripeSubscriptionId = String(session?.subscription || '').trim();
  } else if (type === 'invoice.paid' || type === 'invoice.payment_succeeded') {
    const invoice = event?.data?.object;
    userId = String(invoice?.subscription_details?.metadata?.user_id || invoice?.metadata?.user_id || '').trim();
    tier = normalizeTier(String(invoice?.subscription_details?.metadata?.tier || invoice?.metadata?.tier || ''));
    stripeCustomerId = String(invoice?.customer || '').trim();
    stripeSubscriptionId = String(invoice?.subscription || '').trim();
  
    // If Stripe doesn't include subscription metadata on invoice events (can happen), fetch subscription.
    if ((!userId || !tier) && invoice?.subscription && env.STRIPE_SECRET_KEY) {
      const subId = String(invoice.subscription || '').trim();
      if (subId) {
        const meta = await fetchStripeSubscriptionMetadata(env.STRIPE_SECRET_KEY, subId);
        if (meta) {
          userId = meta.userId;
          tier = meta.tier;
        }
      }
    }

    // Tier from subscription metadata can be stale when we use Subscription Schedules (downgrade next cycle).
    // Always attempt to infer the tier from invoice line items and override metadata when inference succeeds.
    const lines = invoice?.lines?.data;
    const firstLine = Array.isArray(lines) && lines.length ? lines[0] : null;
    const priceId = String(firstLine?.price?.id || '').trim();
    const productId = String(firstLine?.price?.product || '').trim();
    const byPrice = await getTierFromCatalogId(env, priceId);
    const byProduct = byPrice ? null : await getTierFromCatalogId(env, productId);
    const inferred = byPrice || byProduct;
    if (inferred) {
      if (tier && tier !== inferred) {
        console.log('stripe webhook tier overridden by invoice inference', { previous: tier, inferred });
      }
      tier = inferred;
    }
  } else if (type === 'invoice.payment_failed') {
    const invoice = event?.data?.object;
    stripeCustomerId = String(invoice?.customer || '').trim();
    stripeSubscriptionId = String(invoice?.subscription || '').trim();
    stripeSubscriptionStatus = 'past_due';

    if (stripeSubscriptionId && env.STRIPE_SECRET_KEY) {
      try {
        const subRes = await fetchStripeSubscriptionMetadata(env.STRIPE_SECRET_KEY, stripeSubscriptionId);
        if (subRes?.userId) {
          userId = subRes.userId;
        }
      } catch {
        // ignore
      }
    }

    if (userId) {
      const stripePatch: Record<string, any> = {};
      if (stripeCustomerId) stripePatch.stripe_customer_id = stripeCustomerId;
      if (stripeSubscriptionId) stripePatch.stripe_subscription_id = stripeSubscriptionId;
      if (stripeSubscriptionStatus) stripePatch.stripe_subscription_status = stripeSubscriptionStatus;
      if (Object.keys(stripePatch).length) {
        await bestEffortPatchStripeFields(env, userId, stripePatch);
      }
    }

    return new Response('ok', { status: 200 });
  } else if (type === 'customer.subscription.deleted') {
    const sub = event?.data?.object;
    userId = String(sub?.metadata?.user_id || '').trim();
    tier = 'UNSUBSCRIBED';
    stripeCustomerId = String(sub?.customer || '').trim();
    stripeSubscriptionId = String(sub?.id || '').trim();
    stripeSubscriptionStatus = String(sub?.status || '').trim();
    stripeCurrentPeriodEnd = Number(sub?.current_period_end ?? NaN);
    stripeCancelAtPeriodEnd = typeof sub?.cancel_at_period_end === 'boolean' ? sub.cancel_at_period_end : null;
  } else if (type === 'customer.subscription.updated') {
    const sub = event?.data?.object;
    await bestEffortPatchPendingFromSubscription(env, sub);

    // Also keep stripe fields fresh
    const uid = String(sub?.metadata?.user_id || '').trim();
    if (uid) {
      const stripePatch: Record<string, any> = {
        stripe_subscription_id: String(sub?.id || '').trim() || null,
        stripe_customer_id: String(sub?.customer || '').trim() || null,
        stripe_subscription_status: String(sub?.status || '').trim() || null,
        stripe_cancel_at_period_end: typeof sub?.cancel_at_period_end === 'boolean' ? sub.cancel_at_period_end : null
      };
      const cpe = Number(sub?.current_period_end ?? NaN);
      if (Number.isFinite(cpe)) stripePatch.stripe_current_period_end = cpe;
      await bestEffortPatchStripeFields(env, uid, stripePatch);
    }

    return new Response('ok', { status: 200 });
  } else {
    // Ignore other events
    return new Response('ok', { status: 200 });
  }

  if (!userId || !tier) {
    console.log('stripe webhook missing metadata', { type, userId, tier });
    return new Response('Missing metadata', { status: 200 });
  }

  const update = await updateTierWithServiceRole(env, userId, tier);
  if (!update.ok) {
    console.log('stripe webhook tier update failed', update.error);
    return new Response(`Failed to update tier: ${update.error || 'unknown'}`, { status: 500 });
  }

  const stripePatch: Record<string, any> = {};
  if (stripeCustomerId) stripePatch.stripe_customer_id = stripeCustomerId;
  if (stripeSubscriptionId) stripePatch.stripe_subscription_id = stripeSubscriptionId;
  if (stripeSubscriptionStatus) stripePatch.stripe_subscription_status = stripeSubscriptionStatus;
  if (Number.isFinite(stripeCurrentPeriodEnd as number)) stripePatch.stripe_current_period_end = stripeCurrentPeriodEnd;
  if (stripeCancelAtPeriodEnd !== null) stripePatch.stripe_cancel_at_period_end = stripeCancelAtPeriodEnd;
  stripePatch.pending_tier = null;
  stripePatch.tier_effective_at = null;
  if (Object.keys(stripePatch).length) {
    await bestEffortPatchStripeFields(env, userId, stripePatch);
  }

  console.log('stripe webhook tier updated', { userId, tier });
  return new Response('ok', { status: 200 });
};
