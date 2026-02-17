import http from 'http';
import { URL } from 'url';
import fs from 'fs';

// Load env from .env.local manually using Node.js fs
const envPath = '.env.local';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (value) process.env[key.trim()] = value;
    }
  });
}

const PORT = process.env.DEV_API_PORT || 8788;

// Simple CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Parse request body
const parseBody = (req: http.IncomingMessage): Promise<any> => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
};

// Get auth token from header
const getToken = (req: http.IncomingMessage): string | null => {
  const auth = req.headers.authorization || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
};

// ============================================================================
// LOCALHOST TESTABLE: Stripe Checkout
// This creates a REAL Stripe checkout session that works in localhost
// ============================================================================
const handleCheckout = async (req: http.IncomingMessage, res: http.ServerResponse) => {
  const body = await parseBody(req) as { planId?: string; billingCycle?: string };
  const token = getToken(req);
  
  if (!token) {
    res.writeHead(401, { 'Content-Type': 'application/json', ...corsHeaders });
    res.end(JSON.stringify({ error: 'Missing auth token' }));
    return;
  }

  const { planId, billingCycle } = body;
  
  // Map plan to Stripe Price IDs
  const priceMap: Record<string, { monthly: string; yearly: string }> = {
    'starter': { monthly: 'price_1SxscwAEbTWGL4T0h3tf72Yb', yearly: 'price_1SxsceAEbTWGL4T0lPMjcbso' },
    'pro': { monthly: 'price_1SxIVLAEbTWGL4T0zRcmfquj', yearly: 'price_1SxIVoAEbTWGL4T0eEuOEfde' },
    'elite': { monthly: 'price_1SxIW8AEbTWGL4T0AnrsvXOV', yearly: 'price_1SxIWqAEbTWGL4T0hXqilGER' },
    'enterprise': { monthly: 'price_1SxIXMAEbTWGL4T0sqlzkmb5', yearly: 'price_1SxIXcAEbTWGL4T0Fxf36hwn' },
  };

  const priceId = planId ? priceMap[planId]?.[billingCycle as 'monthly' | 'yearly'] : undefined;
  
  if (!priceId) {
    res.writeHead(400, { 'Content-Type': 'application/json', ...corsHeaders });
    res.end(JSON.stringify({ error: 'Invalid plan' }));
    return;
  }

  // Create checkout session via Stripe API using Price ID
  try {
    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'subscription',
        'success_url': `http://localhost:3000/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `http://localhost:3000/pricing?payment=canceled`,
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
      }).toString(),
    });

    const stripeData = await stripeRes.json() as any;
    
    if (!stripeRes.ok) {
      res.writeHead(502, { 'Content-Type': 'application/json', ...corsHeaders });
      res.end(JSON.stringify({ error: stripeData.error?.message || 'Stripe error' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json', ...corsHeaders });
    res.end(JSON.stringify({ url: stripeData.url }));
  } catch (err: any) {
    res.writeHead(500, { 'Content-Type': 'application/json', ...corsHeaders });
    res.end(JSON.stringify({ error: err.message }));
  }
};

// ============================================================================
// CLOUDFLARE ONLY: Billing Portal
// Requires Stripe customer ID - not testable in localhost
// ============================================================================
const handlePortal = async (req: http.IncomingMessage, res: http.ServerResponse) => {
  const token = getToken(req);
  
  if (!token) {
    res.writeHead(401, { 'Content-Type': 'application/json', ...corsHeaders });
    res.end(JSON.stringify({ error: 'Missing auth token' }));
    return;
  }

  // CLOUDFLARE ONLY: This endpoint requires a real Stripe customer
  // Localhost returns a mock URL for UI testing
  res.writeHead(200, { 'Content-Type': 'application/json', ...corsHeaders });
  res.end(JSON.stringify({ 
    url: 'https://dashboard.stripe.com/test/billing',
    _note: 'Portal requires Cloudflare deployment with Stripe customer'
  }));
};

// ============================================================================
// CLOUDFLARE ONLY: Subscription Change
// Requires active subscription - not testable in localhost
// ============================================================================
const handleSubscriptionChange = async (req: http.IncomingMessage, res: http.ServerResponse) => {
  const token = getToken(req);
  
  if (!token) {
    res.writeHead(401, { 'Content-Type': 'application/json', ...corsHeaders });
    res.end(JSON.stringify({ error: 'Missing auth token' }));
    return;
  }

  // CLOUDFLARE ONLY: This endpoint requires a real Stripe subscription
  // Localhost returns mock response for UI testing
  res.writeHead(200, { 'Content-Type': 'application/json', ...corsHeaders });
  res.end(JSON.stringify({ 
    mode: 'upgrade',
    subscriptionId: 'sub_test_local',
    _note: 'Change requires Cloudflare deployment with active subscription'
  }));
};

// ============================================================================
// CLOUDFLARE ONLY: Subscription Cancel
// Requires active subscription - not testable in localhost
// ============================================================================
const handleSubscriptionCancel = async (req: http.IncomingMessage, res: http.ServerResponse) => {
  const token = getToken(req);
  
  if (!token) {
    res.writeHead(401, { 'Content-Type': 'application/json', ...corsHeaders });
    res.end(JSON.stringify({ error: 'Missing auth token' }));
    return;
  }

  const body = await parseBody(req) as { atPeriodEnd?: boolean };

  // CLOUDFLARE ONLY: This endpoint requires a real Stripe subscription
  // Localhost returns mock response for UI testing
  res.writeHead(200, { 'Content-Type': 'application/json', ...corsHeaders });
  res.end(JSON.stringify({ 
    success: true,
    mode: body.atPeriodEnd ? 'at_period_end' : 'immediate',
    subscriptionId: 'sub_test_local',
    _note: 'Cancel requires Cloudflare deployment with active subscription'
  }));
};

// ============================================================================
// CLOUDFLARE ONLY: Subscription Sync
// Requires Stripe subscription data - not testable in localhost
// ============================================================================
const handleSubscriptionSync = async (req: http.IncomingMessage, res: http.ServerResponse) => {
  const token = getToken(req);
  
  if (!token) {
    res.writeHead(401, { 'Content-Type': 'application/json', ...corsHeaders });
    res.end(JSON.stringify({ error: 'Missing auth token' }));
    return;
  }

  // CLOUDFLARE ONLY: This endpoint fetches real Stripe data
  // Localhost returns empty response (Dashboard will use Supabase user data instead)
  res.writeHead(200, { 'Content-Type': 'application/json', ...corsHeaders });
  res.end(JSON.stringify({ 
    subscription: null,
    profile: null,
    pending_tier: null,
    tier_effective_at: null,
    _note: 'Sync requires Cloudflare deployment with Stripe subscription'
  }));
};

// Server
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  console.log(`${req.method} ${url.pathname}`);

  try {
    if (url.pathname === '/api/stripe/checkout' && req.method === 'POST') {
      await handleCheckout(req, res);
    } else if (url.pathname === '/api/stripe/portal' && req.method === 'POST') {
      await handlePortal(req, res);
    } else if (url.pathname === '/api/stripe/subscription/change' && req.method === 'POST') {
      await handleSubscriptionChange(req, res);
    } else if (url.pathname === '/api/stripe/subscription/cancel' && req.method === 'POST') {
      await handleSubscriptionCancel(req, res);
    } else if (url.pathname === '/api/stripe/subscription/sync' && req.method === 'GET') {
      await handleSubscriptionSync(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json', ...corsHeaders });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (err: any) {
    console.error('Server error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json', ...corsHeaders });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Local Stripe API server running on http://localhost:${PORT}`);
  console.log('');
  console.log('📌 LOCALHOST TESTABLE:');
  console.log('   POST /api/stripe/checkout    → Creates REAL Stripe checkout session');
  console.log('');
  console.log('📌 CLOUDFLARE ONLY (Localhost returns mock):');
  console.log('   POST /api/stripe/portal      → Requires Stripe customer ID');
  console.log('   POST /api/stripe/subscription/change  → Requires active subscription');
  console.log('   POST /api/stripe/subscription/cancel  → Requires active subscription');
  console.log('   GET  /api/stripe/subscription/sync    → Requires Stripe subscription data');
  console.log('');
  console.log('⚠️  Change Plan / Cancel / Sync buttons will show UI but not affect Stripe in localhost');
});
