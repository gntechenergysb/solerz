import type { Env } from '../../_utils';
import { getOrigin } from '../../_utils';

type PortalRequest = {
  returnPath?: string;
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

  const body = (await request.json().catch(() => null)) as PortalRequest | null;
  const returnUrl = `${origin}${String(body?.returnPath || '/dashboard')}`;

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
  if (!email || !userId) {
    return new Response(JSON.stringify({ error: 'Missing user details' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // First try to find existing customer by email
  let customerId: string | null = null;
  const query = `email:'${email.replace(/'/g, "\\'")}'`;
  const searchRes = await fetch(`https://api.stripe.com/v1/customers/search?query=${encodeURIComponent(query)}&limit=1`, {
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`
    }
  });

  if (searchRes.ok) {
    const searchJson = JSON.parse(await searchRes.text().catch(() => '{}')) as any;
    customerId = String(searchJson?.data?.[0]?.id || '').trim() || null;
  }

  // If no customer found, create one on-demand
  if (!customerId) {
    const createRes = await fetch('https://api.stripe.com/v1/customers', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        email,
        metadata: JSON.stringify({ user_id: userId })
      }).toString()
    });

    if (!createRes.ok) {
      const errText = await createRes.text().catch(() => '');
      return new Response(JSON.stringify({ error: errText || 'Failed to create customer' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const createJson = JSON.parse(await createRes.text().catch(() => '{}')) as any;
    customerId = String(createJson?.id || '').trim();
  }

  if (!customerId) {
    return new Response(JSON.stringify({ error: 'Could not find or create Stripe customer' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const portalParams = new URLSearchParams();
  portalParams.set('customer', customerId);
  portalParams.set('return_url', returnUrl);

  const portalRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: portalParams.toString()
  });

  const portalText = await portalRes.text().catch(() => '');
  if (!portalRes.ok) {
    return new Response(JSON.stringify({ error: portalText || 'Stripe error' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const portalJson = JSON.parse(portalText || '{}') as any;
  const url = String(portalJson?.url || '').trim();
  if (!url) {
    return new Response(JSON.stringify({ error: 'Missing portal url' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ url }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
