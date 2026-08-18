import type { Env } from './_utils';
import { getOrigin } from './_utils';

type PanelSitemapRow = {
  slug: string;
  updated_at?: string;
  created_at?: string;
};

const xmlEscape = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const origin = getOrigin(request);
  const nowIso = new Date().toISOString();

  // Paginate through active solar panels to generate comprehensive sitemap
  const pageSize = 1000;
  const maxTotal = 15000;
  let from = 0;
  let rows: PanelSitemapRow[] = [];

  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const supabaseKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '';

  if (supabaseUrl && supabaseKey) {
    while (rows.length < maxTotal) {
      const to = from + pageSize - 1;

      const q = new URLSearchParams({
        select: 'slug,updated_at,created_at',
        is_active: 'eq.true',
        order: 'pnom_w.desc',
      });

      const url = `solar_panels?${q.toString()}`;

      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/${url}`, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            Accept: 'application/json',
            Range: `${from}-${to}`,
          },
        });

        if (!res.ok) break;

        const batch = (await res.json().catch(() => [])) as PanelSitemapRow[];
        if (!batch.length) break;

        rows = rows.concat(batch);
        from += pageSize;
      } catch {
        break;
      }
    }
  }

  const urls: string[] = [];
  const addUrl = (loc: string, lastmod?: string, changefreq = 'weekly', priority = '0.8') => {
    urls.push(
      [
        '  <url>',
        `    <loc>${xmlEscape(loc)}</loc>`,
        lastmod ? `    <lastmod>${xmlEscape(lastmod)}</lastmod>` : '',
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n')
    );
  };

  // 1. Core Platform Pages
  addUrl(`${origin}/`, nowIso, 'daily', '1.0');
  addUrl(`${origin}/solar-panels`, nowIso, 'daily', '0.9');

  // 2. Hardware Specs Detail Pages
  for (const r of rows) {
    const last = r.updated_at || r.created_at || nowIso;
    addUrl(`${origin}/solar-panels/${r.slug}`, last, 'monthly', '0.8');
  }

  // 3. Featured / Top Power Tier Comparisons
  const popularComparisons = [
    'longi-green-energy-technology-co---ltd--longi-lr5-72hph-555m-vs-ja-solar-jam72s30-545-mr',
    'canadian-solar-inc--cs6r-420ms-vs-trina-solar-co---ltd-tsm-de09r-08-420',
    'rec-group-rec430aa-pure-r-vs-sunpower-corporation-spr-max5-420-com',
  ];

  for (const compSlug of popularComparisons) {
    addUrl(`${origin}/compare/${compSlug}`, nowIso, 'weekly', '0.7');
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      // Cache sitemap at the edge for 24 hours
      'Cache-Control': 'public, max-age=0, s-maxage=86400',
    },
  });
};
