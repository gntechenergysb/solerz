import type { Env, PagesFunction } from '../../_utils';
import { cleanBaseHtml, escapeHtml, fetchIndexHtml, getOrigin, injectHead, injectRootContent, supabaseRestGet } from '../../_utils';

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
  baseHtml = cleanBaseHtml(baseHtml);

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

  // Smart robots indexing control
  let isComparable = true;
  if (batteries.length === 2) {
    const c1 = batteries[0].usable_capacity_kwh;
    const c2 = batteries[1].usable_capacity_kwh;
    const ratio = Math.max(c1, c2) / Math.max(Math.min(c1, c2), 1);
    // Comparable if capacity ratio <= 3.0x or absolute delta <= 15 kWh
    isComparable = ratio <= 3.0 || Math.abs(c1 - c2) <= 15;
  }
  const robotsTag = isComparable
    ? '<meta name="robots" content="index, follow" />'
    : '<meta name="robots" content="noindex, follow" />';

  const headInjections = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    robotsTag,
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

  let finalHtml = injectHead(baseHtml, headInjections.join('\n  '));

  if (batteries.length >= 2) {
    const b1 = batteries[0];
    const b2 = batteries[1];
    const cap1 = b1.usable_capacity_kwh;
    const cap2 = b2.usable_capacity_kwh;
    const pwr1 = b1.continuous_power_kw;
    const pwr2 = b2.continuous_power_kw;
    const rte1 = b1.round_trip_efficiency_pct.toFixed(1);
    const rte2 = b2.round_trip_efficiency_pct.toFixed(1);

    const prerenderBody = `
    <div id="ssr-battery-compare-prerender" style="max-width: 1100px; margin: 30px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
      <nav style="font-size: 12px; margin-bottom: 16px; color: #64748b;">
        <a href="/" style="color: #059669; text-decoration: none;">Home</a> &gt; 
        <a href="/batteries" style="color: #059669; text-decoration: none;">Batteries</a> &gt; 
        <span>${escapeHtml(b1.model_name)} vs ${escapeHtml(b2.model_name)}</span>
      </nav>

      <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px;">
        <div style="display: inline-block; padding: 4px 12px; background: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; margin-bottom: 8px;">
          BESS Hardware Benchmark &amp; Storage Comparison
        </div>
        <h1 style="font-size: 28px; font-weight: 900; color: #0f172a; margin: 0 0 8px 0;">
          ${escapeHtml(b1.brand_name)} ${escapeHtml(b1.model_name)} vs ${escapeHtml(b2.brand_name)} ${escapeHtml(b2.model_name)}
        </h1>
        <p style="font-size: 15px; color: #475569; margin: 0;">
          Direct electrochemical and capacity comparison: Usable capacity (${cap1} kWh vs ${cap2} kWh), continuous discharge (${pwr1} kW vs ${pwr2} kW), and round-trip efficiency (${rte1}% vs ${rte2}%).
        </p>
      </div>

      <!-- Engineering Verdicts -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 30px;">
        <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 16px;">
          First-Principles Engineering Verdicts
        </h2>

        <div style="margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #f1f5f9;">
          <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">1. Usable Energy Storage &amp; Blackout Autonomy</h3>
          <p style="font-size: 14px; color: #334155; margin: 0;">
            ${cap1 >= cap2
              ? `<strong>${escapeHtml(b1.brand_name)} ${escapeHtml(b1.model_name)}</strong> offers <strong>+${(cap1 - cap2).toFixed(1)} kWh</strong> (+${((cap1 / Math.max(cap2, 1) - 1) * 100).toFixed(0)}%) more usable storage capacity, providing an additional ~${((cap1 - cap2) / 0.8).toFixed(1)} hours of continuous runtime powering an 800W critical household backup load.`
              : `<strong>${escapeHtml(b2.brand_name)} ${escapeHtml(b2.model_name)}</strong> offers <strong>+${(cap2 - cap1).toFixed(1)} kWh</strong> (+${((cap2 / Math.max(cap1, 1) - 1) * 100).toFixed(0)}%) more usable storage capacity, providing an additional ~${((cap2 - cap1) / 0.8).toFixed(1)} hours of continuous runtime powering an 800W critical household backup load.`
            }
          </p>
        </div>

        <div style="margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #f1f5f9;">
          <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">2. Continuous Power Delivery &amp; C-Rate Load Support</h3>
          <p style="font-size: 14px; color: #334155; margin: 0;">
            Continuous output ratings are ${pwr1} kW (${(pwr1 / Math.max(cap1, 1)).toFixed(2)}C) vs ${pwr2} kW (${(pwr2 / Math.max(cap2, 1)).toFixed(2)}C). Higher continuous power ratings prevent system overloads when multiple major household appliances (e.g. electric oven, EV charger, HVAC) operate simultaneously.
          </p>
        </div>

        <div>
          <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">3. Round-Trip Efficiency &amp; Conversion Thermal Losses</h3>
          <p style="font-size: 14px; color: #334155; margin: 0;">
            Rated round-trip AC efficiency is <strong>${rte1}%</strong> vs <strong>${rte2}%</strong>. Over a standard 10-year warranty span (approx. 4,000 cycles at full depth of discharge), an efficiency variance of ${Math.abs(Number(rte1) - Number(rte2)).toFixed(1)}% prevents up to <strong>${(4000 * Math.min(cap1, cap2) * Math.abs(Number(rte1) - Number(rte2)) / 100).toFixed(0)} kWh</strong> of lost electrical energy from dissipating as ambient heat.
          </p>
        </div>
      </div>

      <!-- Comparison Specs Table -->
      <div style="border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin-bottom: 30px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <th style="padding: 12px 20px; color: #64748b;">Parameter</th>
              <th style="padding: 12px 20px; font-weight: 800;">${escapeHtml(b1.brand_name)} ${escapeHtml(b1.model_name)}</th>
              <th style="padding: 12px 20px; font-weight: 800;">${escapeHtml(b2.brand_name)} ${escapeHtml(b2.model_name)}</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 20px; color: #64748b;">Usable Capacity</td><td style="padding: 10px 20px; font-weight: 700; color: #059669;">${cap1} kWh</td><td style="padding: 10px 20px; font-weight: 700; color: #059669;">${cap2} kWh</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #fafafa;"><td style="padding: 10px 20px; color: #64748b;">Continuous Power</td><td style="padding: 10px 20px; font-weight: 700;">${pwr1} kW</td><td style="padding: 10px 20px; font-weight: 700;">${pwr2} kW</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 20px; color: #64748b;">Peak Power</td><td style="padding: 10px 20px; font-weight: 700;">${b1.peak_power_kw ? `${b1.peak_power_kw} kW` : '—'}</td><td style="padding: 10px 20px; font-weight: 700;">${b2.peak_power_kw ? `${b2.peak_power_kw} kW` : '—'}</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #fafafa;"><td style="padding: 10px 20px; color: #64748b;">Round-Trip Efficiency</td><td style="padding: 10px 20px; font-weight: 700;">${rte1} %</td><td style="padding: 10px 20px; font-weight: 700;">${rte2} %</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 20px; color: #64748b;">Battery Chemistry</td><td style="padding: 10px 20px; font-weight: 700;">${escapeHtml(b1.battery_type || 'LiFePO4')}</td><td style="padding: 10px 20px; font-weight: 700;">${escapeHtml(b2.battery_type || 'LiFePO4')}</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #fafafa;"><td style="padding: 10px 20px; color: #64748b;">Nominal Voltage</td><td style="padding: 10px 20px; font-weight: 700;">${b1.nominal_voltage_v} V</td><td style="padding: 10px 20px; font-weight: 700;">${b2.nominal_voltage_v} V</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 20px; color: #64748b;">Cycle Life</td><td style="padding: 10px 20px; font-weight: 700;">${b1.cycle_life_count || 6000} Cycles</td><td style="padding: 10px 20px; font-weight: 700;">${b2.cycle_life_count || 6000} Cycles</td></tr>
            <tr><td style="padding: 10px 20px; color: #64748b;">Warranty Period</td><td style="padding: 10px 20px; font-weight: 700;">${b1.warranty_years || 10} Years</td><td style="padding: 10px 20px; font-weight: 700;">${b2.warranty_years || 10} Years</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Cross Links -->
      <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 40px;">
        <a href="/batteries" style="display: inline-block; padding: 10px 18px; background: #059669; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 13px;">Browse All Batteries</a>
        <a href="/system-sizer" style="display: inline-block; padding: 10px 18px; background: #0284c7; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 13px;">Battery Sizing Calculator</a>
        <a href="/handbook" style="display: inline-block; padding: 10px 18px; background: #475569; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 13px;">UL 9540 &amp; NFPA 855 Handbook</a>
      </div>
    </div>
    `;

    finalHtml = injectRootContent(finalHtml, prerenderBody);
  }

  return new Response(finalHtml, {
    status: batteries.length >= 2 ? 200 : 404,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': batteries.length >= 2 ? 'public, max-age=0, s-maxage=86400' : 'no-cache, no-store',
    },
  });
};
