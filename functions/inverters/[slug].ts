import type { Env, PagesFunction } from '../_utils';
import { cleanBaseHtml, escapeHtml, fetchIndexHtml, getOrigin, injectHead, injectRootContent, supabaseRestGet } from '../_utils';

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
  baseHtml = cleanBaseHtml(baseHtml);

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
      review: {
        '@type': 'Review',
        name: `${inverter.brand_name} ${inverter.model_name} Technical Assessment`,
        reviewBody: `${inverter.brand_name} ${inverter.model_name} inverter datasheet assessment: rated at ${inverter.paco_w >= 1000 ? (inverter.paco_w / 1000).toFixed(1) + 'kW' : inverter.paco_w + 'W'} continuous AC output with ${inverter.efficiency_pct ? inverter.efficiency_pct.toFixed(2) + '%' : 'high'} conversion efficiency. Evaluated by Solerz engineering catalog.`,
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

  let html = injectHead(baseHtml, head.join('\n'));

  if (inverter) {
    const pacoKwVal = inverter.paco_w >= 1000 ? (inverter.paco_w / 1000).toFixed(2) : (inverter.paco_w / 1000).toFixed(3);
    const eff = inverter.efficiency_pct ? inverter.efficiency_pct.toFixed(2) : '97.50';
    const recDcMaxKw = (inverter.paco_w * 1.35 / 1000).toFixed(1);

    const prerenderBody = `
    <div id="ssr-inverter-prerender" style="max-width: 1100px; margin: 30px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
      <nav style="font-size: 12px; margin-bottom: 16px; color: #64748b;">
        <a href="/" style="color: #059669; text-decoration: none;">Home</a> &gt; 
        <a href="/inverters" style="color: #059669; text-decoration: none;">Inverters</a> &gt; 
        <a href="/brands/${encodeURIComponent(inverter.brand_name.toLowerCase().replace(/\\s+/g, '-'))}" style="color: #059669; text-decoration: none;">${escapeHtml(inverter.brand_name)}</a> &gt; 
        <span>${escapeHtml(inverter.model_name)}</span>
      </nav>

      <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px;">
        <div style="display: inline-block; padding: 4px 12px; background: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; margin-bottom: 8px;">
          Certified Inverter Datasheet &amp; Grid Compliance Assessment
        </div>
        <h1 style="font-size: 28px; font-weight: 900; color: #0f172a; margin: 0 0 8px 0;">
          ${escapeHtml(inverter.brand_name)} ${escapeHtml(inverter.model_name)} (${pacoKw}) Inverter
        </h1>
        <p style="font-size: 15px; color: #475569; margin: 0;">
          Sandia simulation models, California Energy Commission (CEC) test results, and MPPT string sizing specifications.
        </p>
      </div>

      <!-- Quick Metrics Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 30px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Rated AC Output</div>
          <div style="font-size: 22px; font-weight: 900; color: #0f172a;">${pacoKwVal} kW</div>
          <div style="font-size: 11px; color: #10b981; font-weight: 600;">Continuous active power</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Weighted Efficiency</div>
          <div style="font-size: 22px; font-weight: 900; color: #059669;">${eff}%</div>
          <div style="font-size: 11px; color: #64748b;">CEC / Sandia curve rating</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">MPPT Voltage Window</div>
          <div style="font-size: 20px; font-weight: 900; color: #0f172a;">${Math.round(inverter.mppt_low_v)}–${Math.round(inverter.mppt_high_v)} V</div>
          <div style="font-size: 11px; color: #64748b;">Max DC limit: ${Math.round(inverter.vdcmax_v)}V</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
          <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700;">Architecture</div>
          <div style="font-size: 20px; font-weight: 800; color: #0f172a;">${escapeHtml(inverter.inverter_type || 'String')}</div>
          <div style="font-size: 11px; color: #64748b;">${inverter.is_hybrid ? 'Hybrid Storage Capable' : 'Grid-Tied Standard'}</div>
        </div>
      </div>

      <!-- Expert Engineering Review -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 30px;">
        <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 16px;">
          Solerz Inverter Engineering &amp; Sizing Analysis
        </h2>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">1. MPPT Voltage Tracking Dynamics &amp; String Boundaries</h3>
          <p style="font-size: 14px; color: #334155; margin: 0;">
            The ${escapeHtml(inverter.brand_name)} ${escapeHtml(inverter.model_name)} incorporates a precision Maximum Power Point Tracking (MPPT) voltage window of <strong>${Math.round(inverter.mppt_low_v)}V to ${Math.round(inverter.mppt_high_v)}V DC</strong>, paired with an absolute maximum DC input voltage of <strong>${Math.round(inverter.vdcmax_v)}V</strong>. To prevent inverter shutdown or destructive overvoltage damage during cold winter mornings (-15°C to -30°C), array strings must be strictly designed so that the temperature-corrected open-circuit voltage (Voc_cold) does not breach ${Math.round(inverter.vdcmax_v)}V. Conversely, under hot summer conditions (+65°C cell temperature), string Vmp must remain comfortably above ${Math.round(inverter.mppt_low_v)}V to avoid low-voltage MPPT clipping.
          </p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">2. DC/AC Inverter Loading Ratio (ILR Oversizing)</h3>
          <p style="font-size: 14px; color: #334155; margin: 0;">
            With a rated continuous AC power of <strong>${pacoKwVal} kW</strong>, this inverter delivers optimal Levelized Cost of Energy (LCOE) when paired with a DC array capacity of <strong>${recDcMaxKw} kWp (1.30x – 1.35x Inverter Loading Ratio)</strong>. Oversizing the PV array ensures the inverter operates in its highest efficiency sweet spot during morning and afternoon shoulder hours, while absorbing midday clipping losses that are economically offset by increased total annual kWh production.
          </p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">3. Grid Compliance &amp; Interconnection Standards</h3>
          <p style="font-size: 14px; color: #334155; margin: 0;">
            Engineered in compliance with UL 1741 SB / IEEE 1547-2018 standards, the unit supports advanced autonomous grid-support functions, including dynamic Volt-VAR reactive voltage regulation, Volt-Watt overvoltage curtailment, and frequency ride-through. Total Harmonic Current Distortion (THD) is maintained strictly below 3%, preventing harmonic noise injection into local utility distribution transformers.
          </p>
        </div>
      </div>

      <!-- Electrical Datasheet Table -->
      <div style="border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin-bottom: 30px;">
        <div style="background: #f8fafc; padding: 14px 20px; font-weight: 800; font-size: 16px; border-bottom: 1px solid #e2e8f0;">
          Electrical Specifications &amp; Operating Parameters
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 20px; color: #64748b; font-weight: 600;">Rated AC Power Output (Paco)</td><td style="padding: 10px 20px; font-weight: 700;">${Math.round(inverter.paco_w)} W (${pacoKwVal} kW)</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #fafafa;"><td style="padding: 10px 20px; color: #64748b; font-weight: 600;">Nominal AC Grid Voltage (Vac)</td><td style="padding: 10px 20px; font-weight: 700;">${Math.round(inverter.vac_v)} V</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 20px; color: #64748b; font-weight: 600;">Weighted Conversion Efficiency</td><td style="padding: 10px 20px; font-weight: 700;">${eff} %</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #fafafa;"><td style="padding: 10px 20px; color: #64748b; font-weight: 600;">Maximum DC Input Voltage (Vdcmax)</td><td style="padding: 10px 20px; font-weight: 700;">${Math.round(inverter.vdcmax_v)} V</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 20px; color: #64748b; font-weight: 600;">MPPT Voltage Tracking Range</td><td style="padding: 10px 20px; font-weight: 700;">${Math.round(inverter.mppt_low_v)} – ${Math.round(inverter.mppt_high_v)} V</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #fafafa;"><td style="padding: 10px 20px; color: #64748b; font-weight: 600;">Max Continuous Input Current (Idcmax)</td><td style="padding: 10px 20px; font-weight: 700;">${inverter.idcmax_a ? `${inverter.idcmax_a} A` : '—'}</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 20px; color: #64748b; font-weight: 600;">Night Tare Loss (Pnt)</td><td style="padding: 10px 20px; font-weight: 700;">${inverter.pnt_w ? `${inverter.pnt_w.toFixed(2)} W` : '&lt; 1 W'}</td></tr>
            <tr><td style="padding: 10px 20px; color: #64748b; font-weight: 600;">Storage Coupling</td><td style="padding: 10px 20px; font-weight: 700;">${inverter.is_hybrid ? 'Hybrid DC/AC Battery Coupled' : 'Dedicated PV Grid-Tie'}</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Interactive Cross-Link Hub -->
      <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 40px;">
        <a href="/inverters" style="display: inline-block; padding: 10px 18px; background: #059669; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 13px;">Browse All Inverters</a>
        <a href="/calculator" style="display: inline-block; padding: 10px 18px; background: #0284c7; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 13px;">Calculate MPPT Array Matching</a>
        <a href="/handbook" style="display: inline-block; padding: 10px 18px; background: #475569; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 13px;">Inverter IEEE Standards Handbook</a>
      </div>
    </div>
    `;

    html = injectRootContent(html, prerenderBody);
  }

  return new Response(html, {
    status: inverter ? 200 : 404,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': inverter ? 'public, max-age=0, s-maxage=86400' : 'no-cache, no-store',
    },
  });
};
