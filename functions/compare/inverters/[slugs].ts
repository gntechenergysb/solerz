import type { Env, PagesFunction } from '../../_utils';
import { escapeHtml, fetchIndexHtml, getOrigin, injectHead, supabaseRestGet } from '../../_utils';

type InverterRow = {
  id: string;
  slug: string;
  brand_name: string;
  model_name: string;
  inverter_type: string;
  vac_v: number;
  paco_w: number;
  pdco_w: number;
  vdco_v: number;
  vdcmax_v: number;
  idcmax_a: number;
  mppt_low_v: number;
  mppt_high_v: number;
  pso_w: number;
  pnt_w: number;
  efficiency_pct: number | null;
  is_hybrid: boolean;
  c0: number | null;
  c1: number | null;
  c2: number | null;
  c3: number | null;
  cec_cert_date: string | null;
};

export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  const origin = getOrigin(request);
  const slugsParam = String((params as any).slugs || '').trim();

  // Parse all slugs from the "slug1-vs-slug2-vs-slug3..." pattern
  const rawSlugs = slugsParam
    .split('-vs-')
    .map((s) => s.trim())
    .filter(Boolean);

  let baseHtml = await fetchIndexHtml(env, origin);

  // Remove existing SEO meta to prevent duplicates
  baseHtml = baseHtml.replace(/<title>[\s\S]*?<\/title>/i, '');
  baseHtml = baseHtml.replace(/<meta[^>]*name="description"[^>]*>/gi, '');
  baseHtml = baseHtml.replace(/<meta[^>]*property="og:[^>]*>/gi, '');
  baseHtml = baseHtml.replace(/<meta[^>]*property="twitter:[^>]*>/gi, '');
  baseHtml = baseHtml.replace(/<meta[^>]*name="twitter:[^>]*>/gi, '');

  let inverters: InverterRow[] = [];

  if (rawSlugs.length >= 2) {
    const inQuery = rawSlugs.map((s) => encodeURIComponent(s)).join(',');
    const { data } = await supabaseRestGet<InverterRow[]>(
      env,
      `inverters?slug=in.(${inQuery})&select=*`
    );
    if (data && data.length >= 2) {
      const map = new Map<string, InverterRow>();
      data.forEach((p) => map.set(p.slug, p));
      inverters = rawSlugs.map((s) => map.get(s)).filter((p): p is InverterRow => p !== undefined);
    }
  }

  // Canonical URL (alphabetically sorted slugs)
  const canonicalSlugs = [...rawSlugs].sort().join('-vs-');
  const canonical = `${origin}/compare/inverters/${encodeURIComponent(canonicalSlugs)}`;

  const modelNames = inverters.map((p) => p.model_name).join(' vs ');
  const title = inverters.length >= 2
    ? `${modelNames} — Solar Inverter Comparison | Solerz`
    : 'Solar Inverter Comparison | Solerz';

  const descDetails = inverters
    .map(
      (p) =>
        `${p.brand_name} ${p.model_name} (${p.paco_w >= 1000 ? (p.paco_w / 1000).toFixed(1) + 'kW' : Math.round(p.paco_w) + 'W'}${
          p.efficiency_pct ? `, ${p.efficiency_pct.toFixed(1)}% Eff` : ''
        })`
    )
    .join(' vs ');

  const description =
    inverters.length >= 2
      ? `Side-by-side comparison of ${descDetails}. Compare continuous AC power output, nominal voltage, MPPT operating range, Sandia efficiency, and standby losses on Solerz.`
      : 'Compare solar inverters side-by-side on Solerz. Continuous AC power, MPPT voltage windows, efficiency, and Sandia simulation data.';

  const head = [
    `<title>${escapeHtml(title)}</title>`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
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

  // Schema.org JSON-LD Structured Data for Technical Comparison
  if (inverters.length >= 2) {
    const jsonLd = {
      '@context': 'https://schema.org/',
      '@type': 'WebPage',
      name: title,
      url: canonical,
      description,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: inverters.length,
        itemListElement: inverters.map((p, idx) => ({
          '@type': 'Product',
          position: idx + 1,
          name: `${p.brand_name} ${p.model_name}`,
          mpn: p.model_name,
          model: p.model_name,
          image: [`${origin}/theme_logo.png`],
          brand: { '@type': 'Brand', name: p.brand_name },
          description: `${p.brand_name} ${p.model_name} ${p.paco_w >= 1000 ? (p.paco_w / 1000).toFixed(1) + 'kW' : Math.round(p.paco_w) + 'W'} Inverter with ${p.efficiency_pct ? p.efficiency_pct.toFixed(1) + '% Sandia efficiency' : 'high efficiency'}.`,
          additionalProperty: [
            { '@type': 'PropertyValue', name: 'Continuous AC Power', value: `${p.paco_w} W` },
            { '@type': 'PropertyValue', name: 'Grid Voltage', value: `${p.vac_v} V` },
            { '@type': 'PropertyValue', name: 'Max DC Voltage', value: `${p.vdcmax_v} V` },
          ],
        })),
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, item: { '@id': `${origin}/`, name: 'Home' } },
          { '@type': 'ListItem', position: 2, item: { '@id': `${origin}/inverters`, name: 'Inverters' } },
          { '@type': 'ListItem', position: 3, item: { '@id': canonical, name: modelNames } },
        ],
      },
    };
    head.push(`<script type="application/ld+json">\n${JSON.stringify(jsonLd)}\n</script>`);

    // Hydration state injection for instant first-frame LCP performance
    head.push(`<script>window.__INITIAL_INVERTERS__ = ${JSON.stringify(inverters)};</script>`);
  }

  const html = injectHead(baseHtml, head.join('\n'));

  return new Response(html, {
    status: inverters.length >= 2 ? 200 : 404,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': inverters.length >= 2 ? 'public, max-age=0, s-maxage=86400' : 'no-cache, no-store',
    },
  });
};
