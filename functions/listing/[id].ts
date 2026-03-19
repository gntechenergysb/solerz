import type { Env } from '../_utils';
import { escapeHtml, fetchIndexHtml, getOrigin, injectHead, supabaseRestGet } from '../_utils';

type Listing = {
  id: string;
  title: string;
  brand?: string;
  category?: string;
  condition?: string;
  price?: number;
  currency?: string;
  location_state?: string;
  images_url?: string[];
};

export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  const origin = getOrigin(request);
  const id = String((params as any).id || '').trim();

  // Always return index.html (SPA) but with OG tags injected so crawlers can preview.
  let baseHtml = await fetchIndexHtml(env, origin);
  
  // Remove existing SEO meta tags to prevent duplicates that confuse Facebook and other crawlers
  baseHtml = baseHtml.replace(/<title>[\s\S]*?<\/title>/i, '');
  baseHtml = baseHtml.replace(/<meta[^>]*name="description"[^>]*>/gi, '');
  baseHtml = baseHtml.replace(/<meta[^>]*property="og:[^>]*>/gi, '');
  baseHtml = baseHtml.replace(/<meta[^>]*property="twitter:[^>]*>/gi, '');
  baseHtml = baseHtml.replace(/<meta[^>]*name="twitter:[^>]*>/gi, '');

  let listing: Listing | null = null;
  if (id) {
    const { data } = await supabaseRestGet<Listing[]>(
      env,
      `listings?id=eq.${encodeURIComponent(id)}&select=id,title,brand,category,condition,price,currency,location_state,images_url&limit=1`
    );
    listing = (data && data[0]) || null;
  }

  const title = listing?.title
    ? `${listing.title} | Solerz`
    : 'Solerz | Solar Equipment Listings';

  const descParts: string[] = [];
  if (listing?.brand) descParts.push(listing.brand);
  if (listing?.category) descParts.push(listing.category);
  if (listing?.condition) descParts.push(listing.condition);
  if (typeof listing?.price === 'number') descParts.push(`${listing.currency || 'USD'} ${listing.price}`);
  if (listing?.location_state) descParts.push(listing.location_state);

  const finalDesc = descParts.length > 0
    ? descParts.join(' • ')
    : 'Browse global solar equipment listings.';
  const description = descParts.length
    ? `Solar listing on Solerz: ${finalDesc}`
    : finalDesc;

  const canonical = `${origin}/listing/${encodeURIComponent(id)}`;
  
  // Ensure the OG Image is an absolute URL
  let ogImage = `${origin}/icon.png`;
  if (listing?.images_url && listing.images_url.length > 0) {
    try {
      ogImage = new URL(listing.images_url[0], origin).href;
    } catch (e) {
      // ignore
    }
  }

  const head = [
    `<title>${escapeHtml(title)}</title>`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta property="og:type" content="${listing ? 'product.item' : 'website'}" />`,
    `<meta property="og:site_name" content="Solerz" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(ogImage)}" />`,
    `<meta property="og:image:secure_url" content="${escapeHtml(ogImage)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`
  ];

  if (listing && typeof listing.price === 'number') {
    head.push(`<meta property="product:price:amount" content="${listing.price}" />`);
    head.push(`<meta property="product:price:currency" content="${escapeHtml(listing.currency || 'USD')}" />`);
  }

  // Generate JSON-LD for better SEO
  const jsonLd = listing ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": listing.title,
    "image": listing.images_url || undefined,
    "description": description,
    "brand": {
      "@type": "Brand",
      "name": listing.brand || "Unspecified"
    },
    "offers": {
      "@type": "Offer",
      "url": canonical,
      "priceCurrency": listing.currency || "USD",
      "price": listing.price || 0,
      "itemCondition": listing.condition?.toLowerCase().includes("new") 
        ? "https://schema.org/NewCondition" 
        : "https://schema.org/UsedCondition",
      "availability": "https://schema.org/InStock"
    }
  } : null;

  if (jsonLd) {
    head.push(`<script type="application/ld+json">\n${JSON.stringify(jsonLd)}\n</script>`);
  }

  const html = injectHead(baseHtml, head.join('\n'));

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      // Cache per-listing at the edge. If listing changes frequently, reduce s-maxage.
      'Cache-Control': 'public, max-age=0, s-maxage=1800'
    }
  });
};
