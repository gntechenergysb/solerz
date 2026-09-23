import type { Env, PagesFunction } from './_utils';
import { cleanBaseHtml, escapeHtml, fetchIndexHtml, getOrigin, injectHead, injectRootContent, supabaseRestGet } from './_utils';

type PanelSummary = {
  id: string;
  slug: string;
  brand_name: string;
  model_name: string;
  pnom_w: number;
  module_efficiency_pct: number | null;
  technol: string | null;
  is_bifacial: boolean;
  mu_pnom_spec_pct_c: number | null;
  warranty_power_years: number | null;
};

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const origin = getOrigin(request);
  const canonical = `${origin}/arena`;

  let baseHtml = await fetchIndexHtml(env, origin);
  baseHtml = cleanBaseHtml(baseHtml);

  const title = 'Solerz Arena — Global Photovoltaic Hardware Leaderboard & Benchmarks';
  const description =
    'Comprehensive engineering benchmark ratings and rankings for over 20,000 certified solar panels. Scored on STC efficiency, 65°C thermal retention, 25-year degradation, and BOS roof density.';

  // Query top 20 panels by efficiency
  const { data } = await supabaseRestGet<PanelSummary[]>(
    env,
    'solar_panels?pnom_w=gt.380&module_efficiency_pct=not.is.null&order=module_efficiency_pct.desc&limit=20'
  );

  const panels = data || [];

  const head = [
    `<title>${escapeHtml(title)}</title>`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    '<meta name="robots" content="index, follow" />',
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Solerz" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${origin}/theme_logo.png" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
  ];

  if (panels.length > 0) {
    const jsonLd = {
      '@context': 'https://schema.org/',
      '@type': 'ItemList',
      name: title,
      description,
      numberOfItems: panels.length,
      itemListElement: panels.slice(0, 10).map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'Product',
          name: `${p.brand_name} ${p.model_name}`,
          description: `${Math.round(p.pnom_w)}W solar module with ${p.module_efficiency_pct?.toFixed(1)}% conversion efficiency.`,
          url: `${origin}/solar-panels/${encodeURIComponent(p.slug)}`,
        },
      })),
    };
    head.push(`<script type="application/ld+json">\n${JSON.stringify(jsonLd)}\n</script>`);
  }

  // Pre-rendered HTML Table for Crawlers & Immediate FCP
  const rowsHtml = panels
    .slice(0, 15)
    .map(
      (p, idx) => `
    <tr>
      <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: 800; text-align: center;">#${idx + 1}</td>
      <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">
        <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">${escapeHtml(p.brand_name)}</div>
        <a href="/solar-panels/${escapeHtml(p.slug)}" style="font-weight: 700; color: #059669; text-decoration: none;">${escapeHtml(p.model_name)}</a>
      </td>
      <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: 800;">${Math.round(p.pnom_w)} Wp</td>
      <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-weight: 800; color: #059669;">${p.module_efficiency_pct?.toFixed(2)}%</td>
      <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">${p.mu_pnom_spec_pct_c ? `${p.mu_pnom_spec_pct_c.toFixed(3)}%/°C` : '—'}</td>
    </tr>`
    )
    .join('\n');

  const prerenderedBody = `
  <div id="ssr-arena-prerender" style="max-width: 1200px; margin: 40px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <h1 style="font-size: 28px; font-weight: 900; color: #0f172a; margin-bottom: 8px;">Solerz Arena: Global Solar Hardware Leaderboard</h1>
    <p style="font-size: 15px; color: #475569; margin-bottom: 24px;">First-principles hardware physics benchmarks across certified solar photovoltaic modules.</p>
    <table style="width: 100%; border-collapse: collapse; text-align: left; border: 1px solid #e2e8f0;">
      <thead>
        <tr style="background: #f8fafc;">
          <th style="padding: 12px 14px; border: 1px solid #e2e8f0; width: 60px; text-align: center;">Rank</th>
          <th style="padding: 12px 14px; border: 1px solid #e2e8f0;">Model & Brand</th>
          <th style="padding: 12px 14px; border: 1px solid #e2e8f0;">Output</th>
          <th style="padding: 12px 14px; border: 1px solid #e2e8f0;">Efficiency</th>
          <th style="padding: 12px 14px; border: 1px solid #e2e8f0;">Temp Coeff</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  </div>
  `;

  let html = injectHead(baseHtml, head.join('\n'));
  html = injectRootContent(html, prerenderedBody);

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400',
    },
  });
};
