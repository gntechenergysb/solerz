import type { Env, PagesFunction } from './_utils';
import { cleanBaseHtml, escapeHtml, fetchIndexHtml, getOrigin, injectHead, injectRootContent } from './_utils';

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const origin = getOrigin(request);
  const canonical = `${origin}/`;

  let baseHtml = await fetchIndexHtml(env, origin);
  baseHtml = cleanBaseHtml(baseHtml);

  const title = 'Solerz | Solar Hardware Database & Engineering Intelligence Platform';
  const description =
    'Open-access solar hardware database with over 20,000 certified photovoltaic modules, string inverters, and energy storage systems. STC electrical ratings, SDM parameters, and engineering design tools.';

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
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'Solerz',
        url: origin,
        description,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${origin}/solar-panels?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        name: 'Solerz',
        url: origin,
        logo: `${origin}/theme_logo.png`,
        description: 'Global photovoltaic hardware specification database and clean energy engineering intelligence platform.',
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'support@solerz.com',
          contactType: 'technical support',
        },
      },
    ],
  };

  head.push(`<script type="application/ld+json">\n${JSON.stringify(jsonLd)}\n</script>`);

  const prerenderBody = `
  <div id="ssr-home-prerender" style="max-width: 1100px; margin: 40px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="text-align: center; margin-bottom: 48px;">
      <div style="display: inline-block; padding: 4px 14px; background: #ecfdf5; color: #059669; font-size: 12px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; margin-bottom: 12px;">
        Open Hardware Vault &bull; 20,000+ Certified Specs
      </div>
      <h1 style="font-size: 38px; font-weight: 900; color: #0f172a; margin: 0 0 16px 0; letter-spacing: -0.02em;">
        Solar Hardware Intelligence &amp; Engineering Platform
      </h1>
      <p style="font-size: 18px; color: #475569; max-width: 720px; margin: 0 auto 28px auto;">
        Instant access to verified STC electrical ratings, single-diode simulation parameters, and sizing tools for photovoltaic engineers, EPC installers, and researchers.
      </p>

      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
        <a href="/solar-panels" style="display: inline-block; padding: 12px 24px; background: #059669; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px;">
          Browse Solar Panels
        </a>
        <a href="/inverters" style="display: inline-block; padding: 12px 24px; background: #0284c7; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px;">
          Explore Inverters
        </a>
        <a href="/batteries" style="display: inline-block; padding: 12px 24px; background: #7c3aed; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px;">
          Storage Batteries (BESS)
        </a>
        <a href="/arena" style="display: inline-block; padding: 12px 24px; background: #0f172a; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px;">
          Arena Leaderboard
        </a>
        <a href="/handbook" style="display: inline-block; padding: 12px 24px; background: #334155; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px;">
          Engineering Handbook
        </a>
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
