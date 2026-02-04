import type { Env } from '../_utils';
import { escapeHtml, fetchIndexHtml, getOrigin, injectHead, supabaseRestGet } from '../_utils';

type Listing = {
  id: string;
  title: string;
  brand?: string;
  category?: string;
  condition?: string;
  price_rm?: number;
  location_state?: string;
  images_url?: string[];
};

export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  const origin = getOrigin(request);
  const id = String((params as any).id || '').trim();

  // Always return index.html (SPA) but with OG tags injected so crawlers can preview.
  let baseHtml = await fetchIndexHtml(env, origin);
  baseHtml = baseHtml.replace(/<title>[\s\S]*?<\/title>/i, '');

  let listing: Listing | null = null;
  if (id) {
    const { data } = await supabaseRestGet<Listing[]>(
      env,
      `listings?id=eq.${encodeURIComponent(id)}&select=id,title,brand,category,condition,price_rm,location_state,images_url&limit=1`
    );
    listing = (data && data[0]) || null;
  }

  const title = listing?.title
    ? `${listing.title} | Solerz`
    : 'Solerz | Solar Equipment Marketplace';

  const descParts: string[] = [];
  if (listing?.brand) descParts.push(listing.brand);
  if (listing?.category) descParts.push(listing.category);
  if (listing?.condition) descParts.push(listing.condition);
  if (typeof listing?.price_rm === 'number') descParts.push(`RM ${listing.price_rm}`);
  if (listing?.location_state) descParts.push(listing.location_state);

  const description = descParts.length
    ? `Solar listing on Solerz: ${descParts.join(' • ')}`
    : 'Buy and sell solar equipment in Malaysia.';

  const canonical = `${origin}/listing/${encodeURIComponent(id)}`;
  const ogImage = listing?.images_url?.[0] || `${origin}/icon.png`;

  const head = [
    `<title>${escapeHtml(title)}</title>`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Solerz" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(ogImage)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`
  ].join('\n');

  const html = injectHead(baseHtml, head);

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      // Cache per-listing at the edge. If listing changes frequently, reduce s-maxage.
      'Cache-Control': 'public, max-age=0, s-maxage=1800'
    }
  });
};
