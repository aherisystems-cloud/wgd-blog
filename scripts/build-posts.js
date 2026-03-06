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
// IMAGE HELPER — detects Amazon CDN URLs vs local paths
// ---------------------------------------------------------------------------
// Amazon product image URLs look like:
//   https://m.media-amazon.com/images/I/71xxxxx.jpg
//   https://images-na.ssl-images-amazon.com/images/I/71xxxxx.jpg
// If the image field is already a full URL (http/https), use it as-is.
// Only run resolveImage() for local /content/images/ paths.
function resolveProductImage(imagePath) {
  if (!imagePath) return '';
  // Already a full URL (Amazon CDN, or any https) — use directly, no disk check
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Local path — resolve normally (handles missing extensions, case etc.)
  return resolveImage(imagePath);
}

// ---------------------------------------------------------------------------
// BUDGET TIER BADGE HTML
// ---------------------------------------------------------------------------
function budgetTierBadge(tier) {
  if (!tier) return '';
  const map = {
    'Budget Pick':  { cls: 'tier-budget',  icon: '💚' },
    'Mid-Range':    { cls: 'tier-mid',     icon: '🟡' },
    'Luxury':       { cls: 'tier-luxury',  icon: '💜' },
  };
  const t = map[tier];
  if (!t) return '';
  return `<span class="sidebar-budget-tier ${t.cls}">${t.icon} ${tier}</span>`;
}

// ---------------------------------------------------------------------------
// LABEL BAR HTML
// ---------------------------------------------------------------------------
function labelBar(label) {
  if (!label) return '<div class="sidebar-product-label label-none"></div>';
  const map = {
    'NEW':            'label-new',
    'SALE':           'label-sale',
    'TOP PICK':       'label-top-pick',
    "EDITOR'S PICK":  'label-editors-pick',
    'BEST VALUE':     'label-best-value',
    'LIMITED':        'label-limited',
  };
  const cls = map[label.toUpperCase()] || 'label-custom';
  return `<div class="sidebar-product-label ${cls}">
    <span>${label}</span><span>Shop →</span>
  </div>`;
}

// ---------------------------------------------------------------------------
// DEFAULT SIDEBAR — permanent ads/products shown on EVERY post
// Update these with your real Amazon affiliate links and Amazon CDN image URLs.
// To get an Amazon CDN image URL: open product page → right-click main image
// → Copy image address. It will start with https://m.media-amazon.com/images/I/
// ---------------------------------------------------------------------------
const DEFAULT_SIDEBAR_PRODUCTS = `
  <div class="sidebar-section-title">🌟 Featured Products</div>

  <a href="https://amzn.to/YOUR-LINK-1" class="sidebar-product" target="_blank" rel="nofollow noopener sponsored">
    <div class="sidebar-product-label label-top-pick"><span>⭐ Top Pick</span><span>Shop →</span></div>
    <div class="sidebar-product-inner">
      <img
        src="https://m.media-amazon.com/images/I/REPLACE-WITH-REAL-AMAZON-IMAGE-ID.jpg"
        alt="Modern Sectional Sofa"
        class="sidebar-product-image"
        loading="lazy"
        onerror="this.style.display='none'">
      <div class="sidebar-product-info">
        <h4>Modern Sectional Sofa</h4>
        <span class="sidebar-budget-tier tier-mid">🟡 Mid-Range</span>
        <p class="sidebar-benefit">Perfect anchor piece for any living room</p>
        <span class="sidebar-cta">🛍️ Shop on Amazon →</span>
      </div>
    </div>
  </a>

  <a href="https://amzn.to/YOUR-LINK-2" class="sidebar-product" target="_blank" rel="nofollow noopener sponsored">
    <div class="sidebar-product-label label-best-value"><span>💙 Best Value</span><span>Shop →</span></div>
    <div class="sidebar-product-inner">
      <img
        src="https://m.media-amazon.com/images/I/REPLACE-WITH-REAL-AMAZON-IMAGE-ID.jpg"
        alt="Luxury Velvet Throw Pillows"
        class="sidebar-product-image"
        loading="lazy"
        onerror="this.style.display='none'">
      <div class="sidebar-product-info">
        <h4>Luxury Velvet Throw Pillows</h4>
        <span class="sidebar-budget-tier tier-budget">💚 Budget Pick</span>
        <p class="sidebar-benefit">Instantly elevates any sofa or bed</p>
        <span class="sidebar-cta">🛍️ Shop on Amazon →</span>
      </div>
    </div>
  </a>

  <a href="https://amzn.to/YOUR-LINK-3" class="sidebar-product" target="_blank" rel="nofollow noopener sponsored">
    <div class="sidebar-product-label label-editors-pick"><span>💜 Editor's Pick</span><span>Shop →</span></div>
    <div class="sidebar-product-inner">
      <img
        src="https://m.media-amazon.com/images/I/REPLACE-WITH-REAL-AMAZON-IMAGE-ID.jpg"
        alt="Casaluna Linen Duvet Cover"
        class="sidebar-product-image"
        loading="lazy"
        onerror="this.style.display='none'">
      <div class="sidebar-product-info">
        <h4>Casaluna Linen Duvet Cover</h4>
        <span class="sidebar-budget-tier tier-mid">🟡 Mid-Range</span>
        <p class="sidebar-benefit">Hotel-quality feel at a fraction of the cost</p>
        <span class="sidebar-cta">🛍️ Shop on Amazon →</span>
      </div>
    </div>
  </a>
`;

