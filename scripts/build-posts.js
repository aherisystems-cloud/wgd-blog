const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const POSTS_DIR = path.join(__dirname, '../content/posts');
const OUTPUT_DIR = path.join(__dirname, '../posts');
const TEMPLATE_PATH = path.join(__dirname, '../templates/post-template.html');
const POSTS_JSON_PATH = path.join(__dirname, '../posts.json');
const IMAGES_BASE_DIR = path.join(__dirname, '../content/images');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Read template
const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

// ---------------------------------------------------------------------------
// IMAGE EXTENSION RESOLVER  (handles all three problem cases)
// ---------------------------------------------------------------------------
// Problem 1: No extension in frontmatter  → probe all extensions
// Problem 2: Double extension (.jpg.jpg)  → strip the duplicate first
// Problem 3: Case mismatch on Linux       → case-insensitive directory scan
// ---------------------------------------------------------------------------

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg'];

/**
 * Strip a double extension if present, e.g.
 *   "hero.jpg.jpg"  → "hero.jpg"
 *   "photo.PNG.png" → "photo.PNG"   (keeps the first, removes the duplicate)
 *   "image.jpg"     → "image.jpg"   (unchanged)
 */
function stripDoubleExtension(filePath) {
  // Match any known extension repeated twice (case-insensitive)
  return filePath.replace(
    /(\.(jpe?g|png|webp|avif|gif|svg))\1$/i,
    '$1'
  );
}

/**
 * Given an image path that may or may not include an extension, find the
 * first matching file on disk and return the path WITH the correct extension.
 *
 * Handles:
 *  • No extension      → probes .jpg .jpeg .png .webp .avif .gif .svg
 *  • Double extension  → strips duplicate before probing
 *  • Wrong case        → case-insensitive scan of the directory
 *  • Correct path      → returned as-is if file exists
 */
function resolveImagePath(imagePath) {
  if (!imagePath) return imagePath;

  // ── Step 0: strip double extension ──────────────────────────────────────
  imagePath = stripDoubleExtension(imagePath);

  // Strip leading slash for filesystem join
  const relative = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  const absolute = path.join(__dirname, '..', relative);

  // ── Step 1: path already has a known extension ───────────────────────────
  const existingExt = path.extname(absolute).toLowerCase();
  if (IMAGE_EXTENSIONS.includes(existingExt)) {
    if (fs.existsSync(absolute)) return imagePath;          // exact match ✓
    // File not found with that extension — strip it and probe others below
  }

  // ── Step 2: probe every extension (no extension, or wrong extension) ─────
  const base = existingExt
    ? absolute.slice(0, -existingExt.length)   // strip wrong ext
    : absolute;                                 // bare path

  for (const ext of IMAGE_EXTENSIONS) {
    const candidate = base + ext;
    if (fs.existsSync(candidate)) {
      return toWebPath(candidate);
    }
  }

  // ── Step 3: case-insensitive fallback (critical on Linux) ─────────────────
  const dir      = path.dirname(base);
  const basename = path.basename(base).toLowerCase();

  if (fs.existsSync(dir)) {
    const entries = fs.readdirSync(dir);
    for (const ext of IMAGE_EXTENSIONS) {
      const target = basename + ext;                        // e.g. "hero-image.jpg"
      const match  = entries.find(e => e.toLowerCase() === target);
      if (match) {
        return toWebPath(path.join(dir, match));
      }
    }
  }

  // ── Step 4: nothing found — warn and return original so browser shows 404 ─
  console.warn(`  ⚠️  Image not found on disk: ${imagePath}`);
  return imagePath;
}

/** Convert an absolute filesystem path back to a root-relative web path. */
function toWebPath(absolutePath) {
  return '/' + path.relative(path.join(__dirname, '..'), absolutePath)
                   .split(path.sep).join('/');
}

/**
 * Walk through rendered HTML and resolve every <img src="..."> that
 * refers to an extensionless path (or a path whose file doesn't exist).
 */
function resolveImagesInHtml(html) {
  return html.replace(/(<img\s[^>]*src=["'])([^"']+)(["'])/gi, (match, before, src, after) => {
    // Only resolve paths that are site-relative (start with / or content/)
    if (src.startsWith('http') || src.startsWith('data:')) return match;
    const resolved = resolveImagePath(src);
    return `${before}${resolved}${after}`;
  });
}

