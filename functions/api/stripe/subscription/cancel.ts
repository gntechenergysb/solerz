import type { Env } from '../../../_utils';

type CancelRequest = {
  atPeriodEnd?: boolean;
};

type StripeCatalogProductIds = Partial<
  Record<'STARTER' | 'PRO' | 'MERCHANT' | 'ENTERPRISE', Partial<Record<'monthly' | 'yearly', string>>>
>;

const normalizeTier = (t: string) => {
  const v = String(t || '').trim().toUpperCase();
  if (v === 'STARTER' || v === 'PRO' || v === 'MERCHANT' || v === 'ENTERPRISE') return v;
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
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() })
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || res.statusText);
  }
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

  const body = (await request.json().catch(() => null)) as CancelRequest | null;
  const atPeriodEnd = body?.atPeriodEnd !== false;

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
    const currentPeriodEnd = Number(sub?.current_period_end || 0);
    
    // Extract billing interval from subscription
    const items = sub?.items?.data || [];
    const firstItem = items[0];
    const billingInterval = firstItem?.price?.recurring?.interval || 'month';

    await releaseScheduleIfAny(env, scheduleId);

    if (atPeriodEnd) {
      const params = new URLSearchParams();
      params.set('cancel_at_period_end', 'true');
      params.set('proration_behavior', 'none');

      await stripeRequest(env, `/v1/subscriptions/${encodeURIComponent(subscriptionId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      await supabaseServicePatchProfile(env, userId, {
        pending_tier: 'UNSUBSCRIBED',
        tier_effective_at: currentPeriodEnd || null,
        stripe_cancel_at_period_end: true,
        stripe_subscription_id: subscriptionId,
        stripe_billing_interval: billingInterval,
        ...(customerId ? { stripe_customer_id: customerId } : {})
      });

      return new Response(JSON.stringify({
        mode: 'cancel_scheduled',
        subscriptionId,
        effectiveAt: currentPeriodEnd || null
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Immediate cancel (not recommended)
    await stripeRequest(env, `/v1/subscriptions/${encodeURIComponent(subscriptionId)}`, { method: 'DELETE' });

    await supabaseServicePatchProfile(env, userId, {
      tier: 'UNSUBSCRIBED',
      pending_tier: null,
      tier_effective_at: null,
      stripe_cancel_at_period_end: false,
      stripe_subscription_id: subscriptionId,
      stripe_billing_interval: billingInterval,
      ...(customerId ? { stripe_customer_id: customerId } : {})
    });

    return new Response(JSON.stringify({ mode: 'canceled_immediately', subscriptionId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    const msg = String(e?.message || e);
    const status = Number((e as any)?.status || 500);
    return new Response(JSON.stringify({ error: msg || 'cancel_failed' }), {
      status: status >= 400 && status < 600 ? status : 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
