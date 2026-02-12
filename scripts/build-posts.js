const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const marked = require('marked');

const POSTS_DIR = path.join(__dirname, '../content/posts');
const OUTPUT_DIR = path.join(__dirname, '../posts');
const TEMPLATE_PATH = path.join(__dirname, '../templates/post-template.html');

// Read template
const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

// Get all .md files
const mdFiles = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));

mdFiles.forEach(file => {
  const filePath = path.join(POSTS_DIR, file);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  const { data: frontmatter, content } = matter(fileContent);
  
  // Convert markdown to HTML
  const htmlContent = marked.parse(content);
  
  // Replace placeholders in template
  let html = template
    .replace(/{{TITLE}}/g, frontmatter.title)
    .replace(/{{SEO_TITLE}}/g, frontmatter.title)
    .replace(/{{SEO_DESCRIPTION}}/g, frontmatter.description)
    .replace(/{{SLUG}}/g, frontmatter.slug)
    .replace(/{{CATEGORY}}/g, frontmatter.categories[0] || 'Blog')
    .replace(/{{ARTICLE_CONTENT}}/g, htmlContent)
    .replace(/{{FEATURED_IMAGE}}/g, frontmatter.featured_image || '/images/default.jpg')
    .replace(/{{PUBLISH_DATE}}/g, frontmatter.date)
    .replace(/{{TAGS_HTML}}/g, (frontmatter.tags || []).map(t => `<a href="/tag/${t}" class="tag">${t}</a>`).join(''))
    .replace(/{{KEYWORDS}}/g, (frontmatter.keywords || []).join(', '))
    .replace(/{{AUTHOR_NAME}}/g, 'Wow Glam Decor')
    .replace(/{{AUTHOR_BIO}}/g, 'Interior design enthusiast sharing decor inspiration');
  
  // Write HTML file
  const outputPath = path.join(OUTPUT_DIR, `${frontmatter.slug}.html`);
  fs.writeFileSync(outputPath, html, 'utf8');
  
  console.log(`✅ Built: ${frontmatter.slug}.html`);
});
