import type { Env, PagesFunction } from './_utils';
import { cleanBaseHtml, escapeHtml, fetchIndexHtml, getOrigin, injectHead, injectRootContent } from './_utils';

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const origin = getOrigin(request);
  const canonical = `${origin}/contact`;

  let baseHtml = await fetchIndexHtml(env, origin);
  baseHtml = cleanBaseHtml(baseHtml);

  const title = 'Contact Us & Technical Support | Solerz';
  const description =
    'Get in touch with the Solerz engineering team. Technical support, datasheet parameters corrections, manufacturer listings, and API feedback.';

  const head = [
    `<title>${escapeHtml(title)}</title>`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />',
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Solerz" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${origin}/theme_logo.png" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: title,
    description,
    url: canonical,
    mainEntity: {
      '@type': 'Organization',
      name: 'Solerz',
      url: origin,
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'support@solerz.com',
        contactType: 'customer support',
      },
    },
  };

  head.push(`<script type="application/ld+json">\n${JSON.stringify(jsonLd)}\n</script>`);

  const prerenderBody = `
  <div id="ssr-contact-prerender" style="max-width: 900px; margin: 30px auto; padding: 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.65;">
    <nav style="font-size: 13px; margin-bottom: 20px; color: #64748b;">
      <a href="/" style="color: #059669; text-decoration: none; font-weight: 600;">Home</a> &gt; <span>Contact Us</span>
    </nav>

    <header style="border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
      <div style="display: inline-block; padding: 4px 12px; background: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; margin-bottom: 8px;">
        Engineering Support &amp; Inquiries
      </div>
      <h1 style="font-size: 32px; font-weight: 900; color: #0f172a; margin: 0 0 10px 0;">
        Contact Us
      </h1>
      <p style="font-size: 16px; color: #475569; margin: 0;">
        We welcome inquiries from solar design engineers, EPC installers, equipment manufacturers, and researchers.
      </p>
    </header>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-bottom: 30px;">
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px;">
        <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 8px;">
          Direct Email Desk
        </h2>
        <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">
          For technical questions, datasheet corrections, or general feedback:
        </p>
        <a href="mailto:support@solerz.com" style="display: inline-block; padding: 10px 18px; background: #059669; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px;">
          support@solerz.com
        </a>
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 24px;">
        <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 8px;">
          Manufacturer Submissions
        </h2>
        <p style="font-size: 13px; color: #64748b; margin-bottom: 12px;">
          Are you a solar module, inverter, or battery OEM? Submit new PAN files or updated technical datasheets for catalog inclusion directly to our engineering desk.
        </p>
        <div style="font-size: 12px; color: #059669; font-weight: 700;">Average review turnaround: 24–48 hours</div>
      </div>
    </div>
  </div>
  `;

  baseHtml = injectRootContent(baseHtml, prerenderBody);
  const html = injectHead(baseHtml, head.join('\n'));

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400',
    },
  });
};
