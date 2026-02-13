const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const POSTS_DIR = path.join(__dirname, '../content/posts');
const CATEGORY_DIR = path.join(__dirname, '../category');
const TEMPLATE_PATH = path.join(__dirname, '../templates/category-template.html');

// Ensure category directory exists
if (!fs.existsSync(CATEGORY_DIR)) {
  fs.mkdirSync(CATEGORY_DIR, { recursive: true });
}

console.log('📂 Generating category pages...\n');

// Check if template exists
if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error('❌ Template not found at:', TEMPLATE_PATH);
  process.exit(1);
}

// Read template
const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

// Category descriptions
const categoryDescriptions = {
  // Core Rooms
  'living-room': 'Discover stunning living room decor ideas, furniture recommendations, and design inspiration to create your perfect gathering space.',
  'bedroom': 'Transform your bedroom into a peaceful retreat with our curated decor ideas, furniture guides, and styling tips.',
  'dining-room': 'Elevate your dining experience with beautiful dining room designs, furniture selections, and entertaining tips.',
  'home-office': 'Create a productive and stylish workspace with our home office furniture guides and organization ideas.',
  'kitchen': 'Explore kitchen design ideas, storage solutions, and decor tips to create a functional and beautiful cooking space.',
  'bathroom': 'Design a spa-like bathroom with our decor ideas, storage solutions, and fixture recommendations.',
  'entryway-hallway': 'Make a great first impression with entryway and hallway decor ideas and space-maximizing solutions.',
  'laundry-room': 'Organize and beautify your laundry room with practical storage solutions and stylish decor ideas.',
  'kids-room-nursery': 'Create magical spaces for children with our kids room and nursery design ideas and safety tips.',
  'outdoor-patio': 'Extend your living space outdoors with patio furniture, decor, and landscaping inspiration.',
  'balcony-small-spaces': 'Maximize small outdoor spaces with smart furniture choices and creative decor solutions.',
  
  // Furniture Types
  'sofas-seating': 'Find the perfect sofa or seating solution with our comprehensive buying guides and style recommendations.',
  'beds-bed-frames': 'Choose the ideal bed frame for your bedroom with our expert reviews and design inspiration.',
  'mattresses': 'Sleep better with our mattress buying guides, reviews, and comfort recommendations.',
  'tables-desks': 'Discover functional and stylish tables and desks for every room in your home.',
  'chairs-stools': 'Find comfortable and beautiful chairs and stools for dining, working, and relaxing.',
  'wardrobes-closets': 'Organize your wardrobe with our closet systems, storage solutions, and organization tips.',
  'tv-stands-media-units': 'Display your entertainment center stylishly with our TV stand and media unit recommendations.',
  'shelving-bookcases': 'Showcase your books and treasures with our bookcase and shelving solutions.',
  'storage-furniture': 'Maximize your space with multifunctional storage furniture and organization systems.',
  
  // Decor
  'wall-decor': 'Transform blank walls into stunning focal points with our wall art and decor ideas.',
  'lighting-lamps': 'Illuminate your space beautifully with our lighting guides and lamp recommendations.',
  'rugs-carpets': 'Ground your rooms with the perfect rugs and carpets for every style and space.',
  'curtains-window-treatments': 'Frame your windows beautifully with our curtain and window treatment ideas.',
  'mirrors': 'Expand your space and add light with strategically placed mirrors and decorative designs.',
  'cushions-throws': 'Add comfort and style with our throw pillow and blanket recommendations.',
  'vases-decorative-accents': 'Complete your decor with carefully curated vases and decorative accessories.',
  'clocks': 'Keep time in style with our functional and decorative clock recommendations.',
  'plants-planters': 'Bring life indoors with our plant care guides and beautiful planter selections.',
  
  // Storage & Organization
  'closet-organization': 'Maximize closet space with our organization systems and storage solutions.',
  'shoe-storage': 'Keep your shoe collection organized and accessible with our storage ideas.',
  'kitchen-storage-solutions': 'Organize your kitchen efficiently with our storage and organization systems.',
  'bathroom-storage-solutions': 'Create a clutter-free bathroom with our smart storage solutions.',
  'small-space-storage': 'Make the most of limited space with creative storage solutions and multifunctional furniture.',
  
  // Style-Based
  'modern-style': 'Embrace clean lines and contemporary design with our modern style guides and furniture picks.',
  'minimalist-style': 'Live with less and love more with our minimalist design philosophy and recommendations.',
  'scandinavian-style': 'Create a cozy, functional space with Scandinavian design principles and Nordic-inspired decor.',
  'luxury-glam-decor': 'Add opulence to your home with luxurious furnishings and glamorous decor ideas.',
  'boho-rustic-decor': 'Express your free spirit with bohemian and rustic decor ideas and natural materials.',
  'traditional-classic': 'Embrace timeless elegance with traditional and classical design elements.',
  'industrial-style': 'Achieve an urban loft aesthetic with industrial furniture and raw material accents.',
  
  // Buying Intent
  'budget-furniture': 'Furnish your home beautifully without breaking the bank with our budget-friendly recommendations.',
  'luxury-furniture': 'Invest in quality with our curated selection of luxury furniture and high-end pieces.',
  'space-saving-furniture': 'Maximize small spaces with our clever space-saving furniture solutions.',
  'multifunctional-furniture': 'Get more from less with multifunctional furniture that works harder for you.',
  'furniture-buying-guides': 'Make informed decisions with our comprehensive furniture buying guides.',
  'best-of-lists': 'Discover our expertly curated best-of lists for every room and style.',
  'product-reviews': 'Read honest, detailed reviews of furniture and decor products.',
  'comparisons': 'Compare products side-by-side to find the perfect choice for your needs.',
  
  // DIY & Care
  'diy-home-improvement': 'Transform your space with DIY projects and home improvement ideas.',
  'furniture-care-maintenance': 'Keep your furniture looking beautiful with our care and maintenance tips.',
  'cleaning-care-tips': 'Maintain a pristine home with our cleaning guides and care recommendations.',
  'furniture-assembly-tips': 'Assemble furniture like a pro with our step-by-step guides and tips.',
  
  // Seasonal & Lifestyle
  'seasonal-decor': 'Refresh your home seasonally with our rotating decor ideas and inspiration.',
  'holiday-decor': 'Celebrate holidays in style with our festive decor ideas and entertaining tips.',
  'home-makeovers': 'Transform entire rooms or your whole home with our makeover guides.',
  'rental-friendly-decor': 'Personalize rental spaces without losing your security deposit.',
  
  // Gifts
  'home-gift-ideas': 'Find the perfect home and decor gifts for every occasion.',
  'housewarming-gifts': 'Welcome friends to their new home with thoughtful housewarming gifts.',
  'luxury-home-gifts': 'Give unforgettable luxury home gifts for special celebrations.',
  'budget-gift-ideas': 'Find beautiful, affordable home gifts that don\'t compromise on style.'
};

