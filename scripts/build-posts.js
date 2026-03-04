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
// IMAGE EXTENSION RESOLVER
// ---------------------------------------------------------------------------
// Supported extensions in priority order
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg'];

/**
 * Given an image path that may or may not include an extension, find the
 * first matching file on disk and return the path WITH the correct extension.
 * If the path already has a known extension and the file exists, it's returned
 * as-is. If no match is found, the original path is returned unchanged so the
 * browser will surface a clear 404 rather than silently breaking layout.
 *
 * @param {string} imagePath  - e.g. "/content/images/hero-luxury-bedroom-hotel-suite"
 *                              or   "/content/images/products/velvet-bed.jpg"
 * @returns {string}          - resolved path with extension
 */
function resolveImagePath(imagePath) {
  if (!imagePath) return imagePath;

  // Strip leading slash so we can join with the filesystem root
  const relative = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  const absolute = path.join(__dirname, '..', relative);

  // 1. Path already has a known extension — check it exists
  const existingExt = path.extname(absolute).toLowerCase();
  if (IMAGE_EXTENSIONS.includes(existingExt)) {
    if (fs.existsSync(absolute)) return imagePath;
    // File with that extension doesn't exist — fall through to probe others
  }

  // 2. No extension (or wrong extension) — probe each candidate
  const base = existingExt ? absolute.slice(0, -existingExt.length) : absolute;
  for (const ext of IMAGE_EXTENSIONS) {
    const candidate = base + ext;
    if (fs.existsSync(candidate)) {
      // Return as a web path (forward slashes, leading slash)
      const resolved = '/' + path.relative(path.join(__dirname, '..'), candidate)
                                  .split(path.sep).join('/');
      return resolved;
    }
  }

  // 3. Case-insensitive fallback — scan the directory for a matching filename
  const dir = path.dirname(base);
  const basename = path.basename(base).toLowerCase();
  if (fs.existsSync(dir)) {
    const entries = fs.readdirSync(dir);
    for (const ext of IMAGE_EXTENSIONS) {
      const target = (basename + ext).toLowerCase();
      const match = entries.find(e => e.toLowerCase() === target);
      if (match) {
        const resolved = '/' + path.relative(path.join(__dirname, '..'), path.join(dir, match))
                                    .split(path.sep).join('/');
        return resolved;
      }
    }
  }

  // 4. Nothing found — return original and let the browser show a 404
  console.warn(`  ⚠️  Image not found on disk: ${imagePath}`);
  return imagePath;
}

/**
 * Walk through the rendered HTML and resolve every <img src="..."> that
 * refers to an extensionless path (or a path whose file doesn't exist).
 */
function resolveImagesInHtml(html) {
  return html.replace(/(<img\s[^>]*src=["'])([^"']+)(["'])/gi, (match, before, src, after) => {
    const resolved = resolveImagePath(src);
    return `${before}${resolved}${after}`;
  });
}

/**
 * Resolve a single image path used in template placeholders or frontmatter.
 */
function resolveImage(imagePath) {
  return resolveImagePath(imagePath);
}

// ---------------------------------------------------------------------------

// Default sidebar products (fallback if post doesn't specify)
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

// Function to generate sidebar products from frontmatter
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

