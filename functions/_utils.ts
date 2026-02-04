export type Env = {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
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
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { data: null, error: 'Missing SUPABASE_URL or SUPABASE_ANON_KEY', status: 500 };
  }

  const url = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${pathWithQuery.replace(/^\//, '')}`;
  const res = await fetch(url, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
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
