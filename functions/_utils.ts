export type Env = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  ASSETS: Fetcher;
};

export const getOrigin = (request: Request) => {
  const url = new URL(request.url);
  return url.origin;
};

export const supabaseRestGet = async <T>(
  env: Env,
  pathWithQuery: string
): Promise<{ data: T | null; error?: string; status: number }> => {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return { data: null, error: 'Missing SUPABASE_URL or SUPABASE_ANON_KEY', status: 500 };
  }

  const url = `${env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${pathWithQuery.replace(/^\//, '')}`;
  const res = await fetch(url, {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      Accept: 'application/json'
    }
  });

  const status = res.status;
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return { data: null, error: text || res.statusText, status };
  }

  const json = (await res.json().catch(() => null)) as T | null;
  return { data: json, status };
};

export const fetchIndexHtml = async (env: Env, origin: string) => {
  const res = await env.ASSETS.fetch(new Request(`${origin}/index.html`, { method: 'GET' }));
  return await res.text();
};

export const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const injectHead = (html: string, headMarkup: string) => {
  const idx = html.indexOf('</head>');
  if (idx === -1) return html;
  return `${html.slice(0, idx)}\n${headMarkup}\n${html.slice(idx)}`;
};
