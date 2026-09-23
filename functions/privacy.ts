import type { Env, PagesFunction } from './_utils';
import { cleanBaseHtml, escapeHtml, fetchIndexHtml, getOrigin, injectHead, injectRootContent } from './_utils';

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const origin = getOrigin(request);
  const canonical = `${origin}/privacy`;

  let baseHtml = await fetchIndexHtml(env, origin);
  baseHtml = cleanBaseHtml(baseHtml);

  const title = 'Privacy Policy | Solerz Solar Hardware Intelligence';
  const description =
    'Solerz privacy policy and data governance. Information on Google AdSense cookies, personalized advertising opt-out, GDPR, CCPA rights, and telemetry protection.';

  const head = [
    `<title>${escapeHtml(title)}</title>`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />',
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Solerz" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${origin}/theme_logo.png" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${origin}/theme_logo.png" />`,
  ];

  const prerenderBody = `
  <div id="ssr-privacy-prerender" style="max-width: 900px; margin: 30px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.65;">
    <nav style="font-size: 13px; margin-bottom: 20px; color: #64748b;">
      <a href="/" style="color: #059669; text-decoration: none; font-weight: 600;">Home</a> &gt; <span>Privacy Policy</span>
    </nav>

    <header style="border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
      <div style="display: inline-block; padding: 4px 12px; background: #dbeafe; color: #1d4ed8; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; margin-bottom: 8px;">
        Transparency &amp; Data Governance
      </div>
      <h1 style="font-size: 32px; font-weight: 900; color: #0f172a; margin: 0 0 10px 0;">
        Privacy Policy
      </h1>
      <p style="font-size: 14px; color: #64748b; margin: 0;">
        Effective Date: September 2026 &bull; Applicable to Solerz (https://solerz.com)
      </p>
    </header>

    <section style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px; margin-bottom: 24px;">
      <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0;">1. Overview &amp; Commitment to User Privacy</h2>
      <p style="font-size: 14px; color: #334155;">
        Solerz ("we", "our", or "the Platform"), accessible at <strong>https://solerz.com</strong>, operates as an open-access engineering catalog, PV hardware specifications database, and computational simulation utility. We prioritize user privacy and adhere strictly to data minimization: we do not sell, rent, or trade your personal information.
      </p>
    </section>

    <!-- Google AdSense & Advertising Disclosures (MANDATORY FOR ADSENSE) -->
    <section style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 14px; padding: 24px; margin-bottom: 24px;">
      <h2 style="font-size: 18px; font-weight: 800; color: #1e3a8a; margin-top: 0;">2. Third-Party Advertising &amp; Google AdSense Disclosures</h2>
      <p style="font-size: 14px; color: #1e40af; margin-bottom: 12px;">
        To sustain our high-performance infrastructure, cloud object storage, and global CDN delivery without charging subscription fees for engineering datasheets, Solerz displays contextual and programmatic advertisements provided by third-party advertising networks, including <strong>Google AdSense</strong>.
      </p>
      
      <div style="background: #ffffff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px; font-size: 13px; color: #1e293b;">
        <p style="font-weight: 700; margin-top: 0;">Mandatory Advertising Disclosures:</p>
        <ul style="padding-left: 20px; margin-bottom: 0;">
          <li style="margin-bottom: 6px;"><strong>Third-party vendors, including Google, use cookies</strong> to serve ads based on a user's prior visits to Solerz or other websites on the internet.</li>
          <li style="margin-bottom: 6px;">Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to our sites and/or other sites on the Internet.</li>
          <li style="margin-bottom: 6px;">Users may opt out of personalized advertising by visiting <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" style="color: #2563eb; font-weight: 600;">Google Ads Settings (My Ad Center)</a>.</li>
          <li>Users may also opt out of third-party vendor cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" style="color: #2563eb; font-weight: 600;">www.aboutads.info</a> or <a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" style="color: #2563eb; font-weight: 600;">www.youronlinechoices.com</a>.</li>
        </ul>
      </div>
    </section>

    <section style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px; margin-bottom: 24px;">
      <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0;">3. Data Protection Rights (GDPR &amp; CCPA)</h2>
      <p style="font-size: 14px; color: #334155; margin: 0 0 10px 0;">
        Under the EU General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA), users possess the right to access, rectify, or request deletion of personal information, as well as the right to restrict or object to certain processing activities.
      </p>
      <p style="font-size: 14px; color: #334155; margin: 0;">
        To exercise any privacy rights or submit questions regarding data handling, please contact our Data Governance desk at <a href="mailto:support@solerz.com" style="color: #059669; font-weight: 600;">support@solerz.com</a>.
      </p>
    </section>

    <footer style="padding: 16px 0; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
      Solerz &bull; Open Solar Engineering Catalog &bull; <a href="mailto:support@solerz.com" style="color: #059669;">support@solerz.com</a>
    </footer>
  </div>
  `;

  baseHtml = injectRootContent(baseHtml, prerenderBody);
  const html = injectHead(baseHtml, head.join('\n'));

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400',
    },
  });
};
