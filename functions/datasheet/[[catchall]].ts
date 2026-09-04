import type { Env, PagesFunction } from '../_utils';

/**
 * Legacy datasheet URL handler.
 * Explicitly returns HTTP 410 Gone (Permanently Removed) with noindex header
 * so that Googlebot immediately drops all legacy /datasheet/... URLs from search index.
 */
export const onRequest: PagesFunction<Env> = async () => {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>410 Gone — Datasheet Permanently Removed | Solerz</title>
  <meta name="robots" content="noindex, nofollow" />
</head>
<body style="font-family:sans-serif; text-align:center; padding:50px;">
  <h1>410 — Datasheet Permanently Removed</h1>
  <p>This legacy datasheet page has been permanently removed. Please visit our <a href="/solar-panels">Solar Hardware Catalog</a> to access our latest technical datasheets and PAN specifications.</p>
</body>
</html>`,
    {
      status: 410,
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    }
  );
};
