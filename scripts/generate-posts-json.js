/**
 * generate-posts-json.js
 * Run after build-posts.js to create /posts.json for the search page.
 * Usage: node scripts/generate-posts-json.js
 */

const fs   = require('fs');
const path = require('path');
const matter = require('gray-matter');

const POSTS_DIR   = path.join(__dirname, '../content/posts');
const OUTPUT_PATH = path.join(__dirname, '../posts.json');

const mdFiles = fs.readdirSync(POSTS_DIR)
  .filter(f => f.endsWith('.md') && fs.statSync(path.join(POSTS_DIR, f)).isFile());

const posts = [];

mdFiles.forEach(file => {
  try {
    const { data: fm, content } = matter(fs.readFileSync(path.join(POSTS_DIR, file), 'utf8'));

    if (fm.published === false) return;   // skip drafts
    if (!fm.slug) return;                 // skip posts with no slug

    const wordCount = content.split(/\s+/).filter(Boolean).length;

    posts.push({
      title:         fm.title         || 'Untitled',
      slug:          fm.slug,
      url:           `/posts/${fm.slug}.html`,
      description:   fm.description   || fm.excerpt || '',
      date:          fm.date          ? new Date(fm.date).toISOString() : null,
      categories:    fm.categories    || (fm.category ? [fm.category] : []),
      tags:          fm.tags          || [],
      keywords:      fm.keywords      || [],
      featured_image: fm.featured_image || '/content/images/default-post.jpg',
      readTime:      Math.ceil(wordCount / 200),
      // Include first 300 chars of content for better search matching
      excerpt:       content.replace(/[#*`\[\]]/g, '').trim().slice(0, 300),
    });
  } catch (e) {
    console.error(`Error processing ${file}:`, e.message);
  }
});

// Sort newest first
posts.sort((a, b) => (b.date || '') > (a.date || '') ? 1 : -1);

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(posts, null, 2), 'utf8');
console.log(`✅ posts.json generated → ${OUTPUT_PATH} (${posts.length} posts)`);
