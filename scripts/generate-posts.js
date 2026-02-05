const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const postsDir = path.join(__dirname, '../content/posts');
const templatePath = path.join(__dirname, '../templates/post-template.html');
const outputDir = path.join(__dirname, '../posts');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function generatePost(mdFile) {
  const filePath = path.join(postsDir, mdFile);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);
  
  // Read template
  let template = fs.readFileSync(templatePath, 'utf8');
  
  // Convert markdown to HTML
  const articleHTML = marked(content);
  
  // Calculate read time
  const words = content.split(/\s+/).length;
  const readTime = Math.ceil(words / 200);
  
  // Format date
  const date = new Date(data.date);
  const formattedDate = date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  
  // Generate tags HTML
  const tagsHTML = (data.tags || [])
    .map(tag => `<a href="/tag/${tag.toLowerCase().replace(/\s+/g, '-')}" class="tag">${tag}</a>`)
    .join('\n');
  
  // Generate sidebar products HTML
  const sidebarProducts = (data.affiliate || []).slice(0, 3).map(product => `
    <a href="${product.affiliate_link}" target="_blank" rel="nofollow sponsored noopener" class="sidebar-product">
      <img src="${product.image || '/content/images/default-product.jpg'}" alt="${product.name}" class="sidebar-product-image" loading="lazy">
      <div class="sidebar-product-info">
        <h4>${product.name}</h4>
        <div class="sidebar-product-price">${product.price || '$XX.XX'}</div>
        <span class="sidebar-cta">View →</span>
      </div>
    </a>
  `).join('\n');
  
  // Replace placeholders
  const replacements = {
    '{{SEO_TITLE}}': data.seo?.title || data.title,
    '{{SEO_DESCRIPTION}}': data.seo?.description || '',
    '{{KEYWORDS}}': (data.tags || []).join(', '),
    '{{AUTHOR_NAME}}': data.author?.name || 'Editorial Team',
    '{{AUTHOR_ROLE}}': data.author?.role || 'Content Creator',
    '{{AUTHOR_AVATAR}}': data.author?.avatar || '/content/images/default-avatar.jpg',
    '{{AUTHOR_BIO}}': data.author?.bio || '',
    '{{SLUG}}': data.slug,
    '{{TITLE}}': data.title,
    '{{FEATURED_IMAGE}}': data.featured_image?.src || '/content/images/default.jpg',
    '{{FEATURED_IMAGE_ALT}}': data.featured_image?.alt || data.title,
    '{{PUBLISH_DATE}}': data.date,
    '{{PUBLISH_DATE_FORMATTED}}': formattedDate,
    '{{READ_TIME}}': readTime,
    '{{CATEGORY}}': data.category || 'Uncategorized',
    '{{CATEGORY_SLUG}}': (data.category || 'uncategorized').toLowerCase().replace(/\s+/g, '-'),
    '{{ARTICLE_CONTENT}}': articleHTML,
    '{{TAGS_HTML}}': tagsHTML,
    '{{SIDEBAR_PRODUCTS}}': sidebarProducts
  };
  
  Object.keys(replacements).forEach(key => {
    template = template.replace(new RegExp(key, 'g'), replacements[key]);
  });
  
  // Write HTML file
  const outputPath = path.join(outputDir, `${data.slug}.html`);
  fs.writeFileSync(outputPath, template);
  console.log(`✅ Generated ${data.slug}.html`);
}

// Process all markdown files
const mdFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
mdFiles.forEach(generatePost);

console.log(`\n🎉 Generated ${mdFiles.length} blog posts`);
