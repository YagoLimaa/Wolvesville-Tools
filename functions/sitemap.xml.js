export async function onRequest(context) {
  if (context.request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const staticPages = [
      { url: 'https://wolvesville-tools.pages.dev/', changefreq: 'weekly', priority: '1.0' },
      { url: 'https://wolvesville-tools.pages.dev/search', changefreq: 'weekly', priority: '0.9' },
      { url: 'https://wolvesville-tools.pages.dev/items/shop', changefreq: 'daily', priority: '0.8' },
      { url: 'https://wolvesville-tools.pages.dev/items/skins', changefreq: 'weekly', priority: '0.8' },
      { url: 'https://wolvesville-tools.pages.dev/clan/search', changefreq: 'weekly', priority: '0.8' },
      { url: 'https://wolvesville-tools.pages.dev/clan/rankings', changefreq: 'weekly', priority: '0.8' },
    ];

    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    for (const page of staticPages) {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${page.url}</loc>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += '  </url>\n';
    }

    sitemap += '</urlset>';

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar sitemap:', error);
    return new Response('Erro ao gerar sitemap', { status: 500 });
  }
}
