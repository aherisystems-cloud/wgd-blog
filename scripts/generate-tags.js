const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const POSTS_DIR = path.join(__dirname, '../content/posts');
const TAG_DIR = path.join(__dirname, '../tag');
const TEMPLATE_PATH = path.join(__dirname, '../templates/tag-template.html');

if (!fs.existsSync(TAG_DIR)) fs.mkdirSync(TAG_DIR, { recursive: true });

console.log('🏷️  Generating tag pages...\n');

if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error('❌ Tag template not found:', TEMPLATE_PATH);
  process.exit(1);
}

const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

const mdFiles = fs.readdirSync(POSTS_DIR)
  .filter(f => f.endsWith('.md') && fs.statSync(path.join(POSTS_DIR, f)).isFile());

const postsByTag = {};

mdFiles.forEach(file => {
  try {
    const { data: frontmatter, content } = matter(fs.readFileSync(path.join(POSTS_DIR, file), 'utf8'));
    if (frontmatter.published === false) return;
    (frontmatter.tags || []).forEach(tag => {
      const slug = tag.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      if (!postsByTag[slug]) postsByTag[slug] = { name: tag, slug, posts: [] };
      postsByTag[slug].posts.push({
        title: frontmatter.title,
        slug: frontmatter.slug,
        description: frontmatter.description || '',
        date: frontmatter.date ? new Date(frontmatter.date) : new Date(),
        categories: frontmatter.categories || [],
        featured_image: frontmatter.featured_image || '/content/images/default-post.jpg',
        readTime: Math.ceil(content.split(/\s+/).length / 200)
      });
    });
  } catch (e) {
    console.error(`Error: ${file}:`, e.message);
  }
});

Object.values(postsByTag).forEach(tag => {
  tag.posts.sort((a, b) => b.date - a.date);

  const postsHTML = tag.posts.length === 0
    ? `<div class="empty-state"><h2>No posts yet for "${tag.name}"</h2><a href="/blog.html">Browse All Posts</a></div>`
    : `<div class="posts-grid">
${tag.posts.map(post => `
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
  </a>`).join('\n')}
</div>`;

  let html = template
    .replace(/\{\{TAG_NAME\}\}/g, tag.name)
    .replace(/\{\{TAG_SLUG\}\}/g, tag.slug)
    .replace(/\{\{POST_COUNT\}\}/g, tag.posts.length)
    .replace(/\{\{POSTS_HTML\}\}/g, postsHTML);

  fs.writeFileSync(path.join(TAG_DIR, `${tag.slug}.html`), html, 'utf8');
  console.log(`✅ "${tag.name}" (${tag.posts.length} posts) → /tag/${tag.slug}.html`);
});

console.log(`\n🎉 Generated ${Object.keys(postsByTag).length} tag pages!`);
