import type { Env, PagesFunction } from '../../_utils';
import { cleanBaseHtml, escapeHtml, fetchIndexHtml, getOrigin, injectHead, injectRootContent, supabaseRestGet } from '../../_utils';

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
  baseHtml = cleanBaseHtml(baseHtml);

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

  // Smart robots indexing control
  let isComparable = true;
  if (inverters.length === 2) {
    const p1 = inverters[0].paco_w;
    const p2 = inverters[1].paco_w;
    const ratio = Math.max(p1, p2) / Math.max(Math.min(p1, p2), 1);
    // Comparable if power ratio <= 2.5x or absolute delta <= 4000W
    isComparable = ratio <= 2.5 || Math.abs(p1 - p2) <= 4000;
  }
  const robotsTag = isComparable
    ? '<meta name="robots" content="index, follow" />'
    : '<meta name="robots" content="noindex, follow" />';

  const head = [
    `<title>${escapeHtml(title)}</title>`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    robotsTag,
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
          '@type': 'Thing',
          position: idx + 1,
          name: `${p.brand_name} ${p.model_name}`,
          description: `${p.brand_name} ${p.model_name} ${p.paco_w >= 1000 ? (p.paco_w / 1000).toFixed(1) + 'kW' : Math.round(p.paco_w) + 'W'} Inverter.`,
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

  let html = injectHead(baseHtml, head.join('\n'));

  if (inverters.length >= 2) {
    const inv1 = inverters[0];
    const inv2 = inverters[1];
    const p1Kw = (inv1.paco_w / 1000).toFixed(2);
    const p2Kw = (inv2.paco_w / 1000).toFixed(2);
    const eff1 = inv1.efficiency_pct ? inv1.efficiency_pct.toFixed(2) : '97.50';
    const eff2 = inv2.efficiency_pct ? inv2.efficiency_pct.toFixed(2) : '97.50';
    const effDelta = Math.abs(Number(eff1) - Number(eff2)).toFixed(2);

    const prerenderBody = `
    <div id="ssr-inverter-compare-prerender" style="max-width: 1100px; margin: 30px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
      <nav style="font-size: 12px; margin-bottom: 16px; color: #64748b;">
        <a href="/" style="color: #059669; text-decoration: none;">Home</a> &gt; 
        <a href="/inverters" style="color: #059669; text-decoration: none;">Inverters</a> &gt; 
        <span>${escapeHtml(modelNames)}</span>
      </nav>

      <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px;">
        <div style="display: inline-block; padding: 4px 12px; background: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; margin-bottom: 8px;">
          Hardware Benchmark &amp; Electrical Comparison
        </div>
        <h1 style="font-size: 28px; font-weight: 900; color: #0f172a; margin: 0 0 8px 0;">
          ${escapeHtml(inv1.brand_name)} ${escapeHtml(inv1.model_name)} vs ${escapeHtml(inv2.brand_name)} ${escapeHtml(inv2.model_name)}
        </h1>
        <p style="font-size: 15px; color: #475569; margin: 0;">
          Direct electrical matching comparison: Continuous AC rating (${p1Kw} kW vs ${p2Kw} kW), MPPT voltage tracking, and Sandia weighted efficiency.
        </p>
      </div>

      <!-- Comparison Specs Table -->
      <div style="border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin-bottom: 30px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <th style="padding: 12px 20px; color: #64748b;">Parameter</th>
              <th style="padding: 12px 20px; font-weight: 800;">${escapeHtml(inv1.brand_name)} ${escapeHtml(inv1.model_name)}</th>
              <th style="padding: 12px 20px; font-weight: 800;">${escapeHtml(inv2.brand_name)} ${escapeHtml(inv2.model_name)}</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 20px; color: #64748b;">Continuous AC Power (Paco)</td><td style="padding: 10px 20px; font-weight: 700;">${Math.round(inv1.paco_w)} W</td><td style="padding: 10px 20px; font-weight: 700;">${Math.round(inv2.paco_w)} W</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #fafafa;"><td style="padding: 10px 20px; color: #64748b;">Nominal AC Grid Voltage</td><td style="padding: 10px 20px; font-weight: 700;">${Math.round(inv1.vac_v)} V</td><td style="padding: 10px 20px; font-weight: 700;">${Math.round(inv2.vac_v)} V</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 20px; color: #64748b;">Weighted Efficiency</td><td style="padding: 10px 20px; font-weight: 700; color: #059669;">${eff1}%</td><td style="padding: 10px 20px; font-weight: 700; color: #059669;">${eff2}%</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #fafafa;"><td style="padding: 10px 20px; color: #64748b;">Max DC Voltage (Vdcmax)</td><td style="padding: 10px 20px; font-weight: 700;">${Math.round(inv1.vdcmax_v)} V</td><td style="padding: 10px 20px; font-weight: 700;">${Math.round(inv2.vdcmax_v)} V</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 10px 20px; color: #64748b;">MPPT Voltage Range</td><td style="padding: 10px 20px; font-weight: 700;">${Math.round(inv1.mppt_low_v)}–${Math.round(inv1.mppt_high_v)} V</td><td style="padding: 10px 20px; font-weight: 700;">${Math.round(inv2.mppt_low_v)}–${Math.round(inv2.mppt_high_v)} V</td></tr>
            <tr style="border-bottom: 1px solid #f1f5f9; background: #fafafa;"><td style="padding: 10px 20px; color: #64748b;">Max Input Current (Idcmax)</td><td style="padding: 10px 20px; font-weight: 700;">${inv1.idcmax_a ? `${inv1.idcmax_a} A` : '—'}</td><td style="padding: 10px 20px; font-weight: 700;">${inv2.idcmax_a ? `${inv2.idcmax_a} A` : '—'}</td></tr>
            <tr><td style="padding: 10px 20px; color: #64748b;">Battery Storage Hybrid</td><td style="padding: 10px 20px; font-weight: 700;">${inv1.is_hybrid ? 'Yes (Hybrid)' : 'No (Standard PV)'}</td><td style="padding: 10px 20px; font-weight: 700;">${inv2.is_hybrid ? 'Yes (Hybrid)' : 'No (Standard PV)'}</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Engineering Verdicts -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 30px;">
        <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 16px;">
          First-Principles Engineering Verdicts
        </h2>

        <div style="margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #f1f5f9;">
          <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">1. Continuous Power &amp; Array DC Oversizing (ILR)</h3>
          <p style="font-size: 14px; color: #334155; margin: 0;">
            ${inv1.paco_w >= inv2.paco_w
              ? `<strong>${escapeHtml(inv1.brand_name)} ${escapeHtml(inv1.model_name)}</strong> provides ${(inv1.paco_w - inv2.paco_w).toFixed(0)}W (${((inv1.paco_w / Math.max(inv2.paco_w, 1) - 1) * 100).toFixed(1)}%) higher continuous AC output capacity, accommodating up to ${(inv1.paco_w * 1.35 / 1000).toFixed(1)} kWp DC array oversizing.`
              : `<strong>${escapeHtml(inv2.brand_name)} ${escapeHtml(inv2.model_name)}</strong> provides ${(inv2.paco_w - inv1.paco_w).toFixed(0)}W (${((inv2.paco_w / Math.max(inv1.paco_w, 1) - 1) * 100).toFixed(1)}%) higher continuous AC output capacity, accommodating up to ${(inv2.paco_w * 1.35 / 1000).toFixed(1)} kWp DC array oversizing.`
            }
          </p>
        </div>

        <div style="margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #f1f5f9;">
          <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">2. Conversion Efficiency &amp; Lifecycle Energy Yield</h3>
          <p style="font-size: 14px; color: #334155; margin: 0;">
            Weighted conversion efficiency is rated at <strong>${eff1}%</strong> vs <strong>${eff2}%</strong> (a ${effDelta}% difference). Over a 10-year period in a typical 10 kW residential installation producing 14,000 kWh annually, this efficiency delta results in an estimated cumulative yield variance of approximately <strong>${(14000 * 10 * Math.abs(Number(eff1) - Number(eff2)) / 100).toFixed(0)} kWh</strong>.
          </p>
        </div>

        <div>
          <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">3. MPPT Tracking Window &amp; Voltage Margin</h3>
          <p style="font-size: 14px; color: #334155; margin: 0;">
            ${escapeHtml(inv1.model_name)} operates across ${Math.round(inv1.mppt_low_v)}–${Math.round(inv1.mppt_high_v)}V (span: ${Math.round(inv1.mppt_high_v - inv1.mppt_low_v)}V), compared to ${Math.round(inv2.mppt_low_v)}–${Math.round(inv2.mppt_high_v)}V (span: ${Math.round(inv2.mppt_high_v - inv2.mppt_low_v)}V) for ${escapeHtml(inv2.model_name)}. A wider voltage tracking window allows string inverters to begin energy harvesting earlier in the morning and avoid thermal clipping on hot afternoons.
          </p>
        </div>
      </div>

      <!-- Cross Links -->
      <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 40px;">
        <a href="/inverters" style="display: inline-block; padding: 10px 18px; background: #059669; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 13px;">Browse All Inverters</a>
        <a href="/calculator" style="display: inline-block; padding: 10px 18px; background: #0284c7; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 13px;">System Sizing Calculator</a>
        <a href="/handbook" style="display: inline-block; padding: 10px 18px; background: #475569; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 13px;">Inverter IEEE Standards Handbook</a>
      </div>
    </div>
    `;

    html = injectRootContent(html, prerenderBody);
  }

  return new Response(html, {
    status: inverters.length >= 2 ? 200 : 404,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': inverters.length >= 2 ? 'public, max-age=0, s-maxage=60, stale-while-revalidate=120' : 'no-cache, no-store',
    },
  });
};
