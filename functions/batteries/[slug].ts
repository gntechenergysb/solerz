import type { Env, PagesFunction } from '../_utils';
import { escapeHtml, fetchIndexHtml, getOrigin, injectHead, supabaseRestGet } from '../_utils';

type BatteryRow = {
  id: string;
  slug: string;
  brand_name: string;
  model_name: string;
  battery_type: string;
  application_type: string;
  coupling_type: string;
  usable_capacity_kwh: number;
  nominal_capacity_kwh: number | null;
  continuous_power_kw: number;
  peak_power_kw: number | null;
  nominal_voltage_v: number;
  operating_voltage_min_v: number | null;
  operating_voltage_max_v: number | null;
  max_continuous_current_a: number | null;
  round_trip_efficiency_pct: number;
  depth_of_discharge_pct: number | null;
  cycle_life_count: number | null;
  warranty_years: number | null;
  max_parallel_units: number | null;
  ip_rating: string | null;
  weight_kg: number | null;
  dimensions_mm: string | null;
  certifications: string | null;
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

  let battery: BatteryRow | null = null;
  if (slug) {
    const { data } = await supabaseRestGet<BatteryRow[]>(
      env,
      `batteries?slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`
    );
    battery = (data && data[0]) || null;
  }

  const title = battery
    ? `${battery.brand_name} ${battery.model_name} (${battery.usable_capacity_kwh} kWh) Specs & Datasheet | Solerz`
    : 'Battery Energy Storage Systems (BESS) Specs & Datasheets | Solerz';

  const descParts: string[] = [];
  if (battery) {
    descParts.push(`${battery.usable_capacity_kwh} kWh Usable Capacity`);
    descParts.push(`${battery.continuous_power_kw} kW Continuous Power`);
    descParts.push(`${battery.round_trip_efficiency_pct.toFixed(1)}% RTE`);
    descParts.push(`${battery.nominal_voltage_v}V Architecture`);
    descParts.push(`${battery.battery_type} Chemistry`);
  }

  const description = battery
    ? `${battery.brand_name} ${battery.model_name} technical specifications: ${descParts.join(', ')}. Complete BESS datasheet on Solerz.`
    : 'Browse certified residential, commercial, and off-grid battery energy storage systems (BESS) specifications and datasheets.';

  const canonicalUrl = slug
    ? `${origin}/batteries/${encodeURIComponent(slug)}`
    : `${origin}/batteries`;

  // Schema.org Product JSON-LD
  const schemaJson = battery
    ? JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: `${battery.brand_name} ${battery.model_name}`,
        mpn: battery.model_name,
        model: battery.model_name,
        image: [`${origin}/theme_logo.png`],
        brand: { '@type': 'Brand', name: battery.brand_name },
        description: description,
        category: 'Battery Energy Storage Systems (BESS)',
        additionalProperty: [
          {
            '@type': 'PropertyValue',
            name: 'Usable Energy Capacity',
            value: `${battery.usable_capacity_kwh} kWh`,
          },
          {
            '@type': 'PropertyValue',
            name: 'Continuous Power Output',
            value: `${battery.continuous_power_kw} kW`,
          },
          {
            '@type': 'PropertyValue',
            name: 'Round-Trip Efficiency',
            value: `${battery.round_trip_efficiency_pct.toFixed(1)}%`,
          },
          {
            '@type': 'PropertyValue',
            name: 'Battery Chemistry',
            value: battery.battery_type,
          },
          {
            '@type': 'PropertyValue',
            name: 'Nominal DC Voltage',
            value: `${battery.nominal_voltage_v} V`,
          },
        ],
      })
    : null;

  const headInjections = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    `<meta property="og:image" content="${origin}/theme_logo.png" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${origin}/theme_logo.png" />`,
  ];

  if (schemaJson) {
    headInjections.push(
      `<script type="application/ld+json">${schemaJson}</script>`
    );
  }

  // Hydrate initial state
  if (battery) {
    headInjections.push(
      `<script>window.__INITIAL_BATTERY__ = ${JSON.stringify(battery)};</script>`
    );
  }

  const finalHtml = injectHead(baseHtml, headInjections.join('\n  '));

  return new Response(finalHtml, {
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400',
    },
  });
};
