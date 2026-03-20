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
  location_country?: string;
  location_countries?: string[];
  images_url?: string[];
  moq?: number;
  specs?: any;
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
      `listings?id=eq.${encodeURIComponent(id)}&select=id,title,brand,category,condition,price,currency,location_state,location_country,location_countries,images_url,moq,specs&limit=1`
    );
    listing = (data && data[0]) || null;
  }

  let priceStr = '';
  if (typeof listing?.price === 'number') {
    priceStr = `${listing?.currency || 'USD'} ${listing.price}`;
  }
  let moqStr = '';
  if (typeof listing?.moq === 'number') {
    moqStr = `MOQ: ${listing.moq}`;
  }
  
  let prefixParts = [priceStr, moqStr].filter(Boolean);
  let prefix = prefixParts.length ? `[${prefixParts.join(' | ')}] ` : '';

  let locParts = listing?.location_countries?.length 
    ? listing.location_countries 
    : [listing?.location_state, listing?.location_country].filter(Boolean);
  
  const loc = Array.from(new Set(locParts)).join(', ');
  let suffix = loc ? ` | ${loc}` : '';

  const title = listing?.title
    ? `${prefix}${listing.title}${suffix}`
    : 'Solerz | Solar Equipment Listings';

  const descParts: string[] = [];
  if (listing?.brand) descParts.push(listing.brand);
  if (listing?.category) descParts.push(listing.category);
  if (listing?.condition) descParts.push(listing.condition);
  
  if (listing?.specs) {
    const s = listing.specs;
    const specList: string[] = [];
    if (s.wattage) specList.push(`${s.wattage}W`);
    if (s.efficiency) specList.push(`${s.efficiency}% Eff`);
    if (s.capacity_kwh) specList.push(`${s.capacity_kwh}kWh`);
    if (s.cycle_life) specList.push(`${s.cycle_life} Cycles`);
    if (s.battery_technology) specList.push(s.battery_technology);
    if (s.inverter_type) specList.push(s.inverter_type);
    if (s.phase) specList.push(`${s.phase} Phase`);
    if (s.mounting_type) specList.push(s.mounting_type);
    if (specList.length > 0) {
      descParts.push(`Specs: ${specList.join(', ')}`);
    }
  }

  const cta = "Sign up for free! Sellers get 3 free listings with a Starter account.";
  const finalDesc = descParts.length > 0
    ? `${descParts.join(' • ')} • ${cta}`
    : `Browse global solar equipment listings. ${cta}`;
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
    ...(ogImage !== `${origin}/icon.png` ? [`<link rel="preload" as="image" href="${escapeHtml(ogImage)}" fetchpriority="high" />`] : []),
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Solerz" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(ogImage)}" />`,
    `<meta property="og:image:secure_url" content="${escapeHtml(ogImage)}" />`,
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
