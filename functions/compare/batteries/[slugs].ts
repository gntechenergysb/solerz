import type { Env, PagesFunction } from '../../_utils';
import { escapeHtml, fetchIndexHtml, getOrigin, injectHead, supabaseRestGet } from '../../_utils';

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
  const rawSlugs = String((params as any).slugs || '').trim();

  let baseHtml = await fetchIndexHtml(env, origin);

  // Strip template meta tags
  baseHtml = baseHtml.replace(/<title>[\s\S]*?<\/title>/i, '');
  baseHtml = baseHtml.replace(/<meta[^>]*name="description"[^>]*>/gi, '');
  baseHtml = baseHtml.replace(/<meta[^>]*property="og:[^>]*>/gi, '');
  baseHtml = baseHtml.replace(/<meta[^>]*property="twitter:[^>]*>/gi, '');
  baseHtml = baseHtml.replace(/<meta[^>]*name="twitter:[^>]*>/gi, '');

  const slugList = rawSlugs
    .split('-vs-')
    .map((s) => s.trim())
    .filter(Boolean);

  let batteries: BatteryRow[] = [];

  if (slugList.length >= 2) {
    const formattedIn = `(${slugList.map((s) => `"${s}"`).join(',')})`;
    const { data } = await supabaseRestGet<BatteryRow[]>(
      env,
      `batteries?slug=in.${encodeURIComponent(formattedIn)}&select=*`
    );

    if (data && data.length > 0) {
      const map = new Map<string, BatteryRow>();
      data.forEach((b) => map.set(b.slug, b));
      batteries = slugList
        .map((s) => map.get(s))
        .filter((b): b is BatteryRow => b !== undefined);
    }
  }

  // Canonicalize URL
  const canonicalSlugs = [...slugList].sort().join('-vs-');
  const canonicalUrl = `${origin}/compare/batteries/${encodeURIComponent(canonicalSlugs)}`;

  // Construct Dynamic Titles
  let title = 'Battery Storage System Comparison | Solerz';
  let description =
    'Side-by-side technical comparison of battery energy storage systems (BESS). Compare usable kWh capacity, continuous kW power, round-trip efficiency, and cycle life.';

  if (batteries.length >= 2) {
    const names = batteries.map((b) => `${b.brand_name} ${b.model_name}`).join(' vs ');
    title = `${names} | Battery Systems Comparison | Solerz`;

    const details = batteries
      .map(
        (b) =>
          `${b.brand_name} ${b.model_name} (${b.usable_capacity_kwh}kWh, ${b.continuous_power_kw}kW, ${b.round_trip_efficiency_pct.toFixed(1)}% RTE)`
      )
      .join(' vs ');

    description = `Side-by-side comparison of ${details}. Full technical matrix and advantages on Solerz.`;
  }

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

  // Hydrate initial state
  if (batteries.length >= 2) {
    headInjections.push(
      `<script>window.__INITIAL_BATTERIES__ = ${JSON.stringify(batteries)};</script>`
    );
  }

  const finalHtml = injectHead(baseHtml, headInjections.join('\n  '));

  return new Response(finalHtml, {
    status: batteries.length >= 2 ? 200 : 404,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': batteries.length >= 2 ? 'public, max-age=0, s-maxage=86400' : 'no-cache, no-store',
    },
  });
};
