import type { Env } from '../_utils';

/**
 * POST /api/activate-starter
 * Activates the free Starter tier for a seller who is currently UNSUBSCRIBED.
 * Uses service role to bypass RLS so the tier column can be updated.
 */
export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
    const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return new Response(JSON.stringify({ error: 'Missing env vars' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Parse Bearer token
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!token) {
        return new Response(JSON.stringify({ error: 'Missing auth token' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Verify user
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

    if (!userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Use service role key if available, otherwise fall back to anon key
    const apiKey = supabaseServiceKey || supabaseAnonKey;

    // Get current profile to check eligibility
    const profileRes = await fetch(
        `${supabaseUrl.replace(/\/$/, '')}/rest/v1/profiles?id=eq.${userId}&select=id,tier,role,stripe_subscription_id`,
        {
            headers: {
                apikey: apiKey,
                Authorization: `Bearer ${apiKey}`
            }
        }
    );

    const profiles = (await profileRes.json().catch(() => [])) as any[];
    const profile = profiles?.[0];

    if (!profile) {
        return new Response(JSON.stringify({ error: 'Profile not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Only allow SELLER accounts that are UNSUBSCRIBED (or no tier)
    if (profile.role === 'BUYER') {
        return new Response(JSON.stringify({ error: 'Buyers do not need subscriptions' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (profile.tier && profile.tier !== 'UNSUBSCRIBED') {
        return new Response(JSON.stringify({ error: 'Already subscribed', currentTier: profile.tier }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Don't allow if they have an active Stripe subscription
    if (profile.stripe_subscription_id) {
        return new Response(JSON.stringify({ error: 'Has active Stripe subscription, use Stripe portal instead' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Update tier to STARTER using service role
    const updateRes = await fetch(
        `${supabaseUrl.replace(/\/$/, '')}/rest/v1/profiles?id=eq.${userId}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                apikey: apiKey,
                Authorization: `Bearer ${apiKey}`,
                Prefer: 'return=minimal'
            },
            body: JSON.stringify({ tier: 'STARTER' })
        }
    );

    if (!updateRes.ok) {
        const errText = await updateRes.text().catch(() => 'update failed');
        return new Response(JSON.stringify({ error: errText }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ success: true, tier: 'STARTER' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};
