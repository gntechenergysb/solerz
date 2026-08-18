import type { Env, PagesFunction } from './_utils';
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
  addUrl(`${origin}/inverters`, nowIso, 'daily', '0.9');

  // 2. Solar Panels Hardware Specs Detail Pages
  for (const r of rows) {
    const last = r.updated_at || r.created_at || nowIso;
    addUrl(`${origin}/solar-panels/${r.slug}`, last, 'monthly', '0.8');
  }

  // 3. Inverters Specs Detail Pages
  if (supabaseUrl && supabaseKey) {
    try {
      const invRes = await fetch(`${supabaseUrl}/rest/v1/inverters?select=slug,updated_at,created_at&is_active=eq.true&order=paco_w.desc&limit=3000`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Accept: 'application/json',
        },
      });
      if (invRes.ok) {
        const invRows = (await invRes.json().catch(() => [])) as PanelSitemapRow[];
        for (const r of invRows) {
          const last = r.updated_at || r.created_at || nowIso;
          addUrl(`${origin}/inverters/${r.slug}`, last, 'monthly', '0.8');
        }
      }
    } catch {}
  }

  // 4. Popular Head-to-Head Comparisons (Solar Panels & Inverters)
  const popularComparisons = [
    'ja-solar-ja-solar-jam72s30-545-mr-vs-longi-green-energy-technology-co-ltd-longi-green-energy-technology-co-ltd-lr5-72hph-555m',
    'sunpower-sunpower-spr-a410-vs-trina-solar-trina-solar-tsm-415ne09rc05',
    'elite-solar-elite-solar-et-n866tbh700gb-vs-seg-solar-inc-seg-solar-inc-seg-750-bhc-bg',
    'canadian-solar-canadian-solar-inc-cs6w-550ms-vs-longi-green-energy-technology-co-ltd-longi-green-energy-technology-co-ltd-lr5-72hph-550m',
    'jinko-solar-jinko-solar-co-ltd-jk纪录m-72hl4-tv-575-vs-ja-solar-ja-solar-jam72s30-575-mr',
  ];

  for (const compSlug of popularComparisons) {
    addUrl(`${origin}/compare/${compSlug}`, nowIso, 'weekly', '0.7');
  }

  // 5. Inverter Head-to-Head Comparisons
  if (supabaseUrl && supabaseKey) {
    try {
      const invPairRes = await fetch(`${supabaseUrl}/rest/v1/inverters?select=slug&is_active=eq.true&order=paco_w.desc&limit=20`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Accept: 'application/json',
        },
      });
      if (invPairRes.ok) {
        const invPairs = (await invPairRes.json().catch(() => [])) as PanelSitemapRow[];
        for (let i = 0; i < invPairs.length - 1; i += 2) {
          const s1 = invPairs[i].slug;
          const s2 = invPairs[i + 1].slug;
          const pairSlug = [s1, s2].sort().join('-vs-');
          addUrl(`${origin}/compare/inverters/${pairSlug}`, nowIso, 'weekly', '0.7');
        }
      }
    } catch {}
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
