import type { Env, PagesFunction } from '../_utils';

/**
 * Legacy marketplace listing handler.
 * Explicitly returns HTTP 410 Gone (Permanently Removed) with noindex header
 * so that Googlebot immediately drops all legacy /listing/... URLs from search index.
 */
export const onRequest: PagesFunction<Env> = async () => {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>410 Gone — Page Permanently Removed | Solerz</title>
  <meta name="robots" content="noindex, nofollow" />
</head>
<body style="font-family:sans-serif; text-align:center; padding:50px;">
  <h1>410 — Page Permanently Removed</h1>
  <p>This legacy listing has been permanently removed. Please visit our <a href="/">Solar Hardware Catalog</a>.</p>
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
