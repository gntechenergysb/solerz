import type { Env, PagesFunction } from '../_utils';
import { escapeHtml, fetchIndexHtml, getOrigin, injectHead, supabaseRestGet } from '../_utils';

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
  const slug = String((params as any).slug || '').trim();

  let baseHtml = await fetchIndexHtml(env, origin);

  // Remove existing SEO meta tags
  baseHtml = baseHtml.replace(/<title>[\s\S]*?<\/title>/i, '');
  baseHtml = baseHtml.replace(/<meta[^>]*name="description"[^>]*>/gi, '');
  baseHtml = baseHtml.replace(/<meta[^>]*property="og:[^>]*>/gi, '');
  baseHtml = baseHtml.replace(/<meta[^>]*property="twitter:[^>]*>/gi, '');
  baseHtml = baseHtml.replace(/<meta[^>]*name="twitter:[^>]*>/gi, '');

  let inverter: InverterRow | null = null;
  if (slug) {
    const { data } = await supabaseRestGet<InverterRow[]>(
      env,
      `inverters?slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`
    );
    inverter = (data && data[0]) || null;
  }

  const pacoKw = inverter
    ? inverter.paco_w >= 1000
      ? `${(inverter.paco_w / 1000).toFixed(1)} kW`
      : `${Math.round(inverter.paco_w)} W`
    : '';

  const title = inverter
    ? `${inverter.brand_name} ${inverter.model_name} (${pacoKw}) Specs & Datasheet | Solerz`
    : 'Solar Inverter Specifications & Datasheets | Solerz';

  const descParts: string[] = [];
  if (inverter) {
    descParts.push(`${pacoKw} Rated AC Output`);
    if (inverter.efficiency_pct) descParts.push(`${inverter.efficiency_pct.toFixed(1)}% Sandia Efficiency`);
    descParts.push(`Grid: ${Math.round(inverter.vac_v)}V`);
    descParts.push(`MPPT: ${Math.round(inverter.mppt_low_v)}–${Math.round(inverter.mppt_high_v)}V`);
    if (inverter.is_hybrid) descParts.push('Battery Hybrid');
  }

  const description = inverter
    ? `${inverter.brand_name} ${inverter.model_name} solar inverter technical datasheet: ${descParts.join(', ')}. Full AC grid output, MPPT voltage window, and Sandia .OND simulation parameters.`
    : 'Comprehensive solar inverter hardware specs database. String, micro, and battery storage inverters with full laboratory test protocols and Sandia simulation data.';

  const canonical = `${origin}/inverters/${encodeURIComponent(slug)}`;

  const head = [
    `<title>${escapeHtml(title)}</title>`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    ...(!inverter ? ['<meta name="robots" content="noindex, nofollow" />'] : []),
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

  if (inverter) {
    const jsonLd = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: `${inverter.brand_name} ${inverter.model_name}`,
      mpn: inverter.model_name,
      model: inverter.model_name,
      image: [`${origin}/theme_logo.png`],
      description,
      brand: {
        '@type': 'Brand',
        name: inverter.brand_name,
      },
      category: 'Solar Inverters',
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'Rated AC Power (Paco)', value: `${inverter.paco_w} W` },
        { '@type': 'PropertyValue', name: 'Max DC Voltage (Vdcmax)', value: `${inverter.vdcmax_v} V` },
        { '@type': 'PropertyValue', name: 'Max Continuous Current (Idcmax)', value: `${inverter.idcmax_a} A` },
        { '@type': 'PropertyValue', name: 'MPPT Voltage Low', value: `${inverter.mppt_low_v} V` },
        { '@type': 'PropertyValue', name: 'MPPT Voltage High', value: `${inverter.mppt_high_v} V` },
        ...(inverter.efficiency_pct
          ? [{ '@type': 'PropertyValue', name: 'Weighted Efficiency', value: `${inverter.efficiency_pct.toFixed(2)}%` }]
          : []),
      ],
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, item: { '@id': `${origin}/`, name: 'Home' } },
          { '@type': 'ListItem', position: 2, item: { '@id': `${origin}/inverters`, name: 'Inverters' } },
          { '@type': 'ListItem', position: 3, item: { '@id': canonical, name: inverter.model_name } },
        ],
      },
    };
    head.push(`<script type="application/ld+json">\n${JSON.stringify(jsonLd)}\n</script>`);

    // Hydration state injection for instant first-frame LCP performance
    head.push(`<script>window.__INITIAL_INVERTER__ = ${JSON.stringify(inverter)};</script>`);
  }

  const html = injectHead(baseHtml, head.join('\n'));

  return new Response(html, {
    status: inverter ? 200 : 404,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': inverter ? 'public, max-age=0, s-maxage=86400' : 'no-cache, no-store',
    },
  });
};
