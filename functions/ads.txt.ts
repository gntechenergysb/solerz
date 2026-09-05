import type { Env, PagesFunction } from './_utils';

export const onRequest: PagesFunction<Env> = async () => {
  const body = 'google.com, pub-3521815322299744, DIRECT, f08c47fec0942fa0\n';

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400',
    },
  });
};
