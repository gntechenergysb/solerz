import type { Env, PagesFunction } from '../_utils';
import { getOrigin } from '../_utils';

type SimpleRow = {
  slug: string;
  brand_name?: string;
  brand_id?: string;
  pnom_w?: number;
  paco_w?: number;
  usable_capacity_kwh?: number;
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

export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  const origin = getOrigin(request);
  const nowIso = new Date().toISOString();
  const rawName = String((params as any).name || '').trim();
  const name = rawName.endsWith('.xml') ? rawName.slice(0, -4) : rawName;

  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const supabaseKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '';

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

  // -------------------------------------------------------------------------
  // 1. Core Pages & Hubs
  // -------------------------------------------------------------------------
  if (name === 'core') {
    addUrl(`${origin}/`, nowIso, 'daily', '1.0');
    addUrl(`${origin}/solar-panels`, nowIso, 'daily', '0.9');
    addUrl(`${origin}/inverters`, nowIso, 'daily', '0.9');
    addUrl(`${origin}/batteries`, nowIso, 'daily', '0.9');
    addUrl(`${origin}/brands`, nowIso, 'daily', '0.9');
  }

  // -------------------------------------------------------------------------
  // 2. Global 437 Brands Hubs
  // -------------------------------------------------------------------------
  else if (name === 'brands') {
    if (supabaseUrl && supabaseKey) {
      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/brands?select=slug,created_at&order=name.asc&limit=1000`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              Accept: 'application/json',
            },
          }
        );
        if (res.ok) {
          const rows = (await res.json().catch(() => [])) as SimpleRow[];
          for (const r of rows) {
            addUrl(`${origin}/brands/${r.slug}`, nowIso, 'weekly', '0.8');
          }
        }
      } catch {}
    }
  }

  // -------------------------------------------------------------------------
  // 3. Solar Panels Catalog (Paginated by 12k)
  // -------------------------------------------------------------------------
  else if (name === 'panels' || name === 'panels-1' || name === 'panels-2') {
    const offset = name === 'panels-2' ? 12000 : 0;
    const limit = 12000;

    if (supabaseUrl && supabaseKey) {
      let from = offset;
      const pageSize = 1000;
      let totalFetched = 0;

      while (totalFetched < limit) {
        const to = from + pageSize - 1;
        try {
          const res = await fetch(
            `${supabaseUrl}/rest/v1/solar_panels?select=slug,updated_at,created_at&is_active=eq.true&order=pnom_w.desc`,
            {
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                Accept: 'application/json',
                Range: `${from}-${to}`,
              },
            }
          );
          if (!res.ok) break;
          const batch = (await res.json().catch(() => [])) as SimpleRow[];
          if (!batch.length) break;

          for (const r of batch) {
            const last = r.updated_at || r.created_at || nowIso;
            addUrl(`${origin}/solar-panels/${r.slug}`, last, 'monthly', '0.8');
          }

          totalFetched += batch.length;
          from += pageSize;
          if (batch.length < pageSize) break;
        } catch {
          break;
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // 4. Inverters Catalog
  // -------------------------------------------------------------------------
  else if (name === 'inverters') {
    if (supabaseUrl && supabaseKey) {
      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/inverters?select=slug,updated_at,created_at&is_active=eq.true&order=paco_w.desc&limit=5000`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              Accept: 'application/json',
            },
          }
        );
        if (res.ok) {
          const rows = (await res.json().catch(() => [])) as SimpleRow[];
          for (const r of rows) {
            const last = r.updated_at || r.created_at || nowIso;
            addUrl(`${origin}/inverters/${r.slug}`, last, 'monthly', '0.8');
          }
        }
      } catch {}
    }
  }

  // -------------------------------------------------------------------------
  // 5. Battery Storage Systems Catalog
  // -------------------------------------------------------------------------
  else if (name === 'batteries') {
    if (supabaseUrl && supabaseKey) {
      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/batteries?select=slug,updated_at,created_at&is_active=eq.true&order=usable_capacity_kwh.desc&limit=500`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              Accept: 'application/json',
            },
          }
        );
        if (res.ok) {
          const rows = (await res.json().catch(() => [])) as SimpleRow[];
          for (const r of rows) {
            const last = r.updated_at || r.created_at || nowIso;
            addUrl(`${origin}/batteries/${r.slug}`, last, 'monthly', '0.8');
          }
        }
      } catch {}
    }
  }

  // -------------------------------------------------------------------------
  // 6. Versus-Style Solar Panels Comparisons Matrix (Massive Expansion)
  // -------------------------------------------------------------------------
  else if (name.startsWith('compare-panels')) {
    const isBatch1 = name === 'compare-panels-1'; // Utility 540W ~ 735W
    const isBatch2 = name === 'compare-panels-2'; // Commercial 460W ~ 535W
    const isBatch3 = name === 'compare-panels-3'; // Residential 400W ~ 455W
    const isBatch4 = name === 'compare-panels-4'; // Small/Off-grid 300W ~ 395W
    const isBatch5 = name === 'compare-panels-5'; // Cross-Wattage Battles (e.g. 700W vs 650W, 600W vs 550W)

    if (supabaseUrl && supabaseKey) {
      if (isBatch5) {
        // Cross-Wattage Major Battles (Versus.com style)
        const crossPairs = [
          [700, 650],
          [680, 630],
          [650, 600],
          [600, 550],
          [585, 550],
          [550, 500],
          [500, 450],
          [450, 400],
        ];

        for (const [wA, wB] of crossPairs) {
          try {
            const [resA, resB] = await Promise.all([
              fetch(`${supabaseUrl}/rest/v1/solar_panels?select=slug,brand_id,pnom_w&is_active=eq.true&pnom_w=gte.${wA - 5}&pnom_w=lte.${wA + 5}&order=module_efficiency_pct.desc.nullslast&limit=25`, {
                headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, Accept: 'application/json' },
              }),
              fetch(`${supabaseUrl}/rest/v1/solar_panels?select=slug,brand_id,pnom_w&is_active=eq.true&pnom_w=gte.${wB - 5}&pnom_w=lte.${wB + 5}&order=module_efficiency_pct.desc.nullslast&limit=25`, {
                headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, Accept: 'application/json' },
              }),
            ]);

            if (resA.ok && resB.ok) {
              const listA = (await resA.json().catch(() => [])) as SimpleRow[];
              const listB = (await resB.json().catch(() => [])) as SimpleRow[];

              for (const a of listA) {
                for (const b of listB) {
                  if (a.brand_id !== b.brand_id && a.slug !== b.slug) {
                    const pairSlug = [a.slug, b.slug].sort().join('-vs-');
                    addUrl(`${origin}/compare/${pairSlug}`, nowIso, 'weekly', '0.7');
                  }
                }
              }
            }
          } catch {}
        }
      } else {
        const brackets = isBatch1
          ? [540, 545, 550, 555, 560, 570, 575, 580, 585, 590, 600, 620, 650, 660, 670, 700, 715, 730]
          : isBatch2
          ? [460, 465, 470, 475, 480, 485, 490, 495, 500, 505, 510, 515, 520, 525, 530, 535]
          : isBatch3
          ? [400, 405, 410, 415, 420, 425, 430, 435, 440, 445, 450, 455]
          : [300, 310, 320, 330, 340, 350, 360, 370, 380, 390];

        for (const w of brackets) {
          try {
            const res = await fetch(
              `${supabaseUrl}/rest/v1/solar_panels?select=slug,brand_id,pnom_w&is_active=eq.true&pnom_w=gte.${w - 5}&pnom_w=lte.${w + 5}&order=module_efficiency_pct.desc.nullslast&limit=30`,
              {
                headers: {
                  apikey: supabaseKey,
                  Authorization: `Bearer ${supabaseKey}`,
                  Accept: 'application/json',
                },
              }
            );
            if (res.ok) {
              const list = (await res.json().catch(() => [])) as SimpleRow[];
              for (let i = 0; i < list.length; i++) {
                for (let j = i + 1; j < list.length; j++) {
                  if (list[i].brand_id !== list[j].brand_id) {
                    const pairSlug = [list[i].slug, list[j].slug].sort().join('-vs-');
                    addUrl(`${origin}/compare/${pairSlug}`, nowIso, 'weekly', '0.7');
                  }
                }
              }
            }
          } catch {}
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // 7. Inverter Comparisons Matrix
  // -------------------------------------------------------------------------
  else if (name === 'compare-inverters') {
    const inverterPowerKW = [3, 5, 6, 8, 10, 12, 15, 20, 25, 30, 50, 100, 110, 125, 250, 330];
    if (supabaseUrl && supabaseKey) {
      for (const kw of inverterPowerKW) {
        try {
          const res = await fetch(
            `${supabaseUrl}/rest/v1/inverters?select=slug,brand_id,paco_w&is_active=eq.true&paco_w=gte.${(kw - 1) * 1000}&paco_w=lte.${(kw + 1) * 1000}&limit=20`,
            {
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                Accept: 'application/json',
              },
            }
          );
          if (res.ok) {
            const list = (await res.json().catch(() => [])) as SimpleRow[];
            for (let i = 0; i < list.length; i++) {
              for (let j = i + 1; j < list.length; j++) {
                if (list[i].brand_id !== list[j].brand_id) {
                  const pairSlug = [list[i].slug, list[j].slug].sort().join('-vs-');
                  addUrl(`${origin}/compare/inverters/${pairSlug}`, nowIso, 'weekly', '0.7');
                }
              }
            }
          }
        } catch {}
      }
    }
  }

  // -------------------------------------------------------------------------
  // 8. Battery Storage System Comparisons Matrix
  // -------------------------------------------------------------------------
  else if (name === 'compare-batteries') {
    if (supabaseUrl && supabaseKey) {
      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/batteries?select=slug,brand_id,nominal_capacity_kwh&is_active=eq.true&order=usable_capacity_kwh.desc&limit=50`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              Accept: 'application/json',
            },
          }
        );
        if (res.ok) {
          const list = (await res.json().catch(() => [])) as SimpleRow[];
          for (let i = 0; i < list.length; i++) {
            for (let j = i + 1; j < list.length; j++) {
              const pairSlug = [list[i].slug, list[j].slug].sort().join('-vs-');
              addUrl(`${origin}/compare/batteries/${pairSlug}`, nowIso, 'weekly', '0.7');
            }
          }
        }
      } catch {}
    }
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
      'Cache-Control': 'public, max-age=0, s-maxage=86400',
    },
  });
};
