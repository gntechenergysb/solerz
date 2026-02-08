import type { Env } from '../../../_utils';

type ChangeRequest = {
  planId: string;
  billingCycle: 'monthly' | 'yearly';
};

type StripeCatalogProductIds = Partial<
  Record<'STARTER' | 'PRO' | 'MERCHANT' | 'ENTERPRISE', Partial<Record<'monthly' | 'yearly', string>>>
>;

const DEFAULT_STRIPE_CATALOG_IDS: StripeCatalogProductIds = {
  STARTER: { monthly: 'price_1SxscwAEbTWGL4T0h3tf72Yb', yearly: 'price_1SxsceAEbTWGL4T0lPMjcbso' },
  PRO: { monthly: 'price_1SxIVLAEbTWGL4T0zRcmfquj', yearly: 'price_1SxIVoAEbTWGL4T0eEuOEfde' },
  MERCHANT: { monthly: 'price_1SxIW8AEbTWGL4T0AnrsvXOV', yearly: 'price_1SxIWqAEbTWGL4T0hXqilGER' },
  ENTERPRISE: { monthly: 'price_1SxIXMAEbTWGL4T0sqlzkmb5', yearly: 'price_1SxIXcAEbTWGL4T0Fxf36hwn' }
};

const normalizeTier = (planId: string) => {
  const t = String(planId || '').trim().toUpperCase();
  if (t === 'STARTER' || t === 'PRO' || t === 'MERCHANT' || t === 'ENTERPRISE') return t;
  return null;
};

const parseBearer = (request: Request) => {
  const h = request.headers.get('Authorization') || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() || null;
};

const stripeRequest = async (env: Env, path: string, init?: RequestInit) => {
  if (!env.STRIPE_SECRET_KEY) throw new Error('missing_STRIPE_SECRET_KEY');
  const res = await fetch(`https://api.stripe.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      ...(init?.headers || {})
    }
  });
  const text = await res.text().catch(() => '');
  if (!res.ok) {
    const err = new Error(text || res.statusText);
    (err as any).status = res.status;
    throw err;
  }
  return JSON.parse(text || '{}') as any;
};

const supabaseServicePatchProfile = async (
  env: Env,
  userId: string,
  patch: Record<string, any>
) => {
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error('missing_supabase_service_env');

  const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`,
    {
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() })
    }
  );

  const text = await res.text().catch(() => '');
  if (!res.ok) throw new Error(text || res.statusText);
  const json = JSON.parse(text || '[]') as any;
  return Array.isArray(json) && json.length ? json[0] : null;
};

const supabaseServiceGetProfile = async (env: Env, userId: string) => {
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error('missing_supabase_service_env');

  const res = await fetch(
    `${supabaseUrl.replace(/\/$/, '')}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=*&limit=1`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: 'application/json'
      }
    }
  );

  const text = await res.text().catch(() => '');
  if (!res.ok) throw new Error(text || res.statusText);
  const json = JSON.parse(text || '[]') as any;
  return Array.isArray(json) && json.length ? json[0] : null;
};

const getCatalogId = (env: Env, tier: string, billingCycle: 'monthly' | 'yearly') => {
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
  return catalogId;
};

const getUnitAmount = (tier: string, billingCycle: 'monthly' | 'yearly') => {
  const amountMapMyr: Record<string, { monthly: number; yearly: number }> = {
    STARTER: { monthly: 29, yearly: 290 },
    PRO: { monthly: 199, yearly: 1990 },
    MERCHANT: { monthly: 399, yearly: 3990 },
    ENTERPRISE: { monthly: 1199, yearly: 11990 }
  };
  const planAmounts = amountMapMyr[tier];
  const myrAmount = billingCycle === 'monthly' ? planAmounts.monthly : planAmounts.yearly;
  return Math.round(myrAmount * 100);
};

const tierRank = (tier: string) => {
  const map: Record<string, number> = {
    STARTER: 1,
    PRO: 2,
    MERCHANT: 3,
    ENTERPRISE: 4
  };
  return map[String(tier || '').trim().toUpperCase()] || 0;
};

const buildPriceParams = (env: Env, tier: string, billingCycle: 'monthly' | 'yearly', prefix: string) => {
  const unitAmount = getUnitAmount(tier, billingCycle);
  const interval = billingCycle === 'yearly' ? 'year' : 'month';
  const catalogId = getCatalogId(env, tier, billingCycle);

  const params = new URLSearchParams();

  if (catalogId && catalogId.startsWith('price_')) {
    params.set(`${prefix}[price]`, catalogId);
    return params;
  }

  params.set(`${prefix}[price_data][currency]`, 'myr');
  params.set(`${prefix}[price_data][unit_amount]`, String(unitAmount));
  params.set(`${prefix}[price_data][recurring][interval]`, interval);
  if (catalogId && catalogId.startsWith('prod_')) {
    params.set(`${prefix}[price_data][product]`, catalogId);
  } else {
    params.set(`${prefix}[price_data][product_data][name]`, `Solerz ${tier} (${billingCycle})`);
  }

  return params;
};

