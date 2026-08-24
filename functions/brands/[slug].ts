import type { Env, PagesFunction } from '../_utils';
import { escapeHtml, fetchIndexHtml, getOrigin, injectHead, supabaseRestGet } from '../_utils';

type BrandRow = {
  id: string;
  name: string;
  slug: string;
  tier_rating: string | null;
  headquarters_country: string | null;
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

  let brand: BrandRow | null = null;
  if (slug) {
    const { data } = await supabaseRestGet<BrandRow[]>(
      env,
      `brands?slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`
    );
    brand = (data && data[0]) || null;
  }

  const title = brand
    ? `${brand.name} — Solar Panels, Inverters & Storage Hardware Catalog | Solerz`
    : 'Solar Manufacturer Hardware Catalog | Solerz';

  const description = brand
    ? `Explore certified photovoltaic modules, solar inverters, and battery energy storage systems manufactured by ${brand.name}. Full STC electrical specs, single-diode simulation parameters, and datasheets on Solerz.`
    : 'Global solar hardware manufacturer directory. Access datasheets, SDM parameters, and compare PV modules.';

  const canonical = `${origin}/brands/${encodeURIComponent(slug)}`;

  const head = [
    `<title>${escapeHtml(title)}</title>`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    ...(!brand ? ['<meta name="robots" content="noindex, nofollow" />'] : []),
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

  return new Response(injectHead(baseHtml, head.join('\n')), {
    status: brand ? 200 : 404,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': brand ? 'public, max-age=0, s-maxage=3600' : 'no-cache, no-store',
    },
  });
};
