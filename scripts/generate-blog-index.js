const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const POSTS_DIR    = path.join(__dirname, '../content/posts');
const OUTPUT_PATH  = path.join(__dirname, '../blog.html');
const TEMPLATE_PATH = path.join(__dirname, '../templates/blog-index-template.html');

console.log('📰 Generating blog index...\n');

if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error('❌ Template not found:', TEMPLATE_PATH);
  process.exit(1);
}

const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

// ---------------------------------------------------------------------------
// ✅ FULL IMAGE RESOLVER  (matches build-posts.js logic exactly)
//
// Handles ALL four problem cases:
//   1. No extension          → probes .jpg .jpeg .png .webp .avif .gif .svg
//   2. Double extension      → strips duplicate before probing  (hero.jpg.jpg → hero.jpg)
//   3. Case mismatch on Linux → case-insensitive directory scan
//   4. Amazon / http URLs    → returned untouched
// ---------------------------------------------------------------------------
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg'];

function stripDoubleExtension(filePath) {
  return filePath.replace(/(\.(jpe?g|png|webp|avif|gif|svg))\1$/i, '$1');
}

function toWebPath(absolutePath) {
  return '/' + path.relative(path.join(__dirname, '..'), absolutePath)
                   .split(path.sep).join('/');
}

function resolveImagePath(imagePath) {
  if (!imagePath) return '/content/images/default-post.jpg';

  // Amazon CDN / any full URL — never touch
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;

  // Step 0: strip double extension
  imagePath = stripDoubleExtension(imagePath);

  const relative = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  const absolute = path.join(__dirname, '..', relative);

  // Step 1: path has a known extension — try exact match first
  const existingExt = path.extname(absolute).toLowerCase();
  if (IMAGE_EXTENSIONS.includes(existingExt)) {
    if (fs.existsSync(absolute)) return imagePath;
    // File not found with stated extension — fall through and probe others
  }

  // Step 2: probe every extension
  const base = existingExt ? absolute.slice(0, -existingExt.length) : absolute;
  for (const ext of IMAGE_EXTENSIONS) {
    const candidate = base + ext;
    if (fs.existsSync(candidate)) return toWebPath(candidate);
  }

  // Step 3: case-insensitive fallback (critical on Linux servers)
  const dir      = path.dirname(base);
  const basename = path.basename(base).toLowerCase();
  if (fs.existsSync(dir)) {
    const entries = fs.readdirSync(dir);
    for (const ext of IMAGE_EXTENSIONS) {
      const target = basename + ext;
      const match  = entries.find(e => e.toLowerCase() === target);
      if (match) return toWebPath(path.join(dir, match));
    }
  }

  // Step 4: nothing found — warn and return original (browser will show 404 placeholder)
  console.warn(`  ⚠️  Image not found on disk: ${imagePath}`);
  return imagePath;
}

// Convenience alias
function fixImg(src) {
  return resolveImagePath(src || '');
}

// ---------------------------------------------------------------------------
// READ & SORT POSTS
// ---------------------------------------------------------------------------
const mdFiles = fs.readdirSync(POSTS_DIR)
  .filter(f => f.endsWith('.md') && fs.statSync(path.join(POSTS_DIR, f)).isFile());

let posts = [];

mdFiles.forEach(file => {
  try {
    const filePath = path.join(POSTS_DIR, file);
    const { data: frontmatter, content } = matter(fs.readFileSync(filePath, 'utf8'));

    if (frontmatter.published === false) return;

    posts.push({
      title:          frontmatter.title || 'Untitled',
      slug:           frontmatter.slug  || file.replace('.md', ''),
      description:    frontmatter.description || '',
      date:           frontmatter.date ? new Date(frontmatter.date) : new Date(),
      categories:     frontmatter.categories || [],
      tags:           frontmatter.tags || [],
      // ✅ Use full resolveImagePath — handles no-extension, double-ext, wrong case
      featured_image: fixImg(frontmatter.featured_image || ''),
      readTime:       Math.ceil(content.split(/\s+/).length / 200) || 1,
    });
  } catch (e) {
    console.error(`Error processing ${file}:`, e.message);
  }
});