/** Convenience wrapper used for single image paths (frontmatter, products). */
function resolveImage(imagePath) {
  return resolveImagePath(imagePath);
}

// ---------------------------------------------------------------------------
// DEFAULT SIDEBAR PRODUCTS
// ---------------------------------------------------------------------------
const DEFAULT_SIDEBAR_PRODUCTS = `
  <a href="https://amzn.to/4aumant" class="sidebar-product" target="_blank" rel="nofollow sponsored">
    <img src="/content/images/products/sectional-sofa-thumb.jpg" alt="Modern Sectional Sofa" class="sidebar-product-image">
    <div class="sidebar-product-info">
      <h4>Modern Sectional Sofa</h4>
      <div class="sidebar-product-price">$500-650</div>
      <span class="sidebar-cta">Shop Now →</span>
    </div>
  </a>
  
  <a href="/posts/best-standing-desks.html" class="sidebar-product">
    <img src="/content/images/posts/standing-desk-thumb.jpg" alt="Best Standing Desks" class="sidebar-product-image">
    <div class="sidebar-product-info">
      <h4>Best Standing Desks 2026</h4>
      <span class="sidebar-cta">Read More →</span>
    </div>
  </a>
  
  <a href="https://amzn.to/4rle6N6" class="sidebar-product" target="_blank" rel="nofollow sponsored">
    <img src="/content/images/products/throw-pillows-thumb.jpg" alt="Velvet Throw Pillows" class="sidebar-product-image">
    <div class="sidebar-product-info">
      <h4>Luxury Throw Pillows</h4>
      <div class="sidebar-product-price">$35-58</div>
      <span class="sidebar-cta">Shop Now →</span>
    </div>
  </a>
`;

// ---------------------------------------------------------------------------
// SIDEBAR PRODUCT GENERATOR
// ---------------------------------------------------------------------------
function generateSidebarProducts(frontmatter) {
  if (frontmatter.featured_products && Array.isArray(frontmatter.featured_products)) {
    return frontmatter.featured_products.map(product => {
      const isProduct = product.price;
      const resolvedImage = resolveImage(product.image);
      return `
  <a href="${product.link}" class="sidebar-product" target="_blank" rel="nofollow ${isProduct ? 'sponsored' : ''}">
    <img src="${resolvedImage}" alt="${product.name}" class="sidebar-product-image">
    <div class="sidebar-product-info">
      <h4>${product.name}</h4>
      ${isProduct ? `<div class="sidebar-product-price">${product.price}</div>` : ''}
      <span class="sidebar-cta">${isProduct ? 'Shop Now' : 'Read More'} →</span>
    </div>
  </a>`;
    }).join('\n  ');
  }
  return DEFAULT_SIDEBAR_PRODUCTS;
}

// ---------------------------------------------------------------------------
// BUILD LOOP
// ---------------------------------------------------------------------------
const mdFiles = fs.readdirSync(POSTS_DIR)
  .filter(f => f.endsWith('.md') && fs.statSync(path.join(POSTS_DIR, f)).isFile());

console.log(`📝 Found ${mdFiles.length} posts to build...\n`);

const postsMetadata = [];