// ---------------------------------------------------------------------------
// CATALOG SYNC  — auto-saves every post's products to catalog.json
// ---------------------------------------------------------------------------
// catalog.json lives at the project root alongside posts.json.
// Products are keyed by affiliate link URL, so duplicates are merged not doubled.
// ---------------------------------------------------------------------------
const CATALOG_PATH = path.join(__dirname, '../catalog.json');

function syncProductsToCatalog(products) {
  if (!products || !products.length) return 0;

  let catalog = [];
  try {
    if (fs.existsSync(CATALOG_PATH)) {
      catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
      if (!Array.isArray(catalog)) catalog = [];
    }
  } catch (e) { catalog = []; }

  let added = 0, updated = 0;
  products.forEach(p => {
    if (!p.link || !p.name) return;
    const key = p.link.trim();
    const idx = catalog.findIndex(c => c.link === key);
    const entry = {
      name:        p.name.trim(),
      link:        key,
      image:       p.image       || '',
      budget_tier: p.budget_tier || '',
      benefit:     p.benefit     || '',
      label:       p.label       || '',
      category:    p.category    || 'Product',
      updatedAt:   new Date().toISOString()
    };
    if (idx >= 0) { catalog[idx] = { ...catalog[idx], ...entry }; updated++; }
    else          { catalog.push(entry); added++; }
  });

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf8');
  return added + updated;
}

// ---------------------------------------------------------------------------
// INLINE PRODUCT SECTION  — "Shop This Post" cards injected into content
// ---------------------------------------------------------------------------
// In your markdown, put this exactly where you want the product cards:
//
//   <!-- PRODUCTS -->
//
// If the marker is absent, cards are appended at the end of the article.
// ---------------------------------------------------------------------------
function generateInlineProductSection(products) {
  if (!products || !products.length) return '';
  const eligible = products.filter(p => p.link && p.name &&
    !p.link.includes('/posts/')); // skip blog post links — those aren't product cards
  if (!eligible.length) return '';

  const labelColors = {
    'TOP PICK':      '#7e0882',
    'BEST VALUE':    '#00a060',
    "EDITOR'S PICK": '#2D5BFF',
    'NEW':           '#FF6B35',
    'SALE':          '#E63946',
    'LIMITED':       '#92400E',
  };

  const cards = eligible.map(p => {
    const img      = resolveProductImage(p.image || '');
    const tier     = p.budget_tier || '';
    const tierIcon = tier === 'Budget Pick' ? '💚' : tier === 'Luxury' ? '💜' : tier ? '🟡' : '';
    const tierCls  = tier === 'Budget Pick' ? 'tier-budget' : tier === 'Luxury' ? 'tier-luxury' : 'tier-mid';
    const lColor   = labelColors[(p.label || '').toUpperCase()] || '#888';

    return `<a href="${p.link}" class="inline-product-card" target="_blank" rel="nofollow noopener sponsored">
      ${p.label ? `<div class="inline-product-label" style="background:${lColor}">${p.label}</div>` : ''}
      ${img
        ? `<img src="${img}" alt="${p.name}" class="inline-product-img" loading="lazy" onerror="this.style.display='none'">`
        : `<div class="inline-product-img-placeholder">🛍️</div>`}
      <div class="inline-product-body">
        <div class="inline-product-name">${p.name}</div>
        ${tier ? `<span class="inline-tier-badge ${tierCls}">${tierIcon} ${tier}</span>` : ''}
        ${p.benefit ? `<div class="inline-product-benefit">${p.benefit}</div>` : ''}
        <span class="inline-product-cta">Shop on Amazon →</span>
      </div>
    </a>`;
  }).join('\n');

  return `
<div class="inline-products-section">
  <div class="inline-products-heading">🌟 Shop This Post</div>
  <div class="inline-products-grid">
    ${cards}
  </div>
</div>`;
}

