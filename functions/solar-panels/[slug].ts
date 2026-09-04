import type { Env, PagesFunction } from '../_utils';
import { escapeHtml, fetchIndexHtml, getOrigin, injectHead, supabaseRestGet } from '../_utils';

type PanelDetail = {
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
  length_m: number | null;
  width_m: number | null;
  weight_kg: number | null;
  warranty_product_years: number | null;
  warranty_power_years: number | null;
  created_at: string;
  updated_at: string;
};

export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  const origin = getOrigin(request);
  const slug = String((params as any).slug || '').trim();

  let baseHtml = await fetchIndexHtml(env, origin);

  // Remove existing SEO meta tags
  baseHtml = baseHtml.replace(/<title>[\s\S]*?<\/title>/i, '');
  baseHtml = baseHtml.replace(/<meta[^>]*name="description"[^>]*>/gi, '');
  baseHtml = baseHtml.replace(/<meta[^>]*property="og:[^>]*>/gi, '');
  baseHtml = baseHtml.replace(/<meta[^>]*property="twitter:[^>]*>/gi, '');
  baseHtml = baseHtml.replace(/<meta[^>]*name="twitter:[^>]*>/gi, '');

  let panel: PanelDetail | null = null;
  if (slug) {
    const { data } = await supabaseRestGet<PanelDetail[]>(
      env,
      `solar_panels?slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`
    );
    panel = (data && data[0]) || null;
  }

  const title = panel
    ? `${panel.brand_name} ${panel.model_name} (${Math.round(panel.pnom_w)}W) Specs & Datasheet | Solerz`
    : 'Solar Panel Specifications | Solerz';

  const descParts: string[] = [];
  if (panel) {
    descParts.push(`${Math.round(panel.pnom_w)}W STC Power`);
    if (panel.module_efficiency_pct) descParts.push(`${panel.module_efficiency_pct.toFixed(1)}% Efficiency`);
    if (panel.vmp_v && panel.imp_a) descParts.push(`Vmp: ${panel.vmp_v}V, Imp: ${panel.imp_a}A`);
    if (panel.is_bifacial) descParts.push('Bifacial');
    if (panel.warranty_product_years) descParts.push(`${panel.warranty_product_years}yr Warranty`);
  }

  const description = panel
    ? `${panel.brand_name} ${panel.model_name} technical datasheet: ${descParts.join(', ')}. Full electrical STC specs, temperature coefficients & physical dimensions on Solerz.`
    : 'Comprehensive photovoltaic module hardware specs database. Temperature coefficients, SDM parameters, and STC electrical data.';

  const canonical = `${origin}/solar-panels/${encodeURIComponent(slug)}`;

  const head = [
    `<title>${escapeHtml(title)}</title>`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    ...(!panel ? ['<meta name="robots" content="noindex, nofollow" />'] : []),
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

  if (panel) {
    const additionalProperties = [
      { '@type': 'PropertyValue', name: 'Rated Maximum Power (Pmax)', value: `${Math.round(panel.pnom_w)} W` },
      ...(panel.module_efficiency_pct
        ? [{ '@type': 'PropertyValue', name: 'Module Efficiency', value: `${panel.module_efficiency_pct.toFixed(1)}%` }]
        : []),
      { '@type': 'PropertyValue', name: 'Voltage at Pmax (Vmp)', value: `${panel.vmp_v} V` },
      { '@type': 'PropertyValue', name: 'Current at Pmax (Imp)', value: `${panel.imp_a} A` },
      { '@type': 'PropertyValue', name: 'Open-Circuit Voltage (Voc)', value: `${panel.voc_v} V` },
      { '@type': 'PropertyValue', name: 'Short-Circuit Current (Isc)', value: `${panel.isc_a} A` },
      { '@type': 'PropertyValue', name: 'Power Temperature Coefficient', value: `${panel.mu_pnom_spec_pct_c}%/°C` },
      ...(panel.length_m && panel.width_m
        ? [{ '@type': 'PropertyValue', name: 'Dimensions (L x W)', value: `${Math.round(panel.length_m * 1000)} x ${Math.round(panel.width_m * 1000)} mm` }]
        : []),
      ...(panel.weight_kg
        ? [{ '@type': 'PropertyValue', name: 'Weight', value: `${panel.weight_kg} kg` }]
        : []),
    ];

    const jsonLd = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: `${panel.brand_name} ${panel.model_name}`,
      mpn: panel.model_name,
      model: panel.model_name,
      image: [`${origin}/theme_logo.png`],
      description,
      brand: {
        '@type': 'Brand',
        name: panel.brand_name,
      },
      category: 'Solar Photovoltaic Panels',
      additionalProperty: additionalProperties,
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, item: { '@id': `${origin}/`, name: 'Home' } },
          { '@type': 'ListItem', position: 2, item: { '@id': `${origin}/solar-panels`, name: 'Solar Panels' } },
          { '@type': 'ListItem', position: 3, item: { '@id': canonical, name: panel.model_name } },
        ],
      },
    };
    head.push(`<script type="application/ld+json">\n${JSON.stringify(jsonLd)}\n</script>`);

    // Hydration state injection for instant first-frame LCP performance
    head.push(`<script>window.__INITIAL_PANEL__ = ${JSON.stringify(panel)};</script>`);
  }

  const html = injectHead(baseHtml, head.join('\n'));

  return new Response(html, {
    status: panel ? 200 : 404,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': panel ? 'public, max-age=0, s-maxage=86400' : 'no-cache, no-store',
    },
  });
};
