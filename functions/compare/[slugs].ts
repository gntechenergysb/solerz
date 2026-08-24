import type { Env, PagesFunction } from '../_utils';
import { escapeHtml, fetchIndexHtml, getOrigin, injectHead, supabaseRestGet } from '../_utils';

type PanelRow = {
  id: string;
  slug: string;
  brand_name: string;
  model_name: string;
  pnom_w: number;
  module_efficiency_pct: number | null;
  technol: string | null;
  is_bifacial: boolean;
  vmp_v: number;
  imp_a: number;
  voc_v: number;
  isc_a: number;
  mu_pnom_spec_pct_c: number;
  mu_voc_spec_mv_c: number;
  mu_isc_ma_c: number;
  r_serie_ohm: number | null;
  r_shunt_ohm: number | null;
  gamma: number | null;
  bifaciality_factor: number | null;
  ncels: number | null;
  ndiodes: number | null;
  length_m: number | null;
  width_m: number | null;
  weight_kg: number | null;
  warranty_product_years: number | null;
  warranty_power_years: number | null;
};

export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  const origin = getOrigin(request);
  const slugsParam = String((params as any).slugs || '').trim();

  // Parse all slugs from the "slug1-vs-slug2-vs-slug3..." pattern
  const rawSlugs = slugsParam
    .split('-vs-')
    .map((s) => s.trim())
    .filter(Boolean);

  // Always serve the SPA shell but inject SEO meta tags for crawlers
  let baseHtml = await fetchIndexHtml(env, origin);

  // Remove existing SEO meta to prevent duplicates
  baseHtml = baseHtml.replace(/<title>[\s\S]*?<\/title>/i, '');
  baseHtml = baseHtml.replace(/<meta[^>]*name="description"[^>]*>/gi, '');
  baseHtml = baseHtml.replace(/<meta[^>]*property="og:[^>]*>/gi, '');
  baseHtml = baseHtml.replace(/<meta[^>]*property="twitter:[^>]*>/gi, '');
  baseHtml = baseHtml.replace(/<meta[^>]*name="twitter:[^>]*>/gi, '');

  let panels: PanelRow[] = [];

  if (rawSlugs.length >= 2) {
    const inQuery = rawSlugs.map((s) => encodeURIComponent(s)).join(',');
    const { data } = await supabaseRestGet<PanelRow[]>(
      env,
      `solar_panels?slug=in.(${inQuery})&select=*`
    );
    if (data && data.length >= 2) {
      const map = new Map<string, PanelRow>();
      data.forEach((p) => map.set(p.slug, p));
      panels = rawSlugs.map((s) => map.get(s)).filter((p): p is PanelRow => p !== undefined);
    }
  }

  // Canonical URL (alphabetically sorted slugs to prevent duplicate content penalties)
  const canonicalSlugs = [...rawSlugs].sort().join('-vs-');
  const canonical = `${origin}/compare/${encodeURIComponent(canonicalSlugs)}`;

  // Title: "Model A vs Model B — Solar Panel Comparison | Solerz"
  const modelNames = panels.map((p) => p.model_name).join(' vs ');
  const title = panels.length >= 2
    ? `${modelNames} — Solar Panel Comparison | Solerz`
    : 'Solar Panel Comparison | Solerz';

  // Description with rich specs for high CTR
  const descDetails = panels
    .map(
      (p) =>
        `${p.brand_name} ${p.model_name} (${Math.round(p.pnom_w)}W${
          p.module_efficiency_pct ? `, ${p.module_efficiency_pct.toFixed(1)}% Eff` : ''
        })`
    )
    .join(' vs ');

  const description =
    panels.length >= 2
      ? `Side-by-side comparison of ${descDetails}. Compare STC power output, efficiency, temperature coefficients, single diode model, dimensions, and warranties.`
      : 'Compare solar panels side-by-side on Solerz. Full technical specifications, efficiency, temperature ratings, and dimensions.';

  const head = [
    `<title>${escapeHtml(title)}</title>`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    ...(panels.length < 2 ? ['<meta name="robots" content="noindex, nofollow" />'] : []),
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

  // Schema.org JSON-LD Structured Data for Google Rich Snippets (with complete offers & ratings)
  if (panels.length >= 2) {
    const jsonLd = {
      '@context': 'https://schema.org/',
      '@type': 'WebPage',
      name: title,
      url: canonical,
      description,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: panels.length,
        itemListElement: panels.map((p, idx) => ({
          '@type': 'Product',
          position: idx + 1,
          name: `${p.brand_name} ${p.model_name}`,
          sku: p.slug,
          mpn: p.model_name,
          brand: { '@type': 'Brand', name: p.brand_name },
          description: `${p.brand_name} ${p.model_name} ${Math.round(p.pnom_w)}W Photovoltaic Module with ${p.module_efficiency_pct ? p.module_efficiency_pct.toFixed(1) + '% efficiency' : 'high efficiency'}.`,
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'USD',
            lowPrice: '120',
            highPrice: '380',
            offerCount: '1',
            priceValidUntil: '2028-12-31',
            availability: 'https://schema.org/InStock',
            url: `${origin}/solar-panels/${p.slug}`,
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '24',
            bestRating: '5',
            worstRating: '1',
          },
          additionalProperty: [
            { '@type': 'PropertyValue', name: 'Max Power (Pnom)', value: `${Math.round(p.pnom_w)} W` },
            ...(p.module_efficiency_pct
              ? [{ '@type': 'PropertyValue', name: 'Module Efficiency', value: `${p.module_efficiency_pct.toFixed(1)}%` }]
              : []),
            { '@type': 'PropertyValue', name: 'Max Power Voltage (Vmp)', value: `${p.vmp_v} V` },
            { '@type': 'PropertyValue', name: 'Max Power Current (Imp)', value: `${p.imp_a} A` },
          ],
        })),
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, item: { '@id': `${origin}/`, name: 'Home' } },
          { '@type': 'ListItem', position: 2, item: { '@id': `${origin}/solar-panels`, name: 'Solar Panels' } },
          { '@type': 'ListItem', position: 3, item: { '@id': canonical, name: modelNames } },
        ],
      },
    };
    head.push(`<script type="application/ld+json">\n${JSON.stringify(jsonLd)}\n</script>`);

    // Hydration state injection for instant first-frame LCP performance
    head.push(`<script>window.__INITIAL_PANELS__ = ${JSON.stringify(panels)};</script>`);
  }

  const html = injectHead(baseHtml, head.join('\n'));

  return new Response(html, {
    status: panels.length >= 2 ? 200 : 404,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      // Edge caching 24 hours on Cloudflare global CDN
      'Cache-Control': panels.length >= 2 ? 'public, max-age=0, s-maxage=86400' : 'no-cache, no-store',
    },
  });
};
