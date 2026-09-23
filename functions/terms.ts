import type { Env, PagesFunction } from './_utils';
import { cleanBaseHtml, escapeHtml, fetchIndexHtml, getOrigin, injectHead, injectRootContent } from './_utils';

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const origin = getOrigin(request);
  const canonical = `${origin}/terms`;

  let baseHtml = await fetchIndexHtml(env, origin);
  baseHtml = cleanBaseHtml(baseHtml);

  const title = 'Terms of Service & Engineering Disclaimer | Solerz';
  const description =
    'Solerz terms of service, permissible usage, and professional engineering disclaimer regarding solar simulation calculations, PV string voltage sizing, and manufacturer hardware datasheets.';

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

  const prerenderBody = `
  <div id="ssr-terms-prerender" style="max-width: 900px; margin: 30px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.65;">
    <nav style="font-size: 13px; margin-bottom: 20px; color: #64748b;">
      <a href="/" style="color: #059669; text-decoration: none; font-weight: 600;">Home</a> &gt; <span>Terms of Service</span>
    </nav>

    <header style="border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
      <div style="display: inline-block; padding: 4px 12px; background: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; margin-bottom: 8px;">
        Engineering Agreement &amp; Governance
      </div>
      <h1 style="font-size: 32px; font-weight: 900; color: #0f172a; margin: 0 0 10px 0;">
        Terms of Service
      </h1>
      <p style="font-size: 14px; color: #64748b; margin: 0;">
        Effective Date: September 2026 &bull; Solerz Engineering Intelligence Platform
      </p>
    </header>

    <section style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px; margin-bottom: 24px;">
      <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0;">1. Acceptance of Terms</h2>
      <p style="font-size: 14px; color: #334155; margin: 0;">
        By accessing or using Solerz (https://solerz.com), including our photovoltaic modules catalog, inverter and battery databases, string sizing calculators, and engineering handbook whitepapers, you agree to comply with and be bound by these Terms of Service.
      </p>
    </section>

    <section style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 14px; padding: 24px; margin-bottom: 24px;">
      <h2 style="font-size: 18px; font-weight: 800; color: #92400e; margin-top: 0;">2. Professional Engineering Disclaimer</h2>
      <p style="font-size: 14px; color: #78350f; margin: 0 0 10px 0;">
        All computational outputs, temperature-corrected voltage formulas, single-diode simulation parameters, and handbook design tips provided on Solerz are intended solely for preliminary technical evaluation, feasibility modeling, and academic reference.
      </p>
      <p style="font-size: 14px; color: #78350f; margin: 0;">
        Solerz calculations do not replace certified electrical engineering reviews by a licensed Professional Engineer (PE). Field installations must always adhere to local building codes, National Electrical Code (NEC Article 690 & 705), IEC 62548, and manufacturer installation manuals.
      </p>
    </section>

    <section style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px; margin-bottom: 24px;">
      <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0;">3. Hardware Specifications &amp; Datasheet Accuracy</h2>
      <p style="font-size: 14px; color: #334155; margin: 0;">
        Specification values (Pmax, Voc, Isc, Vmp, Imp, efficiency, temperature coefficients) are compiled from certified testing laboratory reports (IEC 61215 / IEC 61730 / UL 1703) and official OEM documentation. While Solerz strives for 100% accuracy, users should verify critical parameters with official manufacturer datasheets before procuring equipment.
      </p>
    </section>

    <footer style="padding: 16px 0; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
      Questions regarding terms: <a href="mailto:support@solerz.com" style="color: #059669;">support@solerz.com</a>
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
