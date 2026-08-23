import type { Env, PagesFunction } from './_utils';
import { getOrigin } from './_utils';

export const onRequest: PagesFunction<Env> = async ({ request }) => {
  const origin = getOrigin(request);
  const nowIso = new Date().toISOString();

  const subSitemaps = [
    `${origin}/sitemaps/core.xml`,
    `${origin}/sitemaps/brands.xml`,
    `${origin}/sitemaps/panels-1.xml`,
    `${origin}/sitemaps/panels-2.xml`,
    `${origin}/sitemaps/inverters.xml`,
    `${origin}/sitemaps/batteries.xml`,
    `${origin}/sitemaps/compare-panels-1.xml`,
    `${origin}/sitemaps/compare-panels-2.xml`,
    `${origin}/sitemaps/compare-panels-3.xml`,
    `${origin}/sitemaps/compare-panels-4.xml`,
    `${origin}/sitemaps/compare-panels-5.xml`,
    `${origin}/sitemaps/compare-inverters.xml`,
    `${origin}/sitemaps/compare-batteries.xml`,
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...subSitemaps.map(
      (loc) => `  <sitemap>
    <loc>${loc}</loc>
    <lastmod>${nowIso}</lastmod>
  </sitemap>`
    ),
    '</sitemapindex>',
    '',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400',
    },
  });
};