posts.sort((a, b) => b.date - a.date);

// ---------------------------------------------------------------------------
// FEATURED POST (most recent)
// ---------------------------------------------------------------------------
const featuredPost   = posts[0];
const remainingPosts = posts.slice(1);

const featuredHTML = featuredPost ? `
<a href="/posts/${featuredPost.slug}.html" class="featured-post">
  <div class="featured-image-wrap">
    <img
      src="${featuredPost.featured_image}"
      alt="${featuredPost.title}"
      class="featured-image"
      onerror="this.src='/content/images/default-post.jpg'">
    <span class="featured-badge">✨ Editor's Pick</span>
  </div>
  <div class="featured-content">
    <div class="post-meta-row">
      <span class="post-cat">${featuredPost.categories[0] || 'Decor'}</span>
      <span class="post-date">📅 ${featuredPost.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
      <span class="post-time">⏱️ ${featuredPost.readTime} min read</span>
    </div>
    <h2 class="featured-title">${featuredPost.title}</h2>
    <p class="featured-excerpt">${featuredPost.description}</p>
    <span class="read-more-btn">Read Full Guide + Shop Products →</span>
  </div>
</a>` : '';

// ---------------------------------------------------------------------------
// POST GRID CARDS
// ---------------------------------------------------------------------------
const gridHTML = remainingPosts.map(post => `
<a href="/posts/${post.slug}.html" class="post-card">
  <div class="card-image-wrap">
    <img
      src="${post.featured_image}"
      alt="${post.title}"
      class="card-image"
      loading="lazy"
      onerror="this.src='/content/images/default-post.jpg'">
    <span class="card-cat">${post.categories[0] || 'Decor'}</span>
  </div>
  <div class="card-content">
    <div class="card-meta">
      <span>${post.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      <span>⏱️ ${post.readTime} min</span>
    </div>
    <h3 class="card-title">${post.title}</h3>
    <p class="card-excerpt">${post.description}</p>
    <span class="card-link">Read + Shop →</span>
  </div>
</a>`).join('\n');

const noPostsHTML = '<p style="text-align:center;padding:48px;color:#757575;">No posts yet. Check back soon!</p>';

// ---------------------------------------------------------------------------
// CATEGORY FILTER BUTTONS
// ---------------------------------------------------------------------------
const allCategories = [...new Set(posts.flatMap(p => p.categories))].slice(0, 14);

const filterHTML = allCategories.map(cat => {
  const slug = cat
    .toLowerCase()
    .replace(/[&]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `<a href="/category/${slug}.html" class="filter-btn">${cat}</a>`;
}).join('\n');

// ---------------------------------------------------------------------------
// INJECT INTO TEMPLATE
// Note: {{POSTS_GRID}} is used for BOTH the grid and list containers in the
// template, so we replace both occurrences with the same card HTML.
// The JS switchView() function handles showing/hiding via display:grid/flex.
// ---------------------------------------------------------------------------
const html = template
  .replace(/\{\{FEATURED_POST\}\}/g,    featuredHTML)
  .replace(/\{\{POSTS_GRID\}\}/g,       gridHTML || noPostsHTML)  // replaces both occurrences
  .replace(/\{\{POSTS_LIST\}\}/g,       '')                       // safety: blank any leftover token
  .replace(/\{\{CATEGORY_FILTERS\}\}/g, filterHTML)
  .replace(/\{\{TOTAL_POSTS\}\}/g,      posts.length);

fs.writeFileSync(OUTPUT_PATH, html, 'utf8');

console.log(`✅ Blog index → /blog.html (${posts.length} posts)`);
console.log(`   Featured: "${featuredPost ? featuredPost.title : 'none'}"`);
console.log(`   Grid cards: ${remainingPosts.length}`);
console.log(`   Categories: ${allCategories.length}`);
