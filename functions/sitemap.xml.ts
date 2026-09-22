import type { Env, PagesFunction } from './_utils';
import { getOrigin } from './_utils';

// =============================================================================
// Solerz Sitemap Index Generator
// =============================================================================
// ADSENSE_REVIEW_MODE: When TRUE, exposes only the highest-authority, 100% enriched
// core pages, hardware datasheets, handbook whitepapers, and curated comparison
// hubs. This protects the site from Google AdSense "Scaled Content Abuse" flags.
// Once AdSense is approved, set this to FALSE to expose all 21 sitemaps.
// =============================================================================
const ADSENSE_REVIEW_MODE = true;

export const onRequest: PagesFunction<Env> = async ({ request }) => {
  const origin = getOrigin(request);
  const nowIso = new Date().toISOString();

  const coreSitemaps = [
    `${origin}/sitemaps/core.xml`,
    `${origin}/sitemaps/handbook.xml`,
    `${origin}/sitemaps/brands.xml`,
    `${origin}/sitemaps/panels-1.xml`,
    `${origin}/sitemaps/inverters.xml`,
    `${origin}/sitemaps/batteries.xml`,
    `${origin}/sitemaps/compare-panels-1.xml`,
  ];

  const fullProgrammaticSitemaps = [
    `${origin}/sitemaps/panels-2.xml`,
    `${origin}/sitemaps/compare-panels-2.xml`,
    `${origin}/sitemaps/compare-panels-3.xml`,
    `${origin}/sitemaps/compare-panels-4.xml`,
    `${origin}/sitemaps/compare-panels-5.xml`,
    `${origin}/sitemaps/compare-panels-6.xml`,
    `${origin}/sitemaps/compare-panels-7.xml`,
    `${origin}/sitemaps/compare-panels-8.xml`,
    `${origin}/sitemaps/compare-panels-9.xml`,
    `${origin}/sitemaps/compare-panels-10.xml`,
    `${origin}/sitemaps/compare-panels-11.xml`,
    `${origin}/sitemaps/compare-panels-12.xml`,
    `${origin}/sitemaps/compare-inverters.xml`,
    `${origin}/sitemaps/compare-batteries.xml`,
  ];

  const subSitemaps = ADSENSE_REVIEW_MODE
    ? coreSitemaps
    : [...coreSitemaps, ...fullProgrammaticSitemaps];

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