mdFiles.forEach(file => {
  const filePath = path.join(POSTS_DIR, file);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data: frontmatter, content } = matter(fileContent);

  if (!frontmatter.slug) {
    console.log(`⚠️  Skipped ${file}: Missing slug`);
    return;
  }

  // Convert markdown → HTML, then resolve image paths
  let htmlContent = marked.parse(content);
  htmlContent = resolveImagesInHtml(htmlContent);

  // Format date
  const publishDate     = frontmatter.date ? new Date(frontmatter.date) : new Date();
  const formattedDate   = publishDate.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  // Read time
  const wordCount = content.split(/\s+/).length;
  const readTime  = Math.ceil(wordCount / 200);

  // Category
  const primaryCategory = Array.isArray(frontmatter.categories)
    ? frontmatter.categories[0]
    : (frontmatter.category || 'Blog');
  const categorySlug = primaryCategory.toLowerCase().replace(/\s+/g, '-');

  // Featured image — auto-resolved
  const resolvedFeaturedImage = resolveImage(
    frontmatter.featured_image || '/content/images/default.jpg'
  );

  // Sidebar products
  const sidebarProducts = generateSidebarProducts(frontmatter);

  // Tags HTML
  const tagsHTML = (frontmatter.tags || [])
    .map(t => `<a href="/tag/${t.toLowerCase().replace(/\s+/g, '-')}.html" class="tag">${t}</a>`)
    .join('\n        ');

  // Excerpt
  const excerpt = frontmatter.description ||
                  content.replace(/[#*_\[\]]/g, '').substring(0, 160).trim() + '...';

  // Fill template
  let html = template
    .replace(/\{\{TITLE\}\}/g,                  frontmatter.title || 'Untitled Post')
    .replace(/\{\{SEO_TITLE\}\}/g,              frontmatter.seo_title || frontmatter.title || 'Untitled Post')
    .replace(/\{\{SEO_DESCRIPTION\}\}/g,        frontmatter.description || excerpt)
    .replace(/\{\{SLUG\}\}/g,                   frontmatter.slug)
    .replace(/\{\{CATEGORY\}\}/g,               primaryCategory)
    .replace(/\{\{CATEGORY_SLUG\}\}/g,          categorySlug)
    .replace(/\{\{ARTICLE_CONTENT\}\}/g,        htmlContent)
    .replace(/\{\{FEATURED_IMAGE\}\}/g,         resolvedFeaturedImage)
    .replace(/\{\{FEATURED_IMAGE_ALT\}\}/g,     frontmatter.featured_image_alt || frontmatter.title || 'Blog post image')
    .replace(/\{\{PUBLISH_DATE\}\}/g,           publishDate.toISOString())
    .replace(/\{\{PUBLISH_DATE_FORMATTED\}\}/g, formattedDate)
    .replace(/\{\{READ_TIME\}\}/g,              readTime)
    .replace(/\{\{TAGS_HTML\}\}/g,              tagsHTML)
    .replace(/\{\{KEYWORDS\}\}/g,               (frontmatter.keywords || frontmatter.tags || []).join(', '))
    .replace(/\{\{AUTHOR_NAME\}\}/g,            frontmatter.author_name || 'Wow Glam Decor Team')
    .replace(/\{\{AUTHOR_ROLE\}\}/g,            frontmatter.author_role || 'Interior Design Expert')
    .replace(/\{\{AUTHOR_BIO\}\}/g,             frontmatter.author_bio || 'Passionate about creating beautiful, functional living spaces on any budget.')
    .replace(/\{\{AUTHOR_AVATAR\}\}/g,          frontmatter.author_avatar || '/content/images/author-avatar.jpg')
    .replace(/\{\{SIDEBAR_PRODUCTS\}\}/g,       sidebarProducts);

  // Write output
  const outputPath = path.join(OUTPUT_DIR, `${frontmatter.slug}.html`);
  fs.writeFileSync(outputPath, html, 'utf8');

  console.log(`✅ Built: ${frontmatter.slug}.html (${readTime} min read, ${wordCount} words)`);

  postsMetadata.push({
    title:          frontmatter.title || 'Untitled Post',
    slug:           frontmatter.slug,
    url:            `/posts/${frontmatter.slug}.html`,
    description:    excerpt,
    excerpt:        excerpt,
    category:       primaryCategory,
    categorySlug:   categorySlug,
    categories:     frontmatter.categories || [primaryCategory],
    tags:           frontmatter.tags || [],
    featured_image: resolvedFeaturedImage,
    date:           publishDate.toISOString(),
    dateFormatted:  formattedDate,
    readTime:       readTime,
    wordCount:      wordCount,
    author:         frontmatter.author_name || 'Wow Glam Decor Team',
    content:        content.substring(0, 500)
  });
});

// ---------------------------------------------------------------------------
// OUTPUT SUMMARY
// ---------------------------------------------------------------------------
console.log('\n📦 Generating posts.json for search...');
fs.writeFileSync(POSTS_JSON_PATH, JSON.stringify(postsMetadata, null, 2), 'utf8');
console.log(`✅ Created posts.json with ${postsMetadata.length} posts`);

console.log(`\n✨ Build complete!`);
console.log(`   📄 Generated ${mdFiles.length} HTML files`);
console.log(`   🔍 Created posts.json for search`);
console.log(`   📊 Total words: ${postsMetadata.reduce((sum, p) => sum + p.wordCount, 0).toLocaleString()}`);
console.log(`   ⏱️  Average read time: ${Math.round(postsMetadata.reduce((sum, p) => sum + p.readTime, 0) / postsMetadata.length)} minutes`);
