const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const POSTS_DIR = path.join(__dirname, '../content/posts');
const OUTPUT_DIR = path.join(__dirname, '../posts');
const TEMPLATE_PATH = path.join(__dirname, '../templates/post-template.html');
const POSTS_JSON_PATH = path.join(__dirname, '../posts.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Read template
const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

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
  // If post has custom featured_products in frontmatter, use those
  if (frontmatter.featured_products && Array.isArray(frontmatter.featured_products)) {
    return frontmatter.featured_products.map(product => {
      // Determine if it's a product (has price) or a blog post
      const isProduct = product.price;
      
      return `
  <a href="${product.link}" class="sidebar-product" target="_blank" rel="nofollow ${isProduct ? 'sponsored' : ''}">
    <img src="${product.image}" alt="${product.name}" class="sidebar-product-image">
    <div class="sidebar-product-info">
      <h4>${product.name}</h4>
      ${isProduct ? `<div class="sidebar-product-price">${product.price}</div>` : ''}
      <span class="sidebar-cta">${isProduct ? 'Shop Now' : 'Read More'} →</span>
    </div>
  </a>`;
    }).join('\n  ');
  }
  
  // Otherwise, use default sidebar products
  return DEFAULT_SIDEBAR_PRODUCTS;
}

// Get all .md files (exclude files in subdirectories like drafts/)
const mdFiles = fs.readdirSync(POSTS_DIR)
  .filter(f => f.endsWith('.md') && fs.statSync(path.join(POSTS_DIR, f)).isFile());

console.log(`📝 Found ${mdFiles.length} posts to build...\n`);

// Array to store post metadata for posts.json
const postsMetadata = [];

mdFiles.forEach(file => {
  const filePath = path.join(POSTS_DIR, file);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  const { data: frontmatter, content } = matter(fileContent);
  
  // Skip if no slug (required field)
  if (!frontmatter.slug) {
    console.log(`⚠️  Skipped ${file}: Missing slug`);
    return;
  }
  
  // Convert markdown to HTML
  const htmlContent = marked.parse(content);
  
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
  
  // Generate sidebar products
  const sidebarProducts = generateSidebarProducts(frontmatter);
  
  // Generate tags HTML
  const tagsHTML = (frontmatter.tags || [])
    .map(t => `<a href="/tag/${t.toLowerCase().replace(/\s+/g, '-')}.html" class="tag">${t}</a>`)
    .join('\n        ');
  
  // Create excerpt from content (first 160 characters, strip HTML)
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
    .replace(/\{\{FEATURED_IMAGE\}\}/g, frontmatter.featured_image || '/content/images/default.jpg')
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
  
  // Add to posts metadata for posts.json (for search functionality)
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
    featured_image: frontmatter.featured_image || '/content/images/default.jpg',
    date: publishDate.toISOString(),
    dateFormatted: formattedDate,
    readTime: readTime,
    wordCount: wordCount,
    author: frontmatter.author_name || 'Wow Glam Decor Team',
    // Full content for search (strip HTML tags)
    content: content.substring(0, 500) // First 500 chars for search preview
  });
});

// Generate posts.json for search functionality
console.log('\n📦 Generating posts.json for search...');
fs.writeFileSync(POSTS_JSON_PATH, JSON.stringify(postsMetadata, null, 2), 'utf8');
console.log(`✅ Created posts.json with ${postsMetadata.length} posts`);

// Generate a summary
console.log(`\n✨ Build complete!`);
console.log(`   📄 Generated ${mdFiles.length} HTML files`);
console.log(`   🔍 Created posts.json for search`);
console.log(`   📊 Total words: ${postsMetadata.reduce((sum, p) => sum + p.wordCount, 0).toLocaleString()}`);
console.log(`   ⏱️  Average read time: ${Math.round(postsMetadata.reduce((sum, p) => sum + p.readTime, 0) / postsMetadata.length)} minutes`);
