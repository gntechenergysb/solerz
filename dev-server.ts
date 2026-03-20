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
    'starter': { monthly: 'price_1T0elRAEbTWGL4T05z2wcOXW', yearly: 'price_1T0em9AEbTWGL4T0ZyhhLU1P' },
    'pro': { monthly: 'price_1T0enHAEbTWGL4T0Mbvhwiho', yearly: 'price_1T0ennAEbTWGL4T0Dfs6JlmN' },
    'elite': { monthly: 'price_1T0eoRAEbTWGL4T0qsynUwGm', yearly: 'price_1T0er5AEbTWGL4T0hKoOVsjN' },
    'enterprise': { monthly: 'price_1T0etMAEbTWGL4T0C14VVNLk', yearly: 'price_1T0etmAEbTWGL4T0j1Chp7ri' },
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

// ============================================================================
// LOCALHOST OFFLINE ADMIN MOCK: Send Email via Resend
// bypassing browser CORS
// ============================================================================
const handleSendEmail = async (req: http.IncomingMessage, res: http.ServerResponse) => {
  const token = getToken(req);

  if (!token) {
    res.writeHead(401, { 'Content-Type': 'application/json', ...corsHeaders });
    res.end(JSON.stringify({ error: 'Missing auth token' }));
    return;
  }

  const { email, companyName, isVerified } = await parseBody(req) as { email: string; companyName?: string; isVerified: boolean };

  if (!email) {
    res.writeHead(400, { 'Content-Type': 'application/json', ...corsHeaders });
    res.end(JSON.stringify({ error: 'Missing target email' }));
    return;
  }

  const resendApiKey = process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn("No RESEND_API_KEY config found in .env.local! Fake success output.");
    res.writeHead(200, { 'Content-Type': 'application/json', ...corsHeaders });
    res.end(JSON.stringify({ success: true, message: 'Fake success (missing RESEND_API_KEY)' }));
    return;
  }

  let subject = '';
  let html = '';

  const escapeHtmlStrict = (str: string) => str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag as any] || tag)
  );

  if (isVerified) {
    subject = '🎉 Solerz: Your Seller Account is Verified!';
    html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2>Congratulations, ${escapeHtmlStrict(companyName || 'Valued Partner')}!</h2>
        <p>We are thrilled to let you know that your seller account on <strong>Solerz</strong> has been successfully reviewed and verified.</p>
        <p>Your listings now feature the exclusive <strong>VERIFIED SUPPLIER</strong> badge, boosting your credibility and visibility to buyers globally.</p>
        <p>Log in now to manage your inventory and connect with new buyers:</p>
        <p><a href="https://solerz.com/dashboard" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a></p>
        <br/>
        <p>Best regards,<br/>The Solerz Team</p>
      </div>
    `;
  } else {
    subject = '⚠️ Solerz: Verification Revoked';
    html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2>Notice for ${escapeHtmlStrict(companyName || 'Seller')}</h2>
        <p>Your seller verification status on <strong>Solerz</strong> has been revoked. Your listings will no longer carry the verified badge.</p>
        <p>If you believe this was a mistake, please reply to this email or contact support.</p>
        <br/>
        <p>Best regards,<br/>The Solerz Team</p>
      </div>
    `;
  }

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Solerz Team <info@solerz.com>', // MUST BE VERIFIED ON RESEND
        to: email,
        subject,
        html
      })
    });

    if (!resendRes.ok) {
      const errorText = await resendRes.text();
      res.writeHead(500, { 'Content-Type': 'application/json', ...corsHeaders });
      res.end(JSON.stringify({ error: 'Resend Error: ' + errorText }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json', ...corsHeaders });
    res.end(JSON.stringify({ success: true }));
  } catch (err: any) {
    res.writeHead(500, { 'Content-Type': 'application/json', ...corsHeaders });
    res.end(JSON.stringify({ error: err.message }));
  }
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
    } else if (url.pathname === '/api/send-verification-email' && req.method === 'POST') {
      await handleSendEmail(req, res);
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
