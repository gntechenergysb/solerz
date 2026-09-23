import type { Env, PagesFunction } from './_utils';
import { cleanBaseHtml, escapeHtml, fetchIndexHtml, getOrigin, injectHead, injectRootContent } from './_utils';

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const origin = getOrigin(request);
  const canonical = `${origin}/calculator`;

  let baseHtml = await fetchIndexHtml(env, origin);
  baseHtml = cleanBaseHtml(baseHtml);

  const title = 'Solar System Sizer & String Voltage Calculator | Solerz';
  const description =
    'Free online solar array string sizing calculator. Calculate maximum series modules under NEC 690.7 cold Voc surge, MPPT operating windows, inverter loading ratio, and temperature derating.';

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
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Solerz Solar System Sizer & String Calculator',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'All',
    url: canonical,
    description,
    author: {
      '@type': 'Organization',
      name: 'Solerz',
      url: origin,
    },
  };

  head.push(`<script type="application/ld+json">\n${JSON.stringify(jsonLd)}\n</script>`);

  const prerenderBody = `
  <div id="ssr-calculator-prerender" style="max-width: 1000px; margin: 30px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <nav style="font-size: 13px; margin-bottom: 20px; color: #64748b;">
      <a href="/" style="color: #059669; text-decoration: none; font-weight: 600;">Home</a> &gt; <span>Solar System Sizer</span>
    </nav>

    <header style="border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
      <div style="display: inline-block; padding: 4px 12px; background: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; margin-bottom: 8px;">
        Engineering Sizing &amp; Compliance Utility
      </div>
      <h1 style="font-size: 32px; font-weight: 900; color: #0f172a; margin: 0 0 10px 0;">
        Solar System Sizer &amp; String Calculator
      </h1>
      <p style="font-size: 16px; color: #475569; margin: 0;">
        Calculate string electrical constraints, cold-temperature Voc surge (NEC Article 690.7), MPPT voltage operating windows, and DC/AC oversizing ratios.
      </p>
    </header>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px;">
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;">
        <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 0;">1. Temperature-Corrected Voc Sizing</h2>
        <p style="font-size: 13px; color: #475569; margin: 0;">
          Ensures maximum string open-circuit voltage never exceeds inverter Vdcmax (typically 600V, 1000V, or 1500V) during extreme sub-zero winter mornings.
        </p>
      </div>

      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;">
        <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 0;">2. Summer MPPT Minimum Voltage</h2>
        <p style="font-size: 13px; color: #475569; margin: 0;">
          Calculates string Vmp derating at 65°C cell temperature to ensure array voltage stays above the inverter's lowest MPPT tracking threshold.
        </p>
      </div>

      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;">
        <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 0;">3. Inverter Loading Ratio (ILR)</h2>
        <p style="font-size: 13px; color: #475569; margin: 0;">
          Analyzes DC-to-AC power ratio economics (typically 1.15 to 1.35) to balance inverter clipping losses against balance-of-system cost optimization.
        </p>
      </div>
    </div>
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
