import type { Env } from '../../_utils';
import { getOrigin } from '../../_utils';

type CheckoutRequest = {
  planId: string;
  billingCycle: 'monthly' | 'yearly';
};

type StripeCatalogProductIds = Partial<
  Record<'STARTER' | 'PRO' | 'ELITE' | 'ENTERPRISE', Partial<Record<'monthly' | 'yearly', string>>>
>;

const DEFAULT_STRIPE_CATALOG_IDS: Record<string, { monthly: string; yearly: string }> = {
  STARTER: { monthly: 'price_1T79qU3k3Z28WqJK4o1U7nQN', yearly: 'price_1T4BtJ3k3Z28WqJKqhbXBvex' },
  PRO: { monthly: 'price_1T5GBu3k3Z28WqJKdaRJnAsE', yearly: 'price_1T4BtQ3k3Z28WqJKA34RjNpe' },
  ELITE: { monthly: 'price_1T4BtS3k3Z28WqJK59BkDgNI', yearly: 'price_1T4BtS3k3Z28WqJKJwLzoags' },
  ENTERPRISE: { monthly: 'price_1T4BtV3k3Z28WqJK3QYvTdHr', yearly: 'price_1T4BtV3k3Z28WqJKdOmXM9Zt' }
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

  // Fetch the existing profile to check for a stripe_customer_id
  let stripeCustomerId = '';
  try {
    const profileRes = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=stripe_customer_id&limit=1`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    if (profileRes.ok) {
      const profileJson = await profileRes.json().catch(() => []) as any[];
      if (profileJson.length > 0 && profileJson[0].stripe_customer_id) {
        stripeCustomerId = String(profileJson[0].stripe_customer_id).trim();
      }
    }
  } catch (e) {
    console.log('Failed to fetch profile for stripe_customer_id in checkout', e);
  }

  const amountMapUsd: Record<string, { monthly: number; yearly: number }> = {
    STARTER: { monthly: 9, yearly: 99 },
    PRO: { monthly: 29, yearly: 319 },
    ELITE: { monthly: 49, yearly: 539 },
    ENTERPRISE: { monthly: 129, yearly: 1419 }
  };

  const planAmounts = amountMapUsd[tier];
  const usdAmount = billingCycle === 'monthly' ? planAmounts.monthly : planAmounts.yearly;
  const unitAmount = Math.round(usdAmount * 100);

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

  sessionParams.set('payment_method_types[0]', 'card');
  sessionParams.set('mode', 'subscription');
  sessionParams.set('success_url', `${origin}/dashboard?checkout_success=true&session_id={CHECKOUT_SESSION_ID}`);
  sessionParams.set('cancel_url', `${origin}/pricing?checkout_canceled=true`);

  if (stripeCustomerId) {
    sessionParams.set('customer', stripeCustomerId);
    sessionParams.set('customer_update[address]', 'auto');
  } else {
    sessionParams.set('customer_email', email);
  }

  sessionParams.set('line_items[0][quantity]', '1');

  const usingPriceId = !!(catalogId && catalogId.startsWith('price_'));

  if (usingPriceId && catalogId) {
    sessionParams.set('line_items[0][price]', catalogId);
  } else {
    sessionParams.set('line_items[0][price_data][currency]', 'usd');
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