// ---------------------------------------------------------------------------
// SIDEBAR PRODUCT GENERATOR
// Per-post products come from frontmatter featured_products array.
// Product images should be Amazon CDN URLs (https://m.media-amazon.com/...)
// obtained by right-clicking the product image on Amazon → Copy image address.
// These are hotlinked directly — no downloading, no saving to repo.
// ---------------------------------------------------------------------------
function generateSidebarProducts(frontmatter) {
  let html = '';

  // ── PER-POST PRODUCTS (from frontmatter) ─────────────────────────
  if (frontmatter.featured_products && Array.isArray(frontmatter.featured_products) && frontmatter.featured_products.length > 0) {
    html += '\n  <div class="sidebar-section-title">🌟 Featured Products</div>\n';

    frontmatter.featured_products.forEach(product => {
      const isProduct = product.link && !product.link.includes('/posts/');
      const imageUrl  = resolveProductImage(product.image || '');
      const imgHtml   = imageUrl
        ? `<img src="${imageUrl}" alt="${product.name}" class="sidebar-product-image" loading="lazy" onerror="this.style.display='none'">`
        : `<div class="sidebar-product-image" style="background:var(--gray-100);display:flex;align-items:center;justify-content:center;font-size:2rem;">🛍️</div>`;

      if (isProduct) {
        // Affiliate product card
        html += `
  <a href="${product.link}" class="sidebar-product" target="_blank" rel="nofollow noopener sponsored">
    ${labelBar(product.label || '')}
    <div class="sidebar-product-inner">
      ${imgHtml}
      <div class="sidebar-product-info">
        <h4>${product.name}</h4>
        ${budgetTierBadge(product.budget_tier || '')}
        ${product.benefit ? `<p class="sidebar-benefit">${product.benefit}</p>` : ''}
        <span class="sidebar-cta">🛍️ Shop on Amazon →</span>
      </div>
    </div>
  </a>`;
      } else {
        // Blog post link
        html += `
  <a href="${product.link || '#'}" class="sidebar-related">
    ${imageUrl ? `<img src="${imageUrl}" alt="${product.name}" loading="lazy">` : ''}
    <div class="sidebar-related-body">
      <div class="sidebar-related-cat">Read Next</div>
      <div class="sidebar-related-title">${product.name}</div>
      <span class="sidebar-related-link">Read more →</span>
    </div>
  </a>`;
      }
    });

    // Append permanent sidebar items AFTER per-post ones
    html += '\n\n  <!-- PERMANENT SIDEBAR ITEMS (always shown on every post) -->\n';
    html += DEFAULT_SIDEBAR_PRODUCTS;

  } else {
    // No per-post products — show permanent items only
    html = DEFAULT_SIDEBAR_PRODUCTS;
  }

  return html;
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

  // ── PRODUCTS ──────────────────────────────────────────────────────────────
  // 1. Sidebar cards
  const sidebarProducts = generateSidebarProducts(frontmatter);

  // 2. Inline "Shop This Post" section — injected at <!-- PRODUCTS --> marker,
  //    or appended before </article> if marker is absent
  const inlineProductHtml = generateInlineProductSection(frontmatter.featured_products);
  if (inlineProductHtml) {
    if (htmlContent.includes('<!-- PRODUCTS -->')) {
      htmlContent = htmlContent.replace('<!-- PRODUCTS -->', inlineProductHtml);
    } else {
      // Append before closing </article> tag, or at the very end
      htmlContent = htmlContent.replace(/<\/article>/i, inlineProductHtml + '\n</article>');
      if (!htmlContent.includes(inlineProductHtml)) {
        htmlContent += inlineProductHtml; // fallback: just append
      }
    }
  }

  // 3. Catalog sync — upsert these products into catalog.json for reuse
  const syncCount = syncProductsToCatalog(frontmatter.featured_products || []);
  if (syncCount > 0) console.log(`   📦 Synced ${syncCount} product(s) to catalog.json`);

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
