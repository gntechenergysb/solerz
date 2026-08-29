import type { Env, PagesFunction } from '../_utils';
import { escapeHtml, fetchIndexHtml, getOrigin, injectHead } from '../_utils';
import { SOLAR_GUIDES } from '../../data/guidesData';

export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  const origin = getOrigin(request);
  const slug = String((params as any).slug || '').trim();

  let baseHtml = await fetchIndexHtml(env, origin);

  // Remove default meta tags
  baseHtml = baseHtml.replace(/<title>[\s\S]*?<\/title>/i, '');
  baseHtml = baseHtml.replace(/<meta[^>]*name="description"[^>]*>/gi, '');
  baseHtml = baseHtml.replace(/<meta[^>]*property="og:[^>]*>/gi, '');
  baseHtml = baseHtml.replace(/<meta[^>]*property="twitter:[^>]*>/gi, '');
  baseHtml = baseHtml.replace(/<meta[^>]*name="twitter:[^>]*>/gi, '');

  const guide = SOLAR_GUIDES.find((g) => g.slug === slug);

  const title = guide
    ? `${guide.title} | Solerz Engineering Guides`
    : 'Solar Photovoltaic Engineering Guides & Research | Solerz';

  const description = guide
    ? guide.metaDescription
    : 'Comprehensive photovoltaic engineering research, cell physics comparisons, inverter sizing formulas, and battery storage chemistry guides.';

  const canonical = `${origin}/guides/${encodeURIComponent(slug)}`;

  const head = [
    `<title>${escapeHtml(title)}</title>`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    ...(!guide ? ['<meta name="robots" content="noindex, nofollow" />'] : []),
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

  if (guide) {
    const jsonLd = {
      '@context': 'https://schema.org/',
      '@type': 'TechArticle',
      headline: guide.title,
      description: guide.metaDescription,
      author: {
        '@type': 'Person',
        name: guide.author.name,
        jobTitle: guide.author.role,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Solerz',
        url: origin,
      },
      datePublished: guide.publishedAt,
      dateModified: guide.updatedAt,
      mainEntityOfPage: canonical,
    };

    head.push(`<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`);
  }

  return new Response(injectHead(baseHtml, head.join('\n')), {
    status: guide ? 200 : 404,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': guide ? 'public, max-age=0, s-maxage=86400' : 'no-cache, no-store',
    },
  });
};
