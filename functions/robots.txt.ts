import type { Env } from './_utils';
import { getOrigin } from './_utils';

export const onRequest: PagesFunction<Env> = async ({ request }) => {
  const origin = getOrigin(request);

  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /dashboard',
    'Disallow: /create',
    'Disallow: /edit',
    'Disallow: /login',
    'Disallow: /signup',
    `Sitemap: ${origin}/sitemap.xml`,
    ''
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600'
    }
  });
};
