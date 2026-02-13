const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');  // ← FIX: Destructure marked

const POSTS_DIR = path.join(__dirname, '../content/posts');
const OUTPUT_DIR = path.join(__dirname, '../posts');
const TEMPLATE_PATH = path.join(__dirname, '../templates/post-template.html');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Read template
const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

// Get all .md files (exclude files in subdirectories like drafts/)
const mdFiles = fs.readdirSync(POSTS_DIR)
  .filter(f => f.endsWith('.md') && fs.statSync(path.join(POSTS_DIR, f)).isFile());

mdFiles.forEach(file => {
  const filePath = path.join(POSTS_DIR, file);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  const { data: frontmatter, content } = matter(fileContent);
  
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
    : 'Blog';
  const categorySlug = primaryCategory.toLowerCase().replace(/\s+/g, '-');
  
  // Replace placeholders in template
  let html = template
    .replace(/\{\{TITLE\}\}/g, frontmatter.title)
    .replace(/\{\{SEO_TITLE\}\}/g, frontmatter.title)
    .replace(/\{\{SEO_DESCRIPTION\}\}/g, frontmatter.description)
    .replace(/\{\{SLUG\}\}/g, frontmatter.slug)
    .replace(/\{\{CATEGORY\}\}/g, primaryCategory)
    .replace(/\{\{CATEGORY_SLUG\}\}/g, categorySlug)
    .replace(/\{\{ARTICLE_CONTENT\}\}/g, htmlContent)
    .replace(/\{\{FEATURED_IMAGE\}\}/g, frontmatter.featured_image || '/content/images/default.jpg')
    .replace(/\{\{FEATURED_IMAGE_ALT\}\}/g, frontmatter.title || '')
    .replace(/\{\{PUBLISH_DATE\}\}/g, publishDate.toISOString())
    .replace(/\{\{PUBLISH_DATE_FORMATTED\}\}/g, formattedDate)
    .replace(/\{\{READ_TIME\}\}/g, readTime)
    .replace(/\{\{TAGS_HTML\}\}/g, (frontmatter.tags || []).map(t => `<a href="/tag/${t.toLowerCase().replace(/\s+/g, '-')}" class="tag">${t}</a>`).join('\n        '))
    .replace(/\{\{KEYWORDS\}\}/g, (frontmatter.keywords || []).join(', '))
    .replace(/\{\{AUTHOR_NAME\}\}/g, 'Wow Glam Decor Team')
    .replace(/\{\{AUTHOR_ROLE\}\}/g, 'Interior Design Expert')
    .replace(/\{\{AUTHOR_BIO\}\}/g, 'Interior design enthusiast sharing decor inspiration')
    .replace(/\{\{AUTHOR_AVATAR\}\}/g, '/content/images/author-avatar.jpg')
    .replace(/\{\{SIDEBAR_PRODUCTS\}\}/g, ''); // Add sidebar products HTML if needed
  
  // Write HTML file
  const outputPath = path.join(OUTPUT_DIR, `${frontmatter.slug}.html`);
  fs.writeFileSync(outputPath, html, 'utf8');
  
  console.log(`✅ Built: ${frontmatter.slug}.html`);  // ← FIX: Remove backtick before console.log
});

console.log('\n✨ Build complete!');