// Get all .md files (exclude subdirectories like drafts/)
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

  // Convert markdown to HTML, then resolve image extensions in the output
  let htmlContent = marked.parse(content);
  htmlContent = resolveImagesInHtml(htmlContent);

  // Format date
  const publishDate = frontmatter.date ? new Date(frontmatter.date) : new Date();
  const formattedDate = publishDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate read time
  const wordCount = content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  // Primary category
  const primaryCategory = Array.isArray(frontmatter.categories)
    ? frontmatter.categories[0]
    : (frontmatter.category || 'Blog');
  const categorySlug = primaryCategory.toLowerCase().replace(/\s+/g, '-');

  // Resolve featured image extension
  const resolvedFeaturedImage = resolveImage(
    frontmatter.featured_image || '/content/images/default.jpg'
  );

  // Generate sidebar products (images resolved inside the function)
  const sidebarProducts = generateSidebarProducts(frontmatter);

  // Generate tags HTML
  const tagsHTML = (frontmatter.tags || [])
    .map(t => `<a href="/tag/${t.toLowerCase().replace(/\s+/g, '-')}.html" class="tag">${t}</a>`)
    .join('\n        ');

  // Excerpt
  const excerpt = frontmatter.description ||
                  content.replace(/[#*_\[\]]/g, '').substring(0, 160).trim() + '...';

  // Replace placeholders in template
  let html = template
    .replace(/\{\{TITLE\}\}/g, frontmatter.title || 'Untitled Post')
    .replace(/\{\{SEO_TITLE\}\}/g, frontmatter.seo_title || frontmatter.title || 'Untitled Post')
    .replace(/\{\{SEO_DESCRIPTION\}\}/g, frontmatter.description || excerpt)
    .replace(/\{\{SLUG\}\}/g, frontmatter.slug)
    .replace(/\{\{CATEGORY\}\}/g, primaryCategory)
    .replace(/\{\{CATEGORY_SLUG\}\}/g, categorySlug)
    .replace(/\{\{ARTICLE_CONTENT\}\}/g, htmlContent)
    .replace(/\{\{FEATURED_IMAGE\}\}/g, resolvedFeaturedImage)
    .replace(/\{\{FEATURED_IMAGE_ALT\}\}/g, frontmatter.featured_image_alt || frontmatter.title || 'Blog post image')
    .replace(/\{\{PUBLISH_DATE\}\}/g, publishDate.toISOString())
    .replace(/\{\{PUBLISH_DATE_FORMATTED\}\}/g, formattedDate)
    .replace(/\{\{READ_TIME\}\}/g, readTime)
    .replace(/\{\{TAGS_HTML\}\}/g, tagsHTML)
    .replace(/\{\{KEYWORDS\}\}/g, (frontmatter.keywords || frontmatter.tags || []).join(', '))
    .replace(/\{\{AUTHOR_NAME\}\}/g, frontmatter.author_name || 'Wow Glam Decor Team')
    .replace(/\{\{AUTHOR_ROLE\}\}/g, frontmatter.author_role || 'Interior Design Expert')
    .replace(/\{\{AUTHOR_BIO\}\}/g, frontmatter.author_bio || 'Passionate about creating beautiful, functional living spaces on any budget.')
    .replace(/\{\{AUTHOR_AVATAR\}\}/g, frontmatter.author_avatar || '/content/images/author-avatar.jpg')
    .replace(/\{\{SIDEBAR_PRODUCTS\}\}/g, sidebarProducts);

  // Write HTML file
  const outputPath = path.join(OUTPUT_DIR, `${frontmatter.slug}.html`);
  fs.writeFileSync(outputPath, html, 'utf8');

  console.log(`✅ Built: ${frontmatter.slug}.html (${readTime} min read, ${wordCount} words)`);

  postsMetadata.push({
    title: frontmatter.title || 'Untitled Post',
    slug: frontmatter.slug,
    url: `/posts/${frontmatter.slug}.html`,
    description: excerpt,
    excerpt: excerpt,
    category: primaryCategory,
    categorySlug: categorySlug,
    categories: frontmatter.categories || [primaryCategory],
    tags: frontmatter.tags || [],
    featured_image: resolvedFeaturedImage,
    date: publishDate.toISOString(),
    dateFormatted: formattedDate,
    readTime: readTime,
    wordCount: wordCount,
    author: frontmatter.author_name || 'Wow Glam Decor Team',
    content: content.substring(0, 500)
  });
});

// Generate posts.json
console.log('\n📦 Generating posts.json for search...');
fs.writeFileSync(POSTS_JSON_PATH, JSON.stringify(postsMetadata, null, 2), 'utf8');
console.log(`✅ Created posts.json with ${postsMetadata.length} posts`);

console.log(`\n✨ Build complete!`);
console.log(`   📄 Generated ${mdFiles.length} HTML files`);
console.log(`   🔍 Created posts.json for search`);
console.log(`   📊 Total words: ${postsMetadata.reduce((sum, p) => sum + p.wordCount, 0).toLocaleString()}`);
console.log(`   ⏱️  Average read time: ${Math.round(postsMetadata.reduce((sum, p) => sum + p.readTime, 0) / postsMetadata.length)} minutes`);
