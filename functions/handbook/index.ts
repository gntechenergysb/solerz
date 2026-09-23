import type { Env, PagesFunction } from '../_utils';
import { cleanBaseHtml, escapeHtml, fetchIndexHtml, getOrigin, injectHead, injectRootContent } from '../_utils';
import { SOLAR_TIPS } from '../../data/solarTipsData';

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const origin = getOrigin(request);
  const canonical = `${origin}/handbook`;

  let baseHtml = await fetchIndexHtml(env, origin);
  baseHtml = cleanBaseHtml(baseHtml);

  const title = 'Solar Engineering Handbook & Design Formulas | Solerz';
  const description =
    'Practical, first-principles engineering guides for photovoltaic modules, string inverters, and battery storage. Sizing formulas, electrical rules, and thermal derating physics.';

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
    '@type': 'CollectionPage',
    name: title,
    description,
    url: canonical,
    publisher: {
      '@type': 'Organization',
      name: 'Solerz',
      url: origin,
      logo: {
        '@type': 'ImageObject',
        url: `${origin}/theme_logo.png`,
      },
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: SOLAR_TIPS.length,
      itemListElement: SOLAR_TIPS.map((tip, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${origin}/handbook/${tip.slug}`,
        name: tip.title,
        description: tip.summary,
      })),
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, item: { '@id': `${origin}/`, name: 'Home' } },
        { '@type': 'ListItem', position: 2, item: { '@id': canonical, name: 'Solar Engineering Handbook' } },
      ],
    },
  };

  head.push(`<script type="application/ld+json">\n${JSON.stringify(jsonLd)}\n</script>`);

  const tipsHtml = SOLAR_TIPS.map(
    (tip) => `
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <div style="display: flex; gap: 8px; margin-bottom: 8px;">
        <span style="display: inline-block; padding: 3px 10px; background: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase;">
          ${escapeHtml(tip.categoryLabel)}
        </span>
      </div>
      <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0;">
        <a href="/handbook/${escapeHtml(tip.slug)}" style="color: #0f172a; text-decoration: none;">${escapeHtml(tip.title)}</a>
      </h2>
      <p style="font-size: 14px; color: #475569; margin: 0 0 10px 0;">
        ${escapeHtml(tip.summary)}
      </p>
      <div style="font-family: monospace; font-size: 12px; color: #059669; background: #f0fdf4; padding: 6px 12px; border-radius: 6px; display: inline-block; font-weight: 700;">
        Rule: ${escapeHtml(tip.formulaOrRule)}
      </div>
    </div>
  `
  ).join('\n');

  const prerenderBody = `
  <div id="ssr-handbook-index-prerender" style="max-width: 1000px; margin: 30px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 28px;">
      <div style="display: inline-block; padding: 4px 12px; background: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; margin-bottom: 8px;">
        Engineering Guides &amp; Field Rules
      </div>
      <h1 style="font-size: 30px; font-weight: 900; color: #0f172a; margin: 0 0 8px 0;">
        Solar Engineering Handbook
      </h1>
      <p style="font-size: 15px; color: #475569; margin: 0;">
        ${SOLAR_TIPS.length} practical calculation formulas, sizing rules, and field engineering guides for solar system designers.
      </p>
    </div>

    <!-- Articles List -->
    <div style="margin-bottom: 40px;">
      ${tipsHtml}
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
