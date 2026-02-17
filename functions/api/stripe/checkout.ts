import type { Env } from '../../_utils';
import { getOrigin } from '../../_utils';

type CheckoutRequest = {
  planId: string;
  billingCycle: 'monthly' | 'yearly';
};

type StripeCatalogProductIds = Partial<
  Record<'STARTER' | 'PRO' | 'ELITE' | 'ENTERPRISE', Partial<Record<'monthly' | 'yearly', string>>>
>;

const DEFAULT_STRIPE_CATALOG_IDS: StripeCatalogProductIds = {
  STARTER: { monthly: 'price_1T0elRAEbTWGL4T05z2wcOXW', yearly: 'price_1T0em9AEbTWGL4T0ZyhhLU1P' },
  PRO: { monthly: 'price_1T0enHAEbTWGL4T0Mbvhwiho', yearly: 'price_1T0ennAEbTWGL4T0Dfs6JlmN' },
  ELITE: { monthly: 'price_1T0eoRAEbTWGL4T0qsynUwGm', yearly: 'price_1T0er5AEbTWGL4T0hKoOVsjN' },
  ENTERPRISE: { monthly: 'price_1T0etMAEbTWGL4T0C14VVNLk', yearly: 'price_1T0etmAEbTWGL4T0j1Chp7ri' }
};

const normalizeTier = (planId: string) => {
  const t = String(planId || '').trim().toUpperCase();
  if (t === 'STARTER' || t === 'PRO' || t === 'ELITE' || t === 'ENTERPRISE') return t;
  return null;
};

const parseBearer = (request: Request) => {
  const h = request.headers.get('Authorization') || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() || null;
};

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const origin = getOrigin(request);
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
  const stripeSecretKey = env.STRIPE_SECRET_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(JSON.stringify({ error: 'Missing Supabase env vars' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  if (!stripeSecretKey) {
    return new Response(JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const token = parseBearer(request);
  if (!token) {
    return new Response(JSON.stringify({ error: 'Missing auth token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const body = (await request.json().catch(() => null)) as CheckoutRequest | null;
  const tier = normalizeTier(body?.planId || '');
  const billingCycle = body?.billingCycle === 'yearly' ? 'yearly' : 'monthly';

  if (!tier) {
    return new Response(JSON.stringify({ error: 'Invalid plan' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const userRes = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token}`
    }
  });

  if (!userRes.ok) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const userJson = (await userRes.json().catch(() => null)) as any;
  const userId = String(userJson?.id || '').trim();
  const email = String(userJson?.email || '').trim();
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const amountMapMyr: Record<string, { monthly: number; yearly: number }> = {
    STARTER: { monthly: 39, yearly: 428 },
    PRO: { monthly: 99, yearly: 1088 },
    MERCHANT: { monthly: 199, yearly: 2188 },
    ENTERPRISE: { monthly: 499, yearly: 5488 }
  };

  const planAmounts = amountMapMyr[tier];
  const myrAmount = billingCycle === 'monthly' ? planAmounts.monthly : planAmounts.yearly;
  const unitAmount = Math.round(myrAmount * 100);

  let catalogId: string | null = null;
  if (env.STRIPE_CATALOG_PRODUCT_IDS_JSON) {
    try {
      const parsed = JSON.parse(env.STRIPE_CATALOG_PRODUCT_IDS_JSON) as StripeCatalogProductIds;
      const maybe = parsed?.[tier as keyof StripeCatalogProductIds]?.[billingCycle];
      const v = String(maybe || '').trim();
      if (v) catalogId = v;
    } catch {
      catalogId = null;
    }
  }
  if (!catalogId) {
    const maybe = DEFAULT_STRIPE_CATALOG_IDS?.[tier as keyof StripeCatalogProductIds]?.[billingCycle];
    const v = String(maybe || '').trim();
    if (v) catalogId = v;
  }

  const isSubscription = true;
  const sessionParams = new URLSearchParams();

  sessionParams.set('mode', isSubscription ? 'subscription' : 'payment');
  sessionParams.set('success_url', `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`);
  sessionParams.set('cancel_url', `${origin}/pricing?payment=canceled`);

  sessionParams.set('client_reference_id', userId);
  sessionParams.set('metadata[user_id]', userId);
  sessionParams.set('metadata[tier]', tier);
  sessionParams.set('metadata[billing_cycle]', billingCycle);

  if (email) sessionParams.set('customer_email', email);

  sessionParams.set('line_items[0][quantity]', '1');

  const usingPriceId = !!(catalogId && catalogId.startsWith('price_'));

  if (usingPriceId && catalogId) {
    sessionParams.set('line_items[0][price]', catalogId);
  } else {
    sessionParams.set('line_items[0][price_data][currency]', 'myr');
    sessionParams.set('line_items[0][price_data][unit_amount]', String(unitAmount));
    if (catalogId && catalogId.startsWith('prod_')) {
      sessionParams.set('line_items[0][price_data][product]', catalogId);
    } else {
      sessionParams.set('line_items[0][price_data][product_data][name]', `Solerz ${tier} (${billingCycle})`);
    }
  }

  if (isSubscription) {
    const interval = billingCycle === 'yearly' ? 'year' : 'month';
    if (!usingPriceId) {
      sessionParams.set('line_items[0][price_data][recurring][interval]', interval);
    }
    sessionParams.set('subscription_data[metadata][user_id]', userId);
    sessionParams.set('subscription_data[metadata][tier]', tier);
    sessionParams.set('subscription_data[metadata][billing_cycle]', billingCycle);
  }

  const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: sessionParams.toString()
  });

  const stripeText = await stripeRes.text().catch(() => '');
  if (!stripeRes.ok) {
    return new Response(JSON.stringify({ error: stripeText || 'Stripe error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const stripeJson = JSON.parse(stripeText || '{}') as any;
  const url = String(stripeJson?.url || '').trim();
  if (!url) {
    return new Response(JSON.stringify({ error: 'Missing Stripe checkout url' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ url }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
