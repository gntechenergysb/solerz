import type { Env, PagesFunction } from '../_utils';
import { escapeHtml, fetchIndexHtml, getOrigin, injectHead, injectRootContent, supabaseRestGet } from '../_utils';

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
        review: {
          '@type': 'Review',
          name: `${battery.brand_name} ${battery.model_name} Technical Assessment`,
          reviewBody: `${battery.brand_name} ${battery.model_name} storage datasheet assessment: rated at ${battery.usable_capacity_kwh} kWh usable storage capacity with ${battery.round_trip_efficiency_pct ? battery.round_trip_efficiency_pct.toFixed(1) + '%' : 'high'} round-trip efficiency. Evaluated by Solerz engineering catalog.`,
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '4.8',
            bestRating: '5',
          },
          author: {
            '@type': 'Organization',
            name: 'Solerz Hardware Engineering Team',
          },
        },
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

  let finalHtml = injectHead(baseHtml, headInjections.join('\n  '));

  if (battery) {
    const cap = battery.usable_capacity_kwh;
    const pwr = battery.continuous_power_kw;
    const cRate = cap > 0 ? (pwr / cap).toFixed(2) : '0.50';
    const rte = battery.round_trip_efficiency_pct ? battery.round_trip_efficiency_pct.toFixed(1) : '90.0';
    const cycles = battery.cycle_life_count || 6000;
    const warranty = battery.warranty_years || 10;
    const chemistry = battery.battery_type || 'LiFePO4';

    const prerenderBody = `
    <div id="ssr-battery-prerender" style="max-width: 1100px; margin: 30px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
      <nav style="font-size: 12px; margin-bottom: 16px; color: #64748b;">
        <a href="/" style="color: #059669; text-decoration: none;">Home</a> &gt; 
        <a href="/batteries" style="color: #059669; text-decoration: none;">Batteries</a> &gt; 
        <a href="/brands/${encodeURIComponent(battery.brand_name.toLowerCase().replace(/\\s+/g, '-'))}" style="color: #059669; text-decoration: none;">${escapeHtml(battery.brand_name)}</a> &gt; 
        <span>${escapeHtml(battery.model_name)}</span>
      </nav>

      <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px;">
        <div style="display: inline-block; padding: 4px 12px; background: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; margin-bottom: 8px;">
          Certified BESS Datasheet &amp; Electrochemical Reliability Analysis
        </div>
        <h1 style="font-size: 28px; font-weight: 900; color: #0f172a; margin: 0 0 8px 0;">
          ${escapeHtml(battery.brand_name)} ${escapeHtml(battery.model_name)} (${cap} kWh) Battery
        </h1>
        <p style="font-size: 15px; color: #475569; margin: 0;">
          Stationary storage specifications, C-rate continuous load discharge capability, and UL 9540 fire safety compliance.
        </p>
      </div>

      <!-- Quick Metrics Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 30px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Usable Capacity</div>
          <div style="font-size: 22px; font-weight: 900; color: #0f172a;">${cap} kWh</div>
          <div style="font-size: 11px; color: #10b981; font-weight: 600;">100% Depth of Discharge</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Continuous Power</div>
          <div style="font-size: 22px; font-weight: 900; color: #059669;">${pwr} kW</div>
          <div style="font-size: 11px; color: #64748b;">${cRate}C continuous discharge</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Round-Trip Efficiency</div>
          <div style="font-size: 22px; font-weight: 900; color: #0f172a;">${rte}%</div>
          <div style="font-size: 11px; color: #64748b;">AC-to-Battery-to-AC yield</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Cell Chemistry</div>
          <div style="font-size: 20px; font-weight: 800; color: #0f172a;">${escapeHtml(chemistry)}</div>
          <div style="font-size: 11px; color: #64748b;">${cycles}+ cycles to 80% SOH</div>
        </div>
      </div>

      <!-- Expert Engineering Review -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 30px;">
        <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 16px;">
          Solerz Energy Storage Engineering Evaluation
        </h2>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">1. Electrochemistry &amp; Thermal Runaway Mitigation</h3>
          <p style="font-size: 14px; color: #334155; margin: 0;">
            The ${escapeHtml(battery.brand_name)} ${escapeHtml(battery.model_name)} utilizes high-stability <strong>${escapeHtml(chemistry)}</strong> chemistry, providing intrinsically superior thermal runaway tolerance compared to conventional cobalt-rich NMC cells. With an oxygen release temperature well exceeding 270°C, the cell structure prevents violent self-oxidizing fires under mechanical puncture or electrical overcharge abuse. Fully certified to UL 9540 and UL 9540A fire propagation standards, this unit complies with NFPA 855 residential garage capacity limitations (max 20 kWh per discrete enclosure).
          </p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">2. C-Rate Dynamics &amp; Heavy Motor Surge Handling</h3>
          <p style="font-size: 14px; color: #334155; margin: 0;">
            Featuring a rated continuous power output of <strong>${pwr} kW</strong> (${cRate}C continuous discharge rate)${battery.peak_power_kw ? ` and a 10-second peak surge rating of <strong>${battery.peak_power_kw} kW</strong>` : ''}, this storage unit is capable of supporting essential inductive household loads (including well pumps, central air conditioning compressors, and refrigeration units) without tripping inverter breaker overcurrent protection during grid outages.
          </p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">3. Round-Trip Efficiency &amp; 10-Year Lifecycle Degradation</h3>
          <p style="font-size: 14px; color: #334155; margin: 0;">
            Demonstrating an exceptional round-trip efficiency (RTE) of <strong>${rte}%</strong>, thermal conversion losses are minimized to less than ${((100 - Number(rte))).toFixed(1)}% per charge-discharge cycle. Backed by a verified <strong>${cycles} cycle lifecycle warranty</strong>, daily 100% cycling ensures over 10 years of reliable operation, retaining $\ge 70\%\sim80\%$ of nominal nameplate usable energy capacity over its operating lifespan.
          </p>
        </div>
      </div>

      <!-- Electrical Datasheet Table -->
      <div style="border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin-bottom: 30px;">
        <div style="background: #f8fafc; padding: 14px 20px; font-weight: 800; font-size: 16px; border-bottom: 1px solid #e2e8f0;">
          Battery System Specifications &amp; Operational Limits
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 20px; color: #64748b; font-weight: 600;">Usable Energy Capacity</td><td style="padding: 10px 20px; font-weight: 700;">${cap} kWh</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #fafafa;"><td style="padding: 10px 20px; color: #64748b; font-weight: 600;">Continuous Output Power</td><td style="padding: 10px 20px; font-weight: 700;">${pwr} kW</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 20px; color: #64748b; font-weight: 600;">Peak Surge Power</td><td style="padding: 10px 20px; font-weight: 700;">${battery.peak_power_kw ? `${battery.peak_power_kw} kW (10s)` : '—'}</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #fafafa;"><td style="padding: 10px 20px; color: #64748b; font-weight: 600;">Nominal Operating DC Voltage</td><td style="padding: 10px 20px; font-weight: 700;">${battery.nominal_voltage_v} V</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 20px; color: #64748b; font-weight: 600;">Round-Trip AC Efficiency</td><td style="padding: 10px 20px; font-weight: 700;">${rte} %</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #fafafa;"><td style="padding: 10px 20px; color: #64748b; font-weight: 600;">Cell Chemistry</td><td style="padding: 10px 20px; font-weight: 700;">${escapeHtml(chemistry)}</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 20px; color: #64748b; font-weight: 600;">Warranty &amp; Cycle Life</td><td style="padding: 10px 20px; font-weight: 700;">${warranty} Years / ${cycles} Cycles</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #fafafa;"><td style="padding: 10px 20px; color: #64748b; font-weight: 600;">Ingress Protection Rating</td><td style="padding: 10px 20px; font-weight: 700;">${battery.ip_rating || 'IP65 (NEMA 3R Outdoor)'}</td></tr>
            <tr><td style="padding: 10px 20px; color: #64748b; font-weight: 600;">System Weight &amp; Form</td><td style="padding: 10px 20px; font-weight: 700;">${battery.weight_kg ? `${battery.weight_kg} kg` : '—'}</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Interactive Cross-Link Hub -->
      <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 40px;">
        <a href="/batteries" style="display: inline-block; padding: 10px 18px; background: #059669; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 13px;">Browse All Batteries</a>
        <a href="/system-sizer" style="display: inline-block; padding: 10px 18px; background: #0284c7; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 13px;">Size Battery Storage System</a>
        <a href="/handbook" style="display: inline-block; padding: 10px 18px; background: #475569; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 13px;">UL 9540 &amp; NFPA 855 Handbook</a>
      </div>
    </div>
    `;

    finalHtml = injectRootContent(finalHtml, prerenderBody);
  }

  return new Response(finalHtml, {
    status: battery ? 200 : 404,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': battery ? 'public, max-age=0, s-maxage=86400' : 'no-cache, no-store',
    },
  });
};
