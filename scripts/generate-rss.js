const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const POSTS_DIR = path.join(__dirname, '../content/posts');
const OUTPUT_PATH = path.join(__dirname, '../feed.xml');
const BASE_URL = 'https://wowglamdecor.com';
const SITE_NAME = 'Wow Glam Decor';
const SITE_DESC = 'Home decor ideas, furniture guides, and curated product recommendations for every style and budget.';

console.log('📡 Generating RSS feed...\n');

const esc = str => (str || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const mdFiles = fs.readdirSync(POSTS_DIR)
  .filter(f => f.endsWith('.md') && fs.statSync(path.join(POSTS_DIR, f)).isFile());

let posts = [];

mdFiles.forEach(file => {
  try {
    const { data: fm, content } = matter(fs.readFileSync(path.join(POSTS_DIR, file), 'utf8'));
    if (fm.published === false) return;
    posts.push({
      title: esc(fm.title || 'Untitled'),
      slug: fm.slug || file.replace('.md', ''),
      description: esc(fm.description || ''),
      htmlContent: marked.parse(content),
      date: fm.date ? new Date(fm.date) : new Date(),
      categories: fm.categories || [],
      tags: fm.tags || [],
      featured_image: fm.featured_image || '/content/images/default-post.jpg',
    });
  } catch (e) {
    console.error(`Error: ${file}:`, e.message);
  }
});

posts.sort((a, b) => b.date - a.date);
const rssPosts = posts.slice(0, 20);
const lastBuild = rssPosts[0]?.date.toUTCString() || new Date().toUTCString();

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${BASE_URL}</link>
    <description>${SITE_DESC}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <ttl>60</ttl>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE_URL}/content/images/logo.jpg</url>
      <title>${SITE_NAME}</title>
      <link>${BASE_URL}</link>
    </image>
    <copyright>Copyright ${new Date().getFullYear()} ${SITE_NAME}</copyright>
    <managingEditor>hello@wowglamdecor.com (${SITE_NAME})</managingEditor>

${rssPosts.map(post => `    <item>
      <title>${post.title}</title>
      <link>${BASE_URL}/posts/${post.slug}.html</link>
      <guid isPermaLink="true">${BASE_URL}/posts/${post.slug}.html</guid>
      <description>${post.description}</description>
      <content:encoded><![CDATA[${post.htmlContent}]]></content:encoded>
      <pubDate>${post.date.toUTCString()}</pubDate>
      <dc:creator>Wow Glam Decor Team</dc:creator>
      ${post.categories.map(c => `<category>${esc(c)}</category>`).join('\n      ')}
      <media:content url="${BASE_URL}${post.featured_image}" medium="image"/>
    </item>`).join('\n\n')}

  </channel>
</rss>`;

fs.writeFileSync(OUTPUT_PATH, xml, 'utf8');
console.log(`✅ RSS feed → /feed.xml (${rssPosts.length} posts)`);
