import type { Env } from '../_utils';
import { supabaseRestGet } from '../_utils';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    // 1. Authenticate with Supabase JWT
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Missing Authorization header', { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new Response('Supabase configuration missing', { status: 500 });
    }

    // Call Supabase Auth to get user
    const authRes = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${token}`
      }
    });

    if (!authRes.ok) {
      return new Response('Invalid or expired token', { status: 401 });
    }

    const { id: userId } = await authRes.json();

    // 2. Check if user is ADMIN
    const { data: profileData, error: profileError } = await supabaseRestGet<any[]>(
      env,
      `profiles?id=eq.${userId}&select=role&limit=1`
    );

    if (profileError || !profileData || profileData.length === 0 || profileData[0].role !== 'ADMIN') {
      return new Response('Forbidden: Requires ADMIN role', { status: 403 });
    }

    // 3. Parse Request Body
    const body = await request.json() as { email: string; companyName: string; isVerified: boolean };
    const { email, companyName, isVerified } = body;

    if (!email) {
      return new Response('Missing target email', { status: 400 });
    }

    // 4. Call Resend API
    const resendApiKey = env.RESEND_API_KEY;
    if (!resendApiKey) {
      // Return success dynamically if Resend isn't configured, but log error
      console.warn('RESEND_API_KEY is not defined! Email not sent.');
      return new Response(JSON.stringify({ success: true, message: 'Simulated email send (missing API key)' }), { status: 200 });
    }

    let subject = '';
    let html = '';

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

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Solerz Team <info@solerz.com>', // Replace with their verified domain
        to: email,
        subject,
        html
      })
    });

    if (!resendRes.ok) {
      const errorText = await resendRes.text();
      console.error('Resend API Error:', errorText);
      return new Response('Failed to send email via Resend', { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (err: any) {
    console.error('Email API Error:', err);
    return new Response(err.message || 'Internal Server Error', { status: 500 });
  }
};

function escapeHtmlStrict(str: string) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
