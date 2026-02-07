import type { Env } from '../../../_utils';

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

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

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

  // Verify user token
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
    // Get current profile from Supabase
    const profile = await supabaseServiceGetProfile(env, userId);
    
    let subscriptionId = String(profile?.stripe_subscription_id || '').trim();
    let customerId = String(profile?.stripe_customer_id || '').trim();

    // If no customerId, try to find by email
    if (!customerId && email) {
      const query = `email:'${email.replace(/'/g, "\\'")}'`;
      const search = await stripeRequest(env, `/v1/customers/search?query=${encodeURIComponent(query)}&limit=1`);
      customerId = String(search?.data?.[0]?.id || '').trim();
    }

    // If no subscriptionId but have customerId, find active subscription
    if (!subscriptionId && customerId) {
      const subs = await stripeRequest(env, `/v1/subscriptions?customer=${encodeURIComponent(customerId)}&status=all&limit=10`);
      const arr = Array.isArray(subs?.data) ? subs.data : [];
      const preferred = arr.find((s: any) => ['active', 'trialing', 'past_due', 'unpaid'].includes(String(s?.status || '')));
      subscriptionId = String(preferred?.id || '').trim();
    }

    // No subscription found - return profile as-is
    if (!subscriptionId) {
      return new Response(JSON.stringify({
        subscription: null,
        profile: profile
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch real-time subscription data from Stripe
    const sub = await stripeRequest(
      env, 
      `/v1/subscriptions/${encodeURIComponent(subscriptionId)}?expand[]=items.data.price.product`
    );

    // Extract billing interval from the subscription
    const items = sub?.items?.data || [];
    const firstItem = items[0];
    const recurring = firstItem?.price?.recurring;
    const billingInterval = recurring?.interval || null; // 'month' or 'year'
    
    // Extract other subscription data
    const currentPeriodEnd = Number(sub?.current_period_end || 0);
    const cancelAtPeriodEnd = sub?.cancel_at_period_end || false;
    const status = String(sub?.status || '');
    
    // Check for pending changes (schedule)
    let pendingTier = profile?.pending_tier || null;
    let tierEffectiveAt = profile?.tier_effective_at || null;
    
    // If cancel_at_period_end is true but pending_tier is not set, set it
    if (cancelAtPeriodEnd && !pendingTier) {
      pendingTier = 'UNSUBSCRIBED';
      tierEffectiveAt = currentPeriodEnd;
    }
    
    // Sync back to Supabase if data has changed
    const patch: Record<string, any> = {};
    if (Number.isFinite(currentPeriodEnd) && currentPeriodEnd !== profile?.stripe_current_period_end) {
      patch.stripe_current_period_end = currentPeriodEnd;
    }
    if (billingInterval && billingInterval !== profile?.stripe_billing_interval) {
      patch.stripe_billing_interval = billingInterval;
    }
    if (cancelAtPeriodEnd !== profile?.stripe_cancel_at_period_end) {
      patch.stripe_cancel_at_period_end = cancelAtPeriodEnd;
    }
    if (status && status !== profile?.stripe_subscription_status) {
      patch.stripe_subscription_status = status;
    }
    if (customerId && customerId !== profile?.stripe_customer_id) {
      patch.stripe_customer_id = customerId;
    }
    if (subscriptionId && subscriptionId !== profile?.stripe_subscription_id) {
      patch.stripe_subscription_id = subscriptionId;
    }
    if (pendingTier && pendingTier !== profile?.pending_tier) {
      patch.pending_tier = pendingTier;
    }
    if (tierEffectiveAt && tierEffectiveAt !== profile?.tier_effective_at) {
      patch.tier_effective_at = tierEffectiveAt;
    }

    let updatedProfile = profile;
    if (Object.keys(patch).length > 0) {
      updatedProfile = await supabaseServicePatchProfile(env, userId, patch);
    }

    return new Response(JSON.stringify({
      subscription: {
        id: subscriptionId,
        status,
        current_period_end: currentPeriodEnd,
        cancel_at_period_end: cancelAtPeriodEnd,
        billing_interval: billingInterval,
        items: items.map((item: any) => ({
          id: item.id,
          price_id: item.price?.id,
          product_id: item.price?.product?.id,
          product_name: item.price?.product?.name,
          unit_amount: item.price?.unit_amount,
          currency: item.price?.currency,
          interval: item.price?.recurring?.interval
        }))
      },
      profile: updatedProfile || profile,
      pending_tier: pendingTier,
      tier_effective_at: tierEffectiveAt
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (e: any) {
    const msg = String(e?.message || e);
    const status = Number((e as any)?.status || 500);
    return new Response(JSON.stringify({ error: msg }), {
      status: status >= 400 && status < 600 ? status : 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
