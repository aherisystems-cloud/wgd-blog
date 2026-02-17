const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const POSTS_DIR = path.join(__dirname, '../content/posts');
const OUTPUT_PATH = path.join(__dirname, '../sitemap.xml');
const BASE_URL = 'https://wowglamdecor.com';
const TODAY = new Date().toISOString().split('T')[0];

console.log('🗺️  Generating sitemap...\n');

const staticPages = [
  { url: '/',                         changefreq: 'daily',   priority: '1.0' },
  { url: '/blog.html',               changefreq: 'daily',   priority: '0.9' },
  { url: '/about.html',              changefreq: 'monthly', priority: '0.6' },
  { url: '/contact.html',            changefreq: 'monthly', priority: '0.5' },
  { url: '/affiliate-disclosure.html', changefreq: 'yearly', priority: '0.3' },
  { url: '/privacy-policy.html',     changefreq: 'yearly',  priority: '0.3' },
];

// Buying intent pages get priority 0.8, others 0.7
const moneyPages = [
  'budget-furniture','luxury-furniture','space-saving-furniture',
  'multifunctional-furniture','furniture-buying-guides','best-of-lists',
  'product-reviews','comparisons','home-gift-ideas','housewarming-gifts',
  'luxury-home-gifts','budget-gift-ideas'
];

const allCategories = [
  // Core Rooms
  'living-room','bedroom','dining-room','home-office','kitchen','bathroom',
  'entryway-hallway','laundry-room','kids-room-nursery','outdoor-patio','balcony-small-spaces',
  // Furniture
  'sofas-seating','beds-bed-frames','mattresses','tables-desks','chairs-stools',
  'wardrobes-closets','tv-stands-media-units','shelving-bookcases','storage-furniture',
  // Decor
  'wall-decor','lighting-lamps','rugs-carpets','curtains-window-treatments',
  'mirrors','cushions-throws','vases-decorative-accents','clocks','plants-planters',
  // Storage
  'closet-organization','shoe-storage','kitchen-storage-solutions',
  'bathroom-storage-solutions','small-space-storage',
  // Style
  'modern-style','minimalist-style','scandinavian-style','luxury-glam-decor',
  'boho-rustic-decor','traditional-classic','industrial-style',
  // Buying Intent
  'budget-furniture','luxury-furniture','space-saving-furniture','multifunctional-furniture',
  'furniture-buying-guides','best-of-lists','product-reviews','comparisons',
  // DIY
  'diy-home-improvement','furniture-care-maintenance','cleaning-care-tips','furniture-assembly-tips',
  // Seasonal
  'seasonal-decor','holiday-decor','home-makeovers','rental-friendly-decor',
  // Gifts
  'home-gift-ideas','housewarming-gifts','luxury-home-gifts','budget-gift-ideas'
];

// Read posts
const mdFiles = fs.readdirSync(POSTS_DIR)
  .filter(f => f.endsWith('.md') && fs.statSync(path.join(POSTS_DIR, f)).isFile());

let posts = [];
let tags = new Set();

mdFiles.forEach(file => {
  try {
    const { data: frontmatter } = matter(fs.readFileSync(path.join(POSTS_DIR, file), 'utf8'));
    if (frontmatter.published === false) return;
    posts.push({
      slug: frontmatter.slug || file.replace('.md', ''),
      date: frontmatter.date ? new Date(frontmatter.date).toISOString().split('T')[0] : TODAY,
    });
    (frontmatter.tags || []).forEach(t =>
      tags.add(t.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
    );
  } catch (e) {
    console.error(`Error: ${file}:`, e.message);
  }
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- STATIC PAGES -->
${staticPages.map(p => `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}

  <!-- BLOG POSTS (priority 0.8 = high value content) -->
${posts.map(p => `  <url>
    <loc>${BASE_URL}/posts/${p.slug}.html</loc>
    <lastmod>${p.date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}

  <!-- CATEGORY PAGES -->
${allCategories.map(slug => `  <url>
    <loc>${BASE_URL}/category/${slug}.html</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${moneyPages.includes(slug) ? '0.8' : '0.7'}</priority>
  </url>`).join('\n')}

  <!-- TAG PAGES -->
${[...tags].map(slug => `  <url>
    <loc>${BASE_URL}/tag/${slug}.html</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`).join('\n')}

</urlset>`;

fs.writeFileSync(OUTPUT_PATH, xml, 'utf8');
const total = staticPages.length + posts.length + allCategories.length + tags.size;
console.log(`✅ Sitemap → /sitemap.xml`);
console.log(`   Static: ${staticPages.length} | Posts: ${posts.length} | Categories: ${allCategories.length} | Tags: ${tags.size}`);
console.log(`   Total URLs: ${total}`);
