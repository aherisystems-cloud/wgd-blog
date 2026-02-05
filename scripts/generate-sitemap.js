const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../content/posts/index.json');
const outputPath = path.join(__dirname, '../sitemap.xml');

const posts = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

const urls = [
  { loc: 'https://wowglamdecor.com/', priority: '1.0' },
  { loc: 'https://wowglamdecor.com/blog.html', priority: '0.9' },
  ...posts.map(post => ({
    loc: `https://wowglamdecor.com/posts/${post.slug}.html`,
    lastmod: post.date,
    priority: '0.8'
  }))
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(outputPath, xml);
console.log('✅ Generated sitemap.xml');