const releaseScheduleIfAny = async (env: Env, scheduleId: string | null) => {
  const id = String(scheduleId || '').trim();
  if (!id) return;
  try {
    await stripeRequest(env, `/v1/subscription_schedules/${encodeURIComponent(id)}/release`, { method: 'POST' });
  } catch {
    return;
  }
};

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(JSON.stringify({ error: 'Missing Supabase env vars' }), {
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

  const body = (await request.json().catch(() => null)) as ChangeRequest | null;
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

  try {
    const profile = await supabaseServiceGetProfile(env, userId);

    let subscriptionId = String(profile?.stripe_subscription_id || '').trim();
    let customerId = String(profile?.stripe_customer_id || '').trim();

    if (!customerId && email) {
      const query = `email:'${email.replace(/'/g, "\\'")}'`;
      const search = await stripeRequest(env, `/v1/customers/search?query=${encodeURIComponent(query)}&limit=1`);
      customerId = String(search?.data?.[0]?.id || '').trim();
    }

    if (!subscriptionId && customerId) {
      const subs = await stripeRequest(env, `/v1/subscriptions?customer=${encodeURIComponent(customerId)}&status=all&limit=10`);
      const arr = Array.isArray(subs?.data) ? subs.data : [];
      const preferred = arr.find((s: any) => ['active', 'trialing', 'past_due', 'unpaid'].includes(String(s?.status || '')));
      subscriptionId = String(preferred?.id || '').trim();
    }

    if (!subscriptionId) {
      return new Response(JSON.stringify({ error: 'No active subscription found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const sub = await stripeRequest(env, `/v1/subscriptions/${encodeURIComponent(subscriptionId)}?expand[]=items.data.price`);
    const scheduleId = String(sub?.schedule || '').trim() || null;

    const currentItem = Array.isArray(sub?.items?.data) && sub.items.data.length ? sub.items.data[0] : null;
    const itemId = String(currentItem?.id || '').trim();
    const currentPrice = currentItem?.price;
    const currentPeriodEnd = Number(sub?.current_period_end || 0);

    if (!itemId || !currentPrice || !currentPeriodEnd) {
      return new Response(JSON.stringify({ error: 'Invalid subscription state.' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const currentTier = normalizeTier(String(profile?.tier || ''));
    const isUpgrade = tierRank(tier) >= tierRank(currentTier || '');

    if (isUpgrade) {
      await releaseScheduleIfAny(env, scheduleId);

      const updateParams = new URLSearchParams();
      updateParams.set('cancel_at_period_end', 'false');
      updateParams.set('proration_behavior', 'create_prorations');
      // 同周期升级才设置 billing_cycle_anchor，跨周期改变 interval 时不设置
      const isSameInterval = currentPrice?.recurring?.interval === (billingCycle === 'yearly' ? 'year' : 'month');
      if (isSameInterval) {
        updateParams.set('billing_cycle_anchor', 'unchanged');
      }
      updateParams.set('items[0][id]', itemId);

      const priceParams = buildPriceParams(env, tier, billingCycle, 'items[0]');
      priceParams.forEach((v, k) => updateParams.set(k, v));

      await stripeRequest(env, `/v1/subscriptions/${encodeURIComponent(subscriptionId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: updateParams.toString()
      });

      await supabaseServicePatchProfile(env, userId, {
        tier,
        pending_tier: null,
        tier_effective_at: null,
        stripe_cancel_at_period_end: false,
        stripe_subscription_id: subscriptionId,
        stripe_billing_interval: billingCycle === 'yearly' ? 'year' : 'month',
        ...(customerId ? { stripe_customer_id: customerId } : {})
      });

      return new Response(JSON.stringify({
        mode: 'upgrade',
        subscriptionId
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let finalScheduleId = scheduleId;
    if (!finalScheduleId) {
      const created = await stripeRequest(env, `/v1/subscription_schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ from_subscription: subscriptionId }).toString()
      });
      finalScheduleId = String(created?.id || '').trim() || null;
    }

    if (!finalScheduleId) {
      return new Response(JSON.stringify({ error: 'Failed to create subscription schedule.' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const scheduleParams = new URLSearchParams();
    scheduleParams.set('end_behavior', 'release');

    scheduleParams.set('phases[0][start_date]', 'now');
    scheduleParams.set('phases[0][end_date]', String(currentPeriodEnd));
    scheduleParams.set('phases[0][items][0][price]', String(currentPrice?.id || ''));
    scheduleParams.set('phases[0][items][0][quantity]', '1');

    scheduleParams.set('phases[1][start_date]', String(currentPeriodEnd));
    scheduleParams.set('phases[1][items][0][quantity]', '1');

    const phase1PriceParams = buildPriceParams(env, tier, billingCycle, 'phases[1][items][0]');
    phase1PriceParams.forEach((v, k) => scheduleParams.set(k, v));

    await stripeRequest(env, `/v1/subscription_schedules/${encodeURIComponent(finalScheduleId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: scheduleParams.toString()
    });

    await supabaseServicePatchProfile(env, userId, {
      pending_tier: tier,
      tier_effective_at: currentPeriodEnd,
      stripe_cancel_at_period_end: false,
      stripe_subscription_id: subscriptionId,
      stripe_billing_interval: billingCycle === 'yearly' ? 'year' : 'month',
      ...(customerId ? { stripe_customer_id: customerId } : {})
    });

    return new Response(JSON.stringify({
      mode: 'downgrade_scheduled',
      subscriptionId,
      effectiveAt: currentPeriodEnd,
      pendingTier: tier
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    const msg = String(e?.message || e);
    const status = Number((e as any)?.status || 500);
    return new Response(JSON.stringify({ error: msg || 'change_failed' }), {
      status: status >= 400 && status < 600 ? status : 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
