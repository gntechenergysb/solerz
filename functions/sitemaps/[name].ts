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
    addUrl(`${origin}/calculator`, nowIso, 'daily', '0.9');
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
  // 6. Versus-Style Solar Panels Comparisons Matrix (100k+ Super Matrix)
  // -------------------------------------------------------------------------
  else if (name.startsWith('compare-panels')) {
    if (supabaseUrl && supabaseKey) {
      // 1) Direct Wattage Brackets (Batches 1 ~ 7)
      const bracketMap: Record<string, number[]> = {
        'compare-panels-1': [600, 620, 650, 660, 670, 680, 690, 700, 715, 730, 740, 750, 755], // 600W ~ 755W Utility Superheavy
        'compare-panels-2': [540, 545, 550, 555, 560, 565, 570, 575, 580, 585, 590, 595],       // 540W ~ 595W Utility Standard
        'compare-panels-3': [480, 485, 490, 495, 500, 505, 510, 515, 520, 525, 530, 535],       // 480W ~ 535W C&I Mid
        'compare-panels-4': [420, 425, 430, 435, 440, 445, 450, 455, 460, 465, 470, 475],       // 420W ~ 475W Residential High
        'compare-panels-5': [360, 365, 370, 375, 380, 385, 390, 395, 400, 405, 410, 415],       // 360W ~ 415W Residential Standard
        'compare-panels-6': [300, 305, 310, 315, 320, 325, 330, 335, 340, 345, 350, 355],       // 300W ~ 355W Small/Commercial
        'compare-panels-7': [100, 150, 180, 200, 220, 240, 250, 260, 270, 280, 290, 295],       // 100W ~ 295W Offgrid/Legacy
      };

      if (bracketMap[name]) {
        const brackets = bracketMap[name];
        for (const w of brackets) {
          try {
            const res = await fetch(
              `${supabaseUrl}/rest/v1/solar_panels?select=slug,brand_id,pnom_w&is_active=eq.true&pnom_w=gte.${w - 4}&pnom_w=lte.${w + 4}&order=module_efficiency_pct.desc.nullslast&limit=40`,
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

      // 2) Cross-Wattage Major Battles (Batches 8 ~ 10)
      else if (name === 'compare-panels-8' || name === 'compare-panels-9' || name === 'compare-panels-10') {
        const crossPairs =
          name === 'compare-panels-8'
            ? [
                [750, 700], [700, 650], [680, 630], [650, 600], [620, 580],
                [600, 550], [580, 540], [550, 500], [540, 480], [500, 450],
              ]
            : name === 'compare-panels-9'
            ? [
                [550, 400], [550, 450], [500, 400], [480, 400], [450, 400],
                [450, 350], [420, 350], [400, 350], [400, 300], [350, 300],
              ]
            : [
                [700, 500], [700, 400], [650, 500], [650, 400], [600, 450],
                [600, 400], [600, 350], [550, 350], [550, 300], [500, 250],
              ];

        for (const [wA, wB] of crossPairs) {
          try {
            const [resA, resB] = await Promise.all([
              fetch(
                `${supabaseUrl}/rest/v1/solar_panels?select=slug,brand_id,pnom_w&is_active=eq.true&pnom_w=gte.${wA - 5}&pnom_w=lte.${wA + 5}&order=module_efficiency_pct.desc.nullslast&limit=35`,
                {
                  headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, Accept: 'application/json' },
                }
              ),
              fetch(
                `${supabaseUrl}/rest/v1/solar_panels?select=slug,brand_id,pnom_w&is_active=eq.true&pnom_w=gte.${wB - 5}&pnom_w=lte.${wB + 5}&order=module_efficiency_pct.desc.nullslast&limit=35`,
                {
                  headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, Accept: 'application/json' },
                }
              ),
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
      }

      // 3) Global Tier-1 Brand Battles (Batch 11)
      else if (name === 'compare-panels-11') {
        const brandWattages = [700, 660, 600, 580, 550, 500, 450, 430, 410, 400];
        for (const w of brandWattages) {
          try {
            const res = await fetch(
              `${supabaseUrl}/rest/v1/solar_panels?select=slug,brand_id,pnom_w&is_active=eq.true&pnom_w=gte.${w - 10}&pnom_w=lte.${w + 10}&order=pnom_w.desc&limit=45`,
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

      // 4) Bifacial vs Monofacial Cross-Architecture Battles (Batch 12)
      else if (name === 'compare-panels-12') {
        const techWattages = [680, 650, 620, 590, 570, 540, 520, 480, 440, 420, 380];
        for (const w of techWattages) {
          try {
            const [resBifacial, resMono] = await Promise.all([
              fetch(
                `${supabaseUrl}/rest/v1/solar_panels?select=slug,brand_id,pnom_w&is_active=eq.true&is_bifacial=eq.true&pnom_w=gte.${w - 8}&pnom_w=lte.${w + 8}&limit=35`,
                {
                  headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, Accept: 'application/json' },
                }
              ),
              fetch(
                `${supabaseUrl}/rest/v1/solar_panels?select=slug,brand_id,pnom_w&is_active=eq.true&is_bifacial=eq.false&pnom_w=gte.${w - 8}&pnom_w=lte.${w + 8}&limit=35`,
                {
                  headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, Accept: 'application/json' },
                }
              ),
            ]);

            if (resBifacial.ok && resMono.ok) {
              const listA = (await resBifacial.json().catch(() => [])) as SimpleRow[];
              const listB = (await resMono.json().catch(() => [])) as SimpleRow[];

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