// Get all published posts
const mdFiles = fs.readdirSync(POSTS_DIR)
  .filter(f => f.endsWith('.md') && fs.statSync(path.join(POSTS_DIR, f)).isFile());

// Group posts by category
const postsByCategory = {};

mdFiles.forEach(file => {
  try {
    const filePath = path.join(POSTS_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter } = matter(fileContent);
    
    // Skip unpublished posts
    if (frontmatter.published === false) return;
    
    // Get categories
    const categories = frontmatter.categories || [];
    
    categories.forEach(category => {
      const slug = category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '');
      
      if (!postsByCategory[slug]) {
        postsByCategory[slug] = {
          name: category,
          slug: slug,
          posts: []
        };
      }
      
      postsByCategory[slug].posts.push({
        title: frontmatter.title,
        slug: frontmatter.slug,
        description: frontmatter.description,
        date: frontmatter.date,
        categories: categories,
        tags: frontmatter.tags || [],
        featured_image: frontmatter.featured_image
      });
    });
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

// Generate HTML for each category
Object.keys(postsByCategory).forEach(categorySlug => {
  const category = postsByCategory[categorySlug];
  
  // Sort posts by date (newest first)
  category.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Generate posts HTML
  let postsHTML = '';
  
  if (category.posts.length === 0) {
    postsHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <h2>No posts yet in this category</h2>
        <p>Check back soon for new content!</p>
        <a href="/blog.html">Browse All Posts</a>
      </div>
    `;
  } else {
    postsHTML = '<div class="posts-grid">\n';
    
    category.posts.forEach(post => {
      const postDate = post.date ? new Date(post.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) : 'Recently';
      
      const readTime = Math.ceil((post.description || '').split(/\s+/).length / 50) || 5;
      
      const featuredImage = post.featured_image || '/content/images/default-post.jpg';
      
      // Get first non-current category for badge
      const otherCategory = post.categories.find(c => 
        c.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '') !== categorySlug
      ) || post.categories[0];
      
      postsHTML += `
  <a href="/posts/${post.slug}.html" class="post-card">
    <img src="${featuredImage}" alt="${post.title}" class="post-thumbnail" loading="lazy">
    <div class="post-content">
      <span class="post-category">${otherCategory}</span>
      <h2 class="post-title">${post.title}</h2>
      <p class="post-excerpt">${post.description || ''}</p>
      <div class="post-meta">
        <span class="post-date">📅 ${postDate}</span>
        <span class="post-read-time">⏱️ ${readTime} min read</span>
      </div>
      <span class="read-more">Read More →</span>
    </div>
  </a>\n`;
    });
    
    postsHTML += '</div>';
  }
  
  // Replace placeholders in template
  const description = categoryDescriptions[categorySlug] || 
    `Explore our curated collection of ${category.name} articles, guides, and inspiration.`;
  
  let html = template
    .replace(/\{\{CATEGORY_NAME\}\}/g, category.name)
    .replace(/\{\{CATEGORY_SLUG\}\}/g, categorySlug)
    .replace(/\{\{CATEGORY_DESCRIPTION\}\}/g, description)
    .replace(/\{\{POST_COUNT\}\}/g, category.posts.length)
    .replace(/\{\{POSTS_HTML\}\}/g, postsHTML);
  
  // Write category page
  const outputPath = path.join(CATEGORY_DIR, `${categorySlug}.html`);
  fs.writeFileSync(outputPath, html, 'utf8');
  
  console.log(`✅ ${category.name} (${category.posts.length} posts) → /category/${categorySlug}.html`);
});

console.log(`\n🎉 Generated ${Object.keys(postsByCategory).length} category pages!`);
