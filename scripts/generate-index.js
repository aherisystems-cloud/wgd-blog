const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const matter = require('gray-matter');

const postsDir = path.join(__dirname, '../content/posts');
const outputPath = path.join(postsDir, 'index.json');

function getAllPosts() {
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
  
  const posts = files.map(file => {
    const filePath = path.join(postsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    
    // Calculate read time
    const words = content.split(/\s+/).length;
    const readTime = Math.ceil(words / 200);
    
    return {
      slug: data.slug || file.replace('.md', ''),
      title: data.title,
      description: data.seo?.description || '',
      date: data.date,
      category: data.category || 'Uncategorized',
      tags: data.tags || [],
      author: data.author?.name || 'Editorial Team',
      image: data.featured_image?.src || '/content/images/default.jpg',
      readTime: `${readTime} min read`,
      affiliate: data.affiliate || []
    };
  });
  
  // Sort by date (newest first)
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return posts;
}

const posts = getAllPosts();
fs.writeFileSync(outputPath, JSON.stringify(posts, null, 2));
console.log(`✅ Generated index.json with ${posts.length} posts`);
