import type { Env } from './_utils';
import { getOrigin } from './_utils';

type ListingRow = {
  id: string;
  updated_at?: string;
  created_at?: string;
};

const xmlEscape = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const origin = getOrigin(request);
  const nowIso = new Date().toISOString();

  // Fetch IDs for active listings. We paginate to avoid oversized responses.
  const pageSize = 1000;
  const maxTotal = 5000;
  let from = 0;
  let rows: ListingRow[] = [];

  while (rows.length < maxTotal) {
    const to = from + pageSize - 1;

    const q = new URLSearchParams({
      select: 'id,updated_at,created_at',
      is_hidden: 'eq.false',
      is_sold: 'eq.false',
      active_until: `gt.${nowIso}`,
      order: 'created_at.desc'
    });

    const url = `listings?${q.toString()}`;

    const res = await fetch(
      `${env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${url}`,
      {
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
          Accept: 'application/json',
          Range: `${from}-${to}`
        }
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return new Response(text || res.statusText, { status: 500 });
    }

    const batch = (await res.json().catch(() => [])) as ListingRow[];
    if (!batch.length) break;

    rows = rows.concat(batch);
    from += pageSize;
  }

  const urls: string[] = [];
  const addUrl = (loc: string, lastmod?: string) => {
    urls.push(
      [
        '<url>',
        `  <loc>${xmlEscape(loc)}</loc>`,
        lastmod ? `  <lastmod>${xmlEscape(lastmod)}</lastmod>` : '',
        '</url>'
      ]
        .filter(Boolean)
        .join('\n')
    );
  };

  addUrl(`${origin}/`, nowIso);
  addUrl(`${origin}/pricing`, nowIso);
  addUrl(`${origin}/community`, nowIso);

  for (const r of rows) {
    const last = r.updated_at || r.created_at || nowIso;
    addUrl(`${origin}/listing/${r.id}`, last);
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    ''
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600'
    }
  });
};
