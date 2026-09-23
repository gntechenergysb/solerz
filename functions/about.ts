import type { Env, PagesFunction } from './_utils';
import { cleanBaseHtml, escapeHtml, fetchIndexHtml, getOrigin, injectHead, injectRootContent } from './_utils';

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const origin = getOrigin(request);
  const canonical = `${origin}/about`;

  let baseHtml = await fetchIndexHtml(env, origin);
  baseHtml = cleanBaseHtml(baseHtml);

  const title = 'About Us | Solerz Solar Engineering Intelligence Platform';
  const description =
    'Learn about Solerz, the open engineering intelligence platform and digital hardware vault built for solar photovoltaic designers, EPC contractors, and clean energy researchers worldwide.';

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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: title,
    description,
    url: canonical,
    mainEntity: {
      '@type': 'Organization',
      name: 'Solerz',
      url: origin,
      logo: `${origin}/theme_logo.png`,
      description: 'Global photovoltaic hardware database and solar engineering simulation platform.',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'support@solerz.com',
        contactType: 'technical support',
      },
    },
  };

  head.push(`<script type="application/ld+json">\n${JSON.stringify(jsonLd)}\n</script>`);

  const prerenderBody = `
  <div id="ssr-about-prerender" style="max-width: 900px; margin: 30px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.65;">
    <nav style="font-size: 13px; margin-bottom: 20px; color: #64748b;">
      <a href="/" style="color: #059669; text-decoration: none; font-weight: 600;">Home</a> &gt; <span>About Us</span>
    </nav>

    <header style="border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
      <div style="display: inline-block; padding: 4px 12px; background: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; margin-bottom: 8px;">
        Mission &amp; Engineering Architecture
      </div>
      <h1 style="font-size: 32px; font-weight: 900; color: #0f172a; margin: 0 0 10px 0;">
        About Solerz
      </h1>
      <p style="font-size: 16px; color: #475569; margin: 0;">
        The open engineering intelligence platform and digital hardware vault built for solar photovoltaic designers, EPC contractors, and clean energy researchers worldwide.
      </p>
    </header>

    <section style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px; margin-bottom: 28px;">
      <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px;">
        Our Mission: Democratizing Solar Hardware Intelligence
      </h2>
      <p style="font-size: 15px; color: #334155; margin: 0 0 14px 0;">
        Designing utility-scale, commercial, and residential solar energy systems requires accurate, granular hardware specifications. Historically, solar engineers, developers, and students have had to navigate fragmented manufacturer websites, pay for opaque closed databases, or manually transcribe datasheets into simulation software.
      </p>
      <p style="font-size: 15px; color: #334155; margin: 0;">
        <strong>Solerz</strong> was founded to solve this bottleneck. We unify global photovoltaic modules, grid-tie/hybrid string inverters, and battery energy storage systems (BESS) into a standardized, lightning-fast digital catalog. Our mission is to accelerate global solar adoption by providing engineers with instant access to STC/NMOT parameters, temperature coefficients, verified manufacturer datasheets, and simulation-ready models.
      </p>
    </section>

    <section style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px; margin-bottom: 28px;">
      <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 14px;">
        Four Core Pillars of Solerz
      </h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">
        <div style="background: #ffffff; padding: 16px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0;">1. Comprehensive Hardware Vault</h3>
          <p style="font-size: 13px; color: #475569; margin: 0;">Over 20,000 verified photovoltaic modules, central and string inverters, and lithium storage solutions with full electrical specifications.</p>
        </div>
        <div style="background: #ffffff; padding: 16px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0;">2. Solar Sizer &amp; Calculator</h3>
          <p style="font-size: 13px; color: #475569; margin: 0;">Interactive computational modeling of string voltage sizing, temperature-corrected Voc, and DC/AC oversizing ratios.</p>
        </div>
        <div style="background: #ffffff; padding: 16px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0;">3. Engineering Handbook</h3>
          <p style="font-size: 13px; color: #475569; margin: 0;">Field-tested engineering design rules, NEC 690.7 compliance guidelines, and thermal derating physics written by PV specialists.</p>
        </div>
        <div style="background: #ffffff; padding: 16px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 0;">4. Versus Comparison Engine</h3>
          <p style="font-size: 13px; color: #475569; margin: 0;">Side-by-side electrical and thermal benchmarking across multi-manufacturer equipment matrices.</p>
        </div>
      </div>
    </section>

    <footer style="padding: 16px 0; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b;">
      Direct correspondence: <a href="mailto:support@solerz.com" style="color: #059669; font-weight: 600;">support@solerz.com</a> | Solerz Engineering Team
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
