const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const POSTS_DIR = path.join(__dirname, '../content/posts');
const TAG_DIR   = path.join(__dirname, '../tag');
const TEMPLATE_PATH = path.join(__dirname, '../templates/tag-template.html');

if (!fs.existsSync(TAG_DIR)) {
  fs.mkdirSync(TAG_DIR, { recursive: true });
}

console.log('🏷️  Generating tag pages...\n');

if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error('❌ Template not found at:', TEMPLATE_PATH);
  process.exit(1);
}

const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

// ---------------------------------------------------------------------------
// ✅ IMAGE PATH FIXER
// ---------------------------------------------------------------------------
function fixImg(src) {
  if (!src) return '/content/images/default-post.jpg';
  if (src.startsWith('http')) return src;
  let p = src.replace(/(\.(jpe?g|png|webp|avif|gif|svg))\1$/i, '$1');
  if (!p.startsWith('/')) p = '/' + p;
  return p;
}

// Read all published posts
const mdFiles = fs.readdirSync(POSTS_DIR)
  .filter(f => f.endsWith('.md') && fs.statSync(path.join(POSTS_DIR, f)).isFile());

const postsByTag = {};

mdFiles.forEach(file => {
  try {
    const filePath = path.join(POSTS_DIR, file);
    const { data: frontmatter, content } = matter(fs.readFileSync(filePath, 'utf8'));

    if (frontmatter.published === false) return;

    const tags = frontmatter.tags || [];

    tags.forEach(tag => {
      const slug = tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      if (!postsByTag[slug]) {
        postsByTag[slug] = { name: tag, slug, posts: [] };
      }

      postsByTag[slug].posts.push({
        title:          frontmatter.title,
        slug:           frontmatter.slug,
        description:    frontmatter.description || '',
        date:           frontmatter.date,
        categories:     frontmatter.categories || [],
        tags,
        // ✅ FIX: fixImg resolves double extensions, missing slashes, Amazon URLs
        featured_image: fixImg(frontmatter.featured_image || ''),
        readTime:       Math.ceil(content.split(/\s+/).length / 200) || 5,
      });
    });
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

Object.keys(postsByTag).forEach(tagSlug => {
  const tag = postsByTag[tagSlug];

  tag.posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  let postsHTML = '';

  if (tag.posts.length === 0) {
    postsHTML = `
<div class="empty-state">
  <h2>No posts tagged "${tag.name}"</h2>
  <p>Check back soon!</p>
  <a href="/blog.html">Browse All Posts</a>
</div>`;
  } else {
    // ✅ FIX: card HTML uses .card-image-wrap / .card-image / .card-content
    // to match the CSS defined in tag-template.html
    postsHTML = '<div class="posts-grid">\n';

    tag.posts.forEach(post => {
      const postDate = post.date
        ? new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'Recently';
      const badgeCategory = (post.categories && post.categories[0]) || 'Decor';

      postsHTML += `
<a href="/posts/${post.slug}.html" class="post-card">
  <div class="card-image-wrap">
    <img
      src="${post.featured_image}"
      alt="${post.title}"
      class="card-image"
      loading="lazy"
      onerror="this.src='/content/images/default-post.jpg'">
    <span class="card-cat">${badgeCategory}</span>
  </div>
  <div class="card-content">
    <div class="card-meta">
      <span>${postDate}</span>
      <span>⏱️ ${post.readTime} min</span>
    </div>
    <h3 class="card-title">${post.title}</h3>
    <p class="card-excerpt">${post.description}</p>
    <span class="card-link">Read + Shop →</span>
  </div>
</a>`;
    });

    postsHTML += '\n</div>';
  }

  const html = template
    .replace(/\{\{TAG_NAME\}\}/g,   tag.name)
    .replace(/\{\{TAG_SLUG\}\}/g,   tagSlug)
    .replace(/\{\{POST_COUNT\}\}/g, tag.posts.length)
    .replace(/\{\{POSTS_HTML\}\}/g, postsHTML);

  const outputPath = path.join(TAG_DIR, `${tagSlug}.html`);
  fs.writeFileSync(outputPath, html, 'utf8');

  console.log(`✅ #${tag.name} (${tag.posts.length} posts) → /tag/${tagSlug}.html`);
});

console.log(`\n🎉 Generated ${Object.keys(postsByTag).length} tag pages!`);
