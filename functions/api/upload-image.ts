interface Env {
  SOLERZ_R2: R2Bucket;
  R2_PUBLIC_DOMAIN?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response(
        JSON.stringify({ error: 'Content-Type must be multipart/form-data' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No image file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!file.type.startsWith('image/')) {
      return new Response(
        JSON.stringify({ error: 'Uploaded file is not a valid image' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (file.size > 2 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'File size exceeds 2MB limit' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const fileExtension = file.name.split('.').pop() || 'webp';
    const uniqueKey = `proofs/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${fileExtension}`;

    const arrayBuffer = await file.arrayBuffer();
    await env.SOLERZ_R2.put(uniqueKey, arrayBuffer, {
      httpMetadata: {
        contentType: file.type || 'image/webp',
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });

    const publicDomain = env.R2_PUBLIC_DOMAIN || 'https://pub-solerz.r2.dev';
    const publicUrl = `${publicDomain}/${uniqueKey}`;

    return new Response(
      JSON.stringify({ success: true, url: publicUrl, key: uniqueKey }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
