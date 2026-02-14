import type { Env } from '../../../_utils';

const normalizeTier = (t: string) => {
  const v = String(t || '').trim().toUpperCase();
  if (v === 'STARTER' || v === 'PRO' || v === 'MERCHANT' || v === 'ENTERPRISE') return v;
  return null;
};

const getTierFromPriceProduct = (productName: string): string | null => {
  const name = String(productName || '').toLowerCase();
  if (name.includes('enterprise')) return 'ENTERPRISE';
  if (name.includes('merchant')) return 'MERCHANT';
  if (name.includes('pro')) return 'PRO';
  if (name.includes('starter')) return 'STARTER';
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

const getListingLimit = (tier: string): number => {
  switch (tier) {
    case 'UNSUBSCRIBED': return 0;
    case 'STARTER': return 3;
    case 'PRO': return 10;
    case 'MERCHANT': return 25;
    case 'ENTERPRISE': return 80;
    default: return 0;
  }
};

// Pause excess listings when tier is downgraded
const pauseExcessListings = async (env: Env, userId: string, newTier: string) => {
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return;

  const limit = getListingLimit(newTier);
  
  // Get active listings for this user, ordered by creation date (newest first)
  const res = await fetch(
    `${supabaseUrl.replace(/\/$/, '')}/rest/v1/listings?seller_id=eq.${encodeURIComponent(userId)}&is_sold=eq.false&is_hidden=eq.false&is_paused=eq.false&active_until=gte.${encodeURIComponent(new Date().toISOString())}&order=created_at.desc&select=*`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: 'application/json'
      }
    }
  );

  if (!res.ok) {
    console.log('Failed to fetch listings for pause check', res.status);
    return;
  }

  const listings = (await res.json().catch(() => [])) as any[];
  
  // If listings exceed limit, pause the excess ones
  if (listings.length > limit) {
    const listingsToPause = listings.slice(limit); // Keep newest, pause oldest
    
    for (const listing of listingsToPause) {
      const pauseRes = await fetch(
        `${supabaseUrl.replace(/\/$/, '')}/rest/v1/listings?id=eq.${encodeURIComponent(listing.id)}`,
        {
          method: 'PATCH',
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal'
          },
          body: JSON.stringify({ is_paused: true, updated_at: new Date().toISOString() })
        }
      );
      
      if (!pauseRes.ok) {
        console.log('Failed to pause listing', listing.id, pauseRes.status);
      } else {
        console.log('Paused listing due to tier downgrade', listing.id, listing.title);
      }
    }
    
    console.log(`Paused ${listingsToPause.length} listings due to tier downgrade to ${newTier}`);
  }
};

// Resume paused listings when tier is upgraded
const resumePausedListings = async (env: Env, userId: string, newTier: string) => {
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return;

  const limit = getListingLimit(newTier);
  
  // Get paused listings for this user
  const res = await fetch(
    `${supabaseUrl.replace(/\/$/, '')}/rest/v1/listings?seller_id=eq.${encodeURIComponent(userId)}&is_paused=eq.true&order=created_at.desc&select=*`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: 'application/json'
      }
    }
  );

  if (!res.ok) {
    console.log('Failed to fetch paused listings', res.status);
    return;
  }

  const pausedListings = (await res.json().catch(() => [])) as any[];
  
  // Get current active (non-paused) count
  const activeRes = await fetch(
    `${supabaseUrl.replace(/\/$/, '')}/rest/v1/listings?seller_id=eq.${encodeURIComponent(userId)}&is_sold=eq.false&is_hidden=eq.false&is_paused=eq.false&active_until=gte.${encodeURIComponent(new Date().toISOString())}&select=id`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: 'application/json'
      }
    }
  );
  
  const activeListings = activeRes.ok ? (await activeRes.json().catch(() => [])) : [];
  const currentActiveCount = activeListings.length;
  const availableSlots = limit - currentActiveCount;
  
  // Resume up to available slots
  const listingsToResume = pausedListings.slice(0, availableSlots);
  
  for (const listing of listingsToResume) {
    const resumeRes = await fetch(
      `${supabaseUrl.replace(/\/$/, '')}/rest/v1/listings?id=eq.${encodeURIComponent(listing.id)}`,
      {
        method: 'PATCH',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({ is_paused: false, updated_at: new Date().toISOString() })
      }
    );
    
    if (!resumeRes.ok) {
      console.log('Failed to resume listing', listing.id, resumeRes.status);
    } else {
      console.log('Resumed listing due to tier upgrade', listing.id, listing.title);
    }
  }
  
  if (listingsToResume.length > 0) {
    console.log(`Resumed ${listingsToResume.length} listings due to tier upgrade to ${newTier}`);
  }
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
    
    // Extract tier from product name
    const productName = firstItem?.price?.product?.name || '';
    const inferredTier = getTierFromPriceProduct(productName);
    
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
    
    // Update tier if it has changed and subscription is active
    let tierChanged = false;
    if (inferredTier && inferredTier !== profile?.tier && ['active', 'trialing'].includes(status)) {
      patch.tier = inferredTier;
      tierChanged = true;
      // Clear any pending tier since we're setting the actual tier
      if (profile?.pending_tier) {
        patch.pending_tier = null;
        patch.tier_effective_at = null;
      }
    }
    
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
    
    // Handle listing pause/resume on tier change
    if (tierChanged && inferredTier) {
      const oldTier = profile?.tier || 'UNSUBSCRIBED';
      const newTier = inferredTier;
      const oldLimit = getListingLimit(oldTier);
      const newLimit = getListingLimit(newTier);
      
      if (newLimit < oldLimit) {
        // Downgrade: pause excess listings
        await pauseExcessListings(env, userId, newTier);
      } else if (newLimit > oldLimit) {
        // Upgrade: resume paused listings
        await resumePausedListings(env, userId, newTier);
      }
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
