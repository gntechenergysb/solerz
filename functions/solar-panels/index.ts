import type { Env, PagesFunction } from '../_utils';
import { cleanBaseHtml, escapeHtml, fetchIndexHtml, getOrigin, injectHead, injectRootContent } from '../_utils';

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const origin = getOrigin(request);
  const canonical = `${origin}/solar-panels`;

  let baseHtml = await fetchIndexHtml(env, origin);
  baseHtml = cleanBaseHtml(baseHtml);

  const title = 'Solar Photovoltaic Modules Database & Specifications | Solerz';
  const description =
    'Search and compare over 20,000 certified solar panels. Standard Test Condition (STC) electrical ratings, NMOT parameters, temperature coefficients, and manufacturer datasheets on Solerz.';

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
    '@type': 'CollectionPage',
    name: title,
    description,
    url: canonical,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, item: { '@id': `${origin}/`, name: 'Home' } },
        { '@type': 'ListItem', position: 2, item: { '@id': canonical, name: 'Solar Panels' } },
      ],
    },
  };

  head.push(`<script type="application/ld+json">\n${JSON.stringify(jsonLd)}\n</script>`);

  const prerenderBody = `
  <div id="ssr-panels-index-prerender" style="max-width: 1100px; margin: 30px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <nav style="font-size: 13px; margin-bottom: 20px; color: #64748b;">
      <a href="/" style="color: #059669; text-decoration: none; font-weight: 600;">Home</a> &gt; <span>Solar PV Modules</span>
    </nav>
    <header style="border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
      <div style="display: inline-block; padding: 4px 12px; background: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; margin-bottom: 8px;">
        Certified PV Hardware Vault
      </div>
      <h1 style="font-size: 32px; font-weight: 900; color: #0f172a; margin: 0 0 10px 0;">
        Solar Photovoltaic Modules Database
      </h1>
      <p style="font-size: 16px; color: #475569; margin: 0;">
        Browse certified residential, commercial, and utility-scale solar panels. Full electrical STC specs, thermal coefficients, and verified datasheets.
      </p>
    </header>
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
