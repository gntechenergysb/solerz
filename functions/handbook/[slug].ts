import type { Env, PagesFunction } from '../_utils';
import { cleanBaseHtml, escapeHtml, fetchIndexHtml, getOrigin, injectHead, injectRootContent } from '../_utils';
import { SOLAR_TIPS, type SolarEngineeringTip } from '../../data/solarTipsData';

export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  const origin = getOrigin(request);
  const slug = String((params as any).slug || '').trim();

  let baseHtml = await fetchIndexHtml(env, origin);
  baseHtml = cleanBaseHtml(baseHtml);

  const tip: SolarEngineeringTip | undefined = SOLAR_TIPS.find(
    (t) => t.slug === slug || t.id === slug
  );

  const title = tip
    ? `${tip.title} — Solar Engineering Handbook | Solerz`
    : 'Engineering Guide Not Found | Solerz';

  const description = tip
    ? `${tip.summary} Formula: ${tip.formulaOrRule}.`
    : 'Solar Photovoltaic Engineering Handbook and installation design guidelines on Solerz.';

  const canonical = `${origin}/handbook/${encodeURIComponent(slug)}`;

  const head = [
    `<title>${escapeHtml(title)}</title>`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    ...(!tip ? ['<meta name="robots" content="noindex, nofollow" />'] : ['<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />']),
    `<meta property="og:type" content="article" />`,
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

  if (tip) {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'TechArticle',
          headline: tip.title,
          description: tip.summary,
          proficiencyLevel: 'Expert',
          inLanguage: 'en-US',
          url: canonical,
          about: [
            { '@type': 'Thing', name: tip.categoryLabel },
            { '@type': 'Thing', name: 'Photovoltaic Engineering' },
          ],
          author: {
            '@type': 'Organization',
            name: 'Solerz Photovoltaic Engineering Specialists',
            url: `${origin}/about`,
          },
          publisher: {
            '@type': 'Organization',
            name: 'Solerz',
            url: origin,
            logo: {
              '@type': 'ImageObject',
              url: `${origin}/theme_logo.png`,
            },
          },
          datePublished: '2025-01-15T00:00:00Z',
          dateModified: '2026-03-20T00:00:00Z',
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: tip.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `${tip.summary} ${tip.explanation}`,
              },
            },
          ],
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, item: { '@id': `${origin}/`, name: 'Home' } },
            { '@type': 'ListItem', position: 2, item: { '@id': `${origin}/handbook`, name: 'Engineering Handbook' } },
            { '@type': 'ListItem', position: 3, item: { '@id': canonical, name: tip.title } },
          ],
        },
      ],
    };

    head.push(`<script type="application/ld+json">\n${JSON.stringify(jsonLd)}\n</script>`);

    const prerenderBody = `
    <article id="ssr-handbook-prerender" style="max-width: 900px; margin: 30px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.65;">
      <nav style="font-size: 13px; margin-bottom: 20px; color: #64748b;">
        <a href="/" style="color: #059669; text-decoration: none; font-weight: 600;">Home</a> &gt; 
        <a href="/handbook" style="color: #059669; text-decoration: none; font-weight: 600;">Engineering Handbook</a> &gt; 
        <span>${escapeHtml(tip.categoryLabel)}</span> &gt; 
        <span>${escapeHtml(tip.title)}</span>
      </nav>

      <header style="border-bottom: 2px solid #e2e8f0; padding-bottom: 24px; margin-bottom: 28px;">
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
          <span style="display: inline-block; padding: 4px 12px; background: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase;">
            ${escapeHtml(tip.categoryLabel)}
          </span>
        </div>
        <h1 style="font-size: 30px; font-weight: 900; color: #0f172a; margin: 0 0 12px 0; line-height: 1.25;">
          ${escapeHtml(tip.title)}
        </h1>
        <p style="font-size: 16px; color: #334155; margin: 0; font-weight: 500;">
          <strong>Core Question:</strong> ${escapeHtml(tip.question)}
        </p>
      </header>

      <!-- Engineering Formula Card -->
      <section style="background: #0f172a; color: #f8fafc; border-radius: 14px; padding: 20px 24px; margin-bottom: 28px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #38bdf8; letter-spacing: 0.05em; margin-bottom: 6px;">
          Governing Physics Formula / Design Rule
        </div>
        <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 16px; font-weight: 700; color: #34d399; overflow-x: auto; padding: 4px 0;">
          ${escapeHtml(tip.formulaOrRule)}
        </div>
      </section>

      <!-- Executive Engineering Summary -->
      <section style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px 24px; margin-bottom: 28px;">
        <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 10px;">
          Executive Technical Summary
        </h2>
        <p style="font-size: 15px; color: #334155; margin: 0; line-height: 1.6;">
          ${escapeHtml(tip.summary)}
        </p>
      </section>

      <!-- In-Depth First-Principles Analysis -->
      <section style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px; margin-bottom: 28px;">
        <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px;">
          Detailed First-Principles Explanation
        </h2>
        <p style="font-size: 15px; color: #334155; margin: 0; line-height: 1.7;">
          ${escapeHtml(tip.explanation)}
        </p>
      </section>

      <!-- Critical Pitfall Alert -->
      <section style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 14px; padding: 20px 24px; margin-bottom: 28px;">
        <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #e11d48; margin-bottom: 6px;">
          Critical Field Pitfall &amp; Safety Warning
        </div>
        <p style="font-size: 14px; color: #9f1239; margin: 0; line-height: 1.6;">
          ${escapeHtml(tip.pitfall)}
        </p>
      </section>

      <!-- Cross-Resource Navigation Hub -->
      <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <a href="/calculator" style="display: inline-block; padding: 10px 18px; background: #059669; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 13px;">
          Use Solar System Sizer
        </a>
        <a href="/arena" style="display: inline-block; padding: 10px 18px; background: #0284c7; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 13px;">
          Compare Hardware on Arena
        </a>
        <a href="/handbook" style="display: inline-block; padding: 10px 18px; background: #475569; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 13px;">
          Browse All Engineering Guides
        </a>
      </div>
    </article>
    `;

    baseHtml = injectRootContent(baseHtml, prerenderBody);
  } else {
    const notFoundBody = `
    <div style="max-width: 600px; margin: 60px auto; text-align: center; font-family: sans-serif; padding: 0 20px;">
      <h1 style="font-size: 28px; font-weight: 800; color: #0f172a;">Handbook Guide Not Found</h1>
      <p style="color: #64748b; font-size: 15px; margin-bottom: 24px;">The requested technical engineering article does not exist or has been relocated.</p>
      <a href="/handbook" style="display: inline-block; padding: 10px 20px; background: #059669; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700;">Return to Solar Engineering Handbook</a>
    </div>
    `;
    baseHtml = injectRootContent(baseHtml, notFoundBody);
  }

  const html = injectHead(baseHtml, head.join('\n'));

  return new Response(html, {
    status: tip ? 200 : 404,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': tip ? 'public, max-age=0, s-maxage=86400' : 'no-cache, no-store',
    },
  });
};
