const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const POSTS_DIR = path.join(__dirname, '../content/posts');
const OUTPUT_PATH = path.join(__dirname, '../blog.html');
const TEMPLATE_PATH = path.join(__dirname, '../templates/blog-index-template.html');

console.log('📰 Generating blog index...\n');

if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error('❌ Template not found:', TEMPLATE_PATH);
  process.exit(1);
}

const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

const mdFiles = fs.readdirSync(POSTS_DIR)
  .filter(f => f.endsWith('.md') && fs.statSync(path.join(POSTS_DIR, f)).isFile());

let posts = [];

mdFiles.forEach(file => {
  try {
    const filePath = path.join(POSTS_DIR, file);
    const { data: frontmatter, content } = matter(fs.readFileSync(filePath, 'utf8'));
    if (frontmatter.published === false) return;
    posts.push({
      title: frontmatter.title || 'Untitled',
      slug: frontmatter.slug || file.replace('.md', ''),
      description: frontmatter.description || '',
      date: frontmatter.date ? new Date(frontmatter.date) : new Date(),
      categories: frontmatter.categories || [],
      tags: frontmatter.tags || [],
      featured_image: frontmatter.featured_image || '/content/images/default-post.jpg',
      readTime: Math.ceil(content.split(/\s+/).length / 200)
    });
  } catch (e) {
    console.error(`Error: ${file}:`, e.message);
  }
});

posts.sort((a, b) => b.date - a.date);

const featuredPost = posts[0];
const remainingPosts = posts.slice(1);

const featuredHTML = featuredPost ? `
<a href="/posts/${featuredPost.slug}.html" class="featured-post">
  <div class="featured-image-wrap">
    <img src="${featuredPost.featured_image}" alt="${featuredPost.title}" class="featured-image">
    <span class="featured-badge">✨ Editor's Pick</span>
  </div>
  <div class="featured-content">
    <div class="post-meta-row">
      <span class="post-cat">${featuredPost.categories[0] || 'Decor'}</span>
      <span class="post-date">📅 ${featuredPost.date.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</span>
      <span class="post-time">⏱️ ${featuredPost.readTime} min read</span>
    </div>
    <h2 class="featured-title">${featuredPost.title}</h2>
    <p class="featured-excerpt">${featuredPost.description}</p>
    <span class="read-more-btn">Read Full Guide + Shop Products →</span>
  </div>
</a>` : '';

const gridHTML = remainingPosts.map(post => `
<a href="/posts/${post.slug}.html" class="post-card">
  <div class="card-image-wrap">
    <img src="${post.featured_image}" alt="${post.title}" class="card-image" loading="lazy">
    <span class="card-cat">${post.categories[0] || 'Decor'}</span>
  </div>
  <div class="card-content">
    <div class="card-meta">
      <span>${post.date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
      <span>⏱️ ${post.readTime} min</span>
    </div>
    <h3 class="card-title">${post.title}</h3>
    <p class="card-excerpt">${post.description}</p>
    <span class="card-link">Read + Shop →</span>
  </div>
</a>`).join('\n');

const allCategories = [...new Set(posts.flatMap(p => p.categories))].slice(0, 14);
const filterHTML = allCategories.map(cat => {
  const slug = cat.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, '');
  return `<a href="/category/${slug}.html" class="filter-btn">${cat}</a>`;
}).join('\n');

let html = template
  .replace(/\{\{FEATURED_POST\}\}/g, featuredHTML)
  .replace(/\{\{POSTS_GRID\}\}/g, gridHTML || '<p class="no-posts">No posts yet. Check back soon!</p>')
  .replace(/\{\{CATEGORY_FILTERS\}\}/g, filterHTML)
  .replace(/\{\{TOTAL_POSTS\}\}/g, posts.length);

fs.writeFileSync(OUTPUT_PATH, html, 'utf8');
console.log(`✅ Blog index → /blog.html (${posts.length} posts)`);
