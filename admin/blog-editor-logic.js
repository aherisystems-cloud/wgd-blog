// ============================================
// BLOG EDITOR LOGIC
// ============================================

// Check if config is loaded
if (typeof window.CONFIG === 'undefined') {
  alert('ERROR: config-complete.js file not found! Please make sure it is in the same folder as this HTML file.');
}

const CONFIG = window.CONFIG || {};
const AFFILIATE_PRODUCTS = window.AFFILIATE_PRODUCTS || {};

let tags = [];
let currentTab = 0;
let selectedProducts = [];
let insertedProductLinks = [];
let currentCategory = 'all';
let allProducts = {};
let filteredProducts = {};

document.addEventListener('DOMContentLoaded', () => {
  checkAPIKey();
  setupTagInput();
  setupCounters();
  initializeProducts();
  updatePreview();
  updateGooglePreview();
  loadDraft();
});

function checkAPIKey() {
  if (!CONFIG.GROQ_API_KEY || CONFIG.GROQ_API_KEY.includes('YOUR_API_KEY') || CONFIG.GROQ_API_KEY.length < 20) {
    document.getElementById('setupWarning').style.display = 'block';
  }
}

// ============================================
// PRODUCT SEARCH & FILTER
// ============================================

function initializeProducts() {
  allProducts = {...AFFILIATE_PRODUCTS};
  filteredProducts = {...allProducts};
  renderCategoryFilters();
  renderProductGrid();
  updateProductStats();
}

function renderCategoryFilters() {
  const categories = window.getAllCategories();
  const container = document.getElementById('categoryFilters');
  
  const html = `
    <button class="category-filter active" onclick="filterByCategory('all')">
      All Products
    </button>
    ${categories.map(cat => `
      <button class="category-filter" onclick="filterByCategory('${cat}')">
        ${cat}
      </button>
    `).join('')}
  `;
  
  container.innerHTML = html;
}

function filterByCategory(category) {
  currentCategory = category;
  
  // Update active filter button
  document.querySelectorAll('.category-filter').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // Filter products
  if (category === 'all') {
    filteredProducts = {...allProducts};
  } else {
    filteredProducts = window.getProductsByCategory(category);
  }
  
  // Apply search if there's a search term
  const searchTerm = document.getElementById('productSearch').value;
  if (searchTerm.trim()) {
    searchProducts();
  } else {
    renderProductGrid();
    updateProductStats();
  }
}

function searchProducts() {
  const searchInput = document.getElementById('productSearch');
  const clearBtn = document.getElementById('clearSearch');
  const searchTerm = searchInput.value.trim();
  
  if (!searchTerm) {
    clearBtn.style.display = 'none';
    filteredProducts = currentCategory === 'all' ? {...allProducts} : window.getProductsByCategory(currentCategory);
    renderProductGrid();
    updateProductStats();
    return;
  }
  
  clearBtn.style.display = 'block';
  
  // Search within current category
  const baseProducts = currentCategory === 'all' ? allProducts : window.getProductsByCategory(currentCategory);
  const term = searchTerm.toLowerCase();
  
  filteredProducts = Object.entries(baseProducts)
    .filter(([id, product]) => {
      return product.name.toLowerCase().includes(term) ||
             product.keywords.some(keyword => keyword.toLowerCase().includes(term)) ||
             product.category.toLowerCase().includes(term) ||
             (product.price && product.price.toLowerCase().includes(term));
    })
    .reduce((obj, [id, product]) => {
      obj[id] = product;
      return obj;
    }, {});
  
  renderProductGrid();
  updateProductStats();
}

function clearProductSearch() {
  document.getElementById('productSearch').value = '';
  document.getElementById('clearSearch').style.display = 'none';
  filteredProducts = currentCategory === 'all' ? {...allProducts} : window.getProductsByCategory(currentCategory);
  renderProductGrid();
  updateProductStats();
}

function renderProductGrid() {
  const grid = document.getElementById('productGrid');
  const productEntries = Object.entries(filteredProducts);
  
  if (productEntries.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>No products found</h3>
        <p>Try a different search term or category</p>
      </div>
    `;
    return;
  }
  
  const html = productEntries.map(([id, product]) => {
    const isSelected = selectedProducts.includes(id);
    return `
      <div class="product-card ${isSelected ? 'selected' : ''}" onclick="toggleProduct('${id}')" id="product-${id}">
        <div class="checkbox">
          <span style="display: ${isSelected ? 'block' : 'none'};">✓</span>
        </div>
        <div class="product-category">${product.category}</div>
        <div class="product-name">${product.name}</div>
        ${product.price ? `<div class="product-price">${product.price}</div>` : ''}
        <div class="product-keywords">${product.keywords.slice(0, 3).join(', ')}</div>
      </div>
    `;
  }).join('');
  
  grid.innerHTML = html;
}

function toggleProduct(productId) {
  const card = document.getElementById(`product-${productId}`);
  const checkbox = card.querySelector('.checkbox span');
  
  if (selectedProducts.includes(productId)) {
    selectedProducts = selectedProducts.filter(id => id !== productId);
    card.classList.remove('selected');
    checkbox.style.display = 'none';
  } else {
    selectedProducts.push(productId);
    card.classList.add('selected');
    checkbox.style.display = 'block';
  }
  
  updateProductStats();
}

function clearAllSelections() {
  selectedProducts = [];
  document.querySelectorAll('.product-card').forEach(card => {
    card.classList.remove('selected');
    card.querySelector('.checkbox span').style.display = 'none';
  });
  updateProductStats();
  showMessage('✅ All selections cleared', 'success');
}

function updateProductStats() {
  const totalProducts = Object.keys(filteredProducts).length;
  const selectedCount = selectedProducts.length;
  
  document.getElementById('productCount').textContent = `${totalProducts} product${totalProducts !== 1 ? 's' : ''} available`;
  document.getElementById('selectedCount').textContent = `${selectedCount} selected`;
}

// ============================================
// AFFILIATE LINK INSERTION
// ============================================

function insertProductLinks() {
  const content = document.getElementById('content').value;
  
  if (!content) {
    showMessage('❌ Please write content first', 'error');
    return;
  }
  
  if (selectedProducts.length === 0) {
    showMessage('❌ Please select at least one product', 'error');
    return;
  }
  
  let updated = content;
  insertedProductLinks = [];
  
  selectedProducts.forEach(productId => {
    const product = AFFILIATE_PRODUCTS[productId];
    if (!product) return;
    
    let totalMatches = 0;
    
    product.keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b(?!\\]|\\))`, 'gi');
      const matches = updated.match(regex);
      
      if (matches && matches.length > 0) {
        let firstMatch = true;
        
        updated = updated.replace(regex, (match) => {
          if (firstMatch) {
            firstMatch = false;
            totalMatches++;
            return `[${match}](${product.url})`;
          }
          return match;
        });
      }
    });
    
    if (totalMatches > 0) {
      insertedProductLinks.push({
        id: productId,
        name: product.name,
        count: totalMatches
      });
    }
  });
  
  document.getElementById('content').value = updated;
  updateAffiliateStats();
  updateQualityScore();
  
  if (insertedProductLinks.length > 0) {
    showMessage(`✅ Inserted ${insertedProductLinks.length} product link(s)!`, 'success');
  } else {
    showMessage('⚠️ No matches found. Try different products or check your content.', 'error');
  }
}

function updateAffiliateStats() {
  const panel = document.getElementById('affiliateStatsPanel');
  const div = document.getElementById('affiliateStats');
  
  if (insertedProductLinks.length === 0) {
    panel.style.display = 'none';
    return;
  }
  
  panel.style.display = 'block';
  
  const totalLinks = insertedProductLinks.reduce((sum, link) => sum + link.count, 0);
  
  const html = `
    <div style="display: grid; gap: 12px; margin-top: 16px;">
      ${insertedProductLinks.map(link => `
        <div style="display: flex; justify-content: space-between; padding: 12px; background: #F9FAFB; border-radius: 8px;">
          <span style="font-weight: 600;">${link.name}</span>
          <span style="font-weight: 700; color: #10B981;">${link.count} link${link.count > 1 ? 's' : ''}</span>
        </div>
      `).join('')}
    </div>
    <div style="margin-top: 16px; padding: 16px; background: #D1FAE5; border-radius: 8px; text-align: center;">
      <strong style="color: #065F46;">Total: ${totalLinks} product link${totalLinks > 1 ? 's' : ''} inserted</strong>
    </div>
  `;
  div.innerHTML = html;
}

// ============================================
// AI CONTENT GENERATION
// ============================================

async function callGroqAPI(prompt, systemPrompt = '') {
  if (!CONFIG.GROQ_API_KEY || CONFIG.GROQ_API_KEY.includes('YOUR_API_KEY')) {
    throw new Error('Please configure your Groq API key in config-complete.js');
  }

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: CONFIG.GROQ_MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 4000
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateAIContent() {
  const topic = document.getElementById('aiTopic').value.trim();
  const category = document.getElementById('category').value;
  
  if (!topic) {
    showMessage('❌ Please enter a topic first', 'error');
    return;
  }
  
  const btn = event.target;
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<span class="loading-spinner"></span> Generating...';
  btn.disabled = true;
  
  showMessage('🤖 AI is generating your content... This may take 20-30 seconds.', 'info');
  
  try {
    const systemPrompt = `You are a professional interior design blogger writing for Wow Glam Decor.
Write engaging, informative blog posts that help readers transform their homes.
Use a friendly, conversational tone while maintaining professionalism.`;

    const prompt = `Create a comprehensive blog post about: ${topic}

Category: ${category || 'Home Decor'}
Target length: 1500-2000 words
Format: Markdown

Requirements:
- Start with an engaging introduction that hooks readers
- Use markdown headings (## for main sections, ### for subsections)
- Include practical, actionable tips readers can implement
- Write in a conversational, friendly tone
- Include specific examples and recommendations
- Structure content with clear sections
- End with a helpful conclusion

Important: Write ONLY the blog content in markdown format. Do NOT include:
- Any preamble or introduction about what you're doing
- Meta-commentary about the article
- Placeholder text or brackets like [product name]

Just write the actual blog post content starting with the introduction.`;
    
    const content = await callGroqAPI(prompt, systemPrompt);
    
    let cleanContent = content.trim();
    
    const preamblePatterns = [
      /^Here('s| is) (the|a) (blog post|article|content).*?:\n*/i,
      /^I('ve| have) (created|written|prepared).*?:\n*/i,
      /^Below is.*?:\n*/i,
      /^Let me.*?:\n*/i
    ];
    
    preamblePatterns.forEach(pattern => {
      cleanContent = cleanContent.replace(pattern, '');
    });
    
    document.getElementById('content').value = cleanContent.trim();
    document.getElementById('title').value = topic;
    
    const firstParagraph = cleanContent.split('\n\n').find(p => !p.startsWith('#') && p.trim().length > 0) || '';
    const excerpt = firstParagraph.substring(0, 155).replace(/[#*\[\]]/g, '').trim() + '...';
    document.getElementById('seoDescription').value = excerpt;
    
    updateWordCount();
    updateTitleCounter();
    updateSEODescCounter();
    updateQualityScore();
    updateGooglePreview();
    
    showMessage('✅ Content generated successfully! Now select products in the Products tab.', 'success');
  } catch (error) {
    console.error('AI Generation Error:', error);
    showMessage(`❌ Error: ${error.message}`, 'error');
  } finally {
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
}

async function aiImprove() {
  const content = document.getElementById('content').value;
  if (!content) {
    showMessage('❌ Please write some content first', 'error');
    return;
  }
  
  const btn = event.target;
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<span class="loading-spinner"></span> Improving...';
  btn.disabled = true;
  
  showMessage('🤖 AI is improving your content...', 'info');
  
  try {
    const systemPrompt = `You are an expert editor improving blog posts for better readability and engagement.`;
    
    const prompt = `Improve this blog post while keeping the same structure:

${content}

Make these improvements:
- Better readability and flow
- More engaging, conversational language
- Stronger transitions between sections
- Fix any grammar or style issues
- Keep all markdown formatting (##, ###, etc.)
- Preserve any existing links in [text](url) format
- Make it sound more natural and less robotic

Return ONLY the improved content in markdown format. No explanations or preamble.`;
    
    const improved = await callGroqAPI(prompt, systemPrompt);
    document.getElementById('content').value = improved.trim();
    updateWordCount();
    updateQualityScore();
    showMessage('✅ Content improved successfully!', 'success');
  } catch (error) {
    showMessage(`❌ Error: ${error.message}`, 'error');
  } finally {
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
}

async function aiSEO() {
  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  
  if (!title || !content) {
    showMessage('❌ Please add title and content first', 'error');
    return;
  }
  
  const btn = event.target;
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<span class="loading-spinner"></span> Generating SEO...';
  btn.disabled = true;
  
  showMessage('🤖 Generating SEO metadata...', 'info');
  
  try {
    const contentPreview = content.substring(0, 800);
    
    const systemPrompt = `You are an SEO expert creating optimized metadata for blog posts.`;
    
    const prompt = `Create SEO metadata for this blog post:

Title: ${title}
Content preview: ${contentPreview}

Generate:
1. SEO Title (50-60 characters, keyword-rich, compelling, include main benefit)
2. Meta Description (140-155 characters, engaging, include call-to-action)

Return ONLY a JSON object in this exact format:
{
  "seoTitle": "your seo title here",
  "metaDescription": "your meta description here"
}`;
    
    const response = await callGroqAPI(prompt, systemPrompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      document.getElementById('seoTitle').value = result.seoTitle;
      document.getElementById('seoDescription').value = result.metaDescription;
      updateSEOTitleCounter();
      updateSEODescCounter();
      updateGooglePreview();
      showMessage('✅ SEO metadata generated successfully!', 'success');
    } else {
      throw new Error('Could not parse AI response');
    }
  } catch (error) {
    console.error('AI SEO Error:', error);
    autoGenerateSEO();
    showMessage('✅ SEO auto-generated (fallback mode)', 'success');
  } finally {
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
}

// ============================================
// UI HELPERS
// ============================================

function switchTab(index) {
  document.querySelectorAll('.tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
  });
  document.querySelectorAll('.tab-content').forEach((content, i) => {
    content.classList.toggle('active', i === index);
  });
  currentTab = index;
  if (index === 3) updatePreview();
}

function setupTagInput() {
  const input = document.getElementById('tagInput');
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = input.value.trim();
      if (tag && !tags.includes(tag)) {
        tags.push(tag);
        renderTags();
        input.value = '';
      }
    }
  });
}

function renderTags() {
  const container = document.getElementById('tagsContainer');
  const input = document.getElementById('tagInput');
  const html = tags.map((tag, i) => `
    <div class="tag">
      ${tag}
      <button type="button" onclick="removeTag(${i})">×</button>
    </div>
  `).join('');
  container.innerHTML = html + input.outerHTML;
  setupTagInput();
}

function removeTag(i) {
  tags.splice(i, 1);
  renderTags();
}

function setupCounters() {
  updateTitleCounter();
  updateWordCount();
  updateSEOTitleCounter();
  updateSEODescCounter();
  updateQualityScore();
}

function updateTitleCounter() {
  const title = document.getElementById('title').value;
  const counter = document.getElementById('titleCounter');
  const len = title.length;
  counter.textContent = `${len} / 60 characters`;
  counter.className = 'counter ' + (len > 60 ? 'bad' : len > 50 ? 'warning' : len > 40 ? 'good' : '');
  updateQualityScore();
  updateGooglePreview();
}

function updateWordCount() {
  const content = document.getElementById('content').value;
  const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
  const readTime = Math.ceil(words / 200);
  
  document.getElementById('wordCounter').textContent = `${words} words`;
  document.getElementById('readingTime').textContent = `${readTime} min read`;
  
  const counter = document.getElementById('wordCounter');
  counter.className = 'counter ' + (words >= 1000 ? 'good' : words >= 500 ? 'warning' : 'bad');
  updateQualityScore();
  updatePreview();
}

function updateSEOTitleCounter() {
  const seo = document.getElementById('seoTitle').value;
  const counter = document.getElementById('seoTitleCounter');
  const len = seo.length;
  counter.textContent = `${len} / 60 characters`;
  counter.className = 'counter ' + (len > 60 ? 'bad' : len > 50 ? 'warning' : len >= 40 ? 'good' : '');
}

function updateSEODescCounter() {
  const desc = document.getElementById('seoDescription').value;
  const counter = document.getElementById('seoDescCounter');
  const len = desc.length;
  counter.textContent = `${len} / 160 characters`;
  counter.className = 'counter ' + (len > 160 ? 'bad' : len > 150 ? 'warning' : len >= 120 ? 'good' : '');
}

function updateGooglePreview() {
  const title = document.getElementById('title').value || 'Your title will appear here';
  const seoTitle = document.getElementById('seoTitle').value || title;
  const seoDesc = document.getElementById('seoDescription').value || 'Your meta description will appear here...';
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'your-slug';
  
  document.getElementById('googleTitle').textContent = seoTitle;
  document.getElementById('googleUrl').textContent = `wowglamdecor.com › posts › ${slug}`;
  document.getElementById('googleDesc').textContent = seoDesc;
}

function updateQualityScore() {
  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
  const headings = (content.match(/^##\s/gm) || []).length;
  const links = (content.match(/\[.*?\]\(http.*?\)/g) || []).length;
  
  let score = 0;
  
  if (title.length >= 40 && title.length <= 60) score += 25;
  else if (title.length > 0) score += 10;
  
  if (words >= 1500) score += 35;
  else if (words >= 1000) score += 25;
  else if (words >= 500) score += 15;
  
  if (headings >= 5) score += 20;
  else if (headings >= 3) score += 12;
  else if (headings >= 1) score += 5;
  
  if (tags.length >= 3) score += 10;
  else if (tags.length >= 1) score += 5;
  
  if (links >= 3) score += 10;
  else if (links >= 1) score += 5;
  
  document.getElementById('seoScore').textContent = score;
  document.getElementById('scoreCircle').className = 'score-circle ' + 
    (score >= 80 ? 'grade-a' : score >= 60 ? 'grade-b' : score >= 40 ? 'grade-c' : 'grade-d');
  
  document.getElementById('titleScore').textContent = 
    (title.length >= 40 && title.length <= 60) ? '✅' : '❌';
  document.getElementById('contentScore').textContent = 
    words >= 1000 ? '✅' : words >= 500 ? '⚠️' : '❌';
  document.getElementById('headingScore').textContent = 
    headings >= 3 ? '✅' : headings >= 1 ? '⚠️' : '❌';
  document.getElementById('affiliateScore').textContent = links;
}

function autoGenerateSEO() {
  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  
  if (!title) {
    showMessage('❌ Please add a title first', 'error');
    return;
  }
  
  const firstParagraph = content.split('\n\n').find(p => !p.startsWith('#') && p.trim().length > 0) || '';
  const excerpt = firstParagraph.substring(0, 155).replace(/[#*\[\]]/g, '').trim() + '...';
  
  document.getElementById('seoTitle').value = title.substring(0, 50) + ' | Wow Glam Decor';
  document.getElementById('seoDescription').value = excerpt;
  
  updateSEOTitleCounter();
  updateSEODescCounter();
  updateGooglePreview();
  showMessage('✅ SEO metadata auto-generated!', 'success');
}

function updatePreview() {
  const content = document.getElementById('content').value;
  const preview = document.getElementById('previewContent');
  
  if (!content) {
    preview.innerHTML = '<p>Your blog post preview will appear here...</p>';
    return;
  }
  
  const html = content
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: #7B1FA2; text-decoration: underline;">$1</a>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .split('\n\n')
    .map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h')) return p;
      if (p.startsWith('-') || p.startsWith('*')) {
        const items = p.split('\n').map(item => {
          const cleaned = item.replace(/^[-*]\s*/, '').trim();
          return cleaned ? `  <li>${cleaned}</li>` : '';
        }).filter(Boolean).join('\n');
        return `<ul>\n${items}\n</ul>`;
      }
      return `<p>${p}</p>`;
    })
    .join('\n\n');
  
  preview.innerHTML = html;
}

// ============================================
// FILE OPERATIONS
// ============================================

function saveDraft() {
  const draft = {
    title: document.getElementById('title').value,
    category: document.getElementById('category').value,
    tags,
    content: document.getElementById('content').value,
    seoTitle: document.getElementById('seoTitle').value,
    seoDescription: document.getElementById('seoDescription').value,
    authorName: document.getElementById('authorName').value,
    authorRole: document.getElementById('authorRole').value,
    authorBio: document.getElementById('authorBio').value,
    selectedProducts,
    insertedProductLinks,
    savedAt: new Date().toISOString()
  };
  
  localStorage.setItem('wgd_blog_draft', JSON.stringify(draft));
  showMessage('💾 Draft saved successfully!', 'success');
}

function loadDraft() {
  const draft = localStorage.getItem('wgd_blog_draft');
  if (draft) {
    const data = JSON.parse(draft);
    document.getElementById('title').value = data.title || '';
    document.getElementById('category').value = data.category || '';
    tags = data.tags || [];
    renderTags();
    document.getElementById('content').value = data.content || '';
    document.getElementById('seoTitle').value = data.seoTitle || '';
    document.getElementById('seoDescription').value = data.seoDescription || '';
    document.getElementById('authorName').value = data.authorName || 'Sarah Mitchell';
    document.getElementById('authorRole').value = data.authorRole || 'Interior Design Expert';
    document.getElementById('authorBio').value = data.authorBio || 'Interior design enthusiast and home decor blogger.';
    
    if (data.selectedProducts) {
      selectedProducts = data.selectedProducts;
      selectedProducts.forEach(id => {
        const card = document.getElementById(`product-${id}`);
        if (card) {
          card.classList.add('selected');
          card.querySelector('.checkbox span').style.display = 'block';
        }
      });
      updateProductStats();
    }
    
    if (data.insertedProductLinks) {
      insertedProductLinks = data.insertedProductLinks;
      updateAffiliateStats();
    }
    
    setupCounters();
    updateGooglePreview();
  }
}

function exportMarkdown() {
  const content = document.getElementById('content').value;
  const title = document.getElementById('title').value || 'blog-post';
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
  a.click();
  URL.revokeObjectURL(url);
  showMessage('📥 Markdown file downloaded!', 'success');
}

function exportFullHTML() {
  showMessage('📄 HTML export feature - use N8N publishing instead', 'info');
}

async function publishToN8N() {
  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  const category = document.getElementById('category').value;
  const seoTitle = document.getElementById('seoTitle').value || title;
  const seoDesc = document.getElementById('seoDescription').value;
  const authorName = document.getElementById('authorName').value;
  const authorRole = document.getElementById('authorRole').value;
  
  if (!title || !content) {
    showMessage('❌ Please add title and content before publishing', 'error');
    return;
  }
  
  if (!CONFIG.N8N_WEBHOOK_URL || CONFIG.N8N_WEBHOOK_URL.includes('your-n8n')) {
    showMessage('❌ Please configure N8N_WEBHOOK_URL in config-complete.js', 'error');
    return;
  }
  
  const btn = event.target;
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<span class="loading-spinner"></span> Publishing...';
  btn.disabled = true;
  
  showMessage('🚀 Publishing to your website...', 'info');
  
  try {
    const payload = {
      title,
      content,
      category,
      tags,
      seo: {
        title: seoTitle,
        description: seoDesc
      },
      author: {
        name: authorName,
        role: authorRole
      }
    };
    
    const response = await fetch(CONFIG.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      showMessage(`✅ Published successfully! URL: ${result.post.url}`, 'success');
      localStorage.removeItem('wgd_blog_draft');
    } else {
      throw new Error(result.message || 'Publishing failed');
    }
  } catch (error) {
    console.error('Publishing Error:', error);
    showMessage(`❌ Publishing failed: ${error.message}`, 'error');
  } finally {
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
}

function showMessage(message, type = 'info') {
  const msg = document.getElementById('statusMessage');
  msg.textContent = message;
  msg.className = `status-message ${type}`;
  
  if (type === 'success' || type === 'info') {
    setTimeout(() => {
      msg.style.display = 'none';
    }, 5000);
  }
}
// ============================================
// SIMPLIFIED SEO FEATURES FOR BLOG EDITOR
// Add to your existing blog-editor-logic.js
// ============================================

// Global keyword data
let keywordData = {
  primary: [],
  secondary: [],
  longTail: [],
  usage: {}
};

// Storage for published posts (for internal linking)
let publishedPosts = JSON.parse(localStorage.getItem('wgd_published_posts') || '[]');

// ============================================
// KEYWORD GENERATION
// ============================================

async function generateKeywords() {
  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  const category = document.getElementById('category').value;
  
  if (!title || !content) {
    showMessage('❌ Please add title and content first', 'error');
    return;
  }
  
  const btn = event.target;
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<span class="loading-spinner"></span> Generating...';
  btn.disabled = true;
  
  showMessage('🔍 AI is generating keywords...', 'info');
  
  try {
    const systemPrompt = `You are an SEO expert. Generate keywords for blog posts in the home decor niche.`;
    
    const prompt = `Generate SEO keywords for this blog post:

Title: ${title}
Category: ${category}
Content: ${content.substring(0, 1000)}

Return ONLY JSON in this format:
{
  "primary_keywords": ["keyword1", "keyword2"],
  "secondary_keywords": ["keyword3", "keyword4", "keyword5", "keyword6"],
  "long_tail_keywords": ["long phrase 1", "long phrase 2", "long phrase 3", "long phrase 4"]
}`;
    
    const response = await callGroqAPI(prompt, systemPrompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const keywords = JSON.parse(jsonMatch[0]);
      
      keywordData = {
        primary: keywords.primary_keywords || [],
        secondary: keywords.secondary_keywords || [],
        longTail: keywords.long_tail_keywords || [],
        usage: {}
      };
      
      displayKeywords();
      updateKeywordTracking();
      
      showMessage('✅ Keywords generated! Click chips to insert them.', 'success');
    } else {
      throw new Error('Could not parse AI response');
    }
  } catch (error) {
    showMessage(`❌ Error: ${error.message}`, 'error');
  } finally {
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
}

function displayKeywords() {
  const panel = document.getElementById('keywordsPanel');
  
  const html = `
    <div style="margin-bottom: 24px;">
      <h4 style="margin-bottom: 12px;">🎯 Primary Keywords</h4>
      <div>
        ${keywordData.primary.map(kw => `
          <span class="keyword-chip primary" onclick="insertText('${kw}')">
            ${kw}
            <span class="usage-badge">${keywordData.usage[kw] || 0}×</span>
          </span>
        `).join('')}
      </div>
      <p style="font-size: 0.8rem; color: #6B7280; margin-top: 8px;">Use 8-12 times</p>
    </div>
    
    <div style="margin-bottom: 24px;">
      <h4 style="margin-bottom: 12px;">📊 Secondary Keywords</h4>
      <div>
        ${keywordData.secondary.map(kw => `
          <span class="keyword-chip secondary" onclick="insertText('${kw}')">
            ${kw}
            <span class="usage-badge">${keywordData.usage[kw] || 0}×</span>
          </span>
        `).join('')}
      </div>
      <p style="font-size: 0.8rem; color: #6B7280; margin-top: 8px;">Use 3-5 times each</p>
    </div>
    
    <div>
      <h4 style="margin-bottom: 12px;">🔍 Long-Tail Keywords</h4>
      <div>
        ${keywordData.longTail.map(kw => `
          <span class="keyword-chip longtail" onclick="insertText('${kw}')">
            ${kw}
            <span class="usage-badge">${keywordData.usage[kw] || 0}×</span>
          </span>
        `).join('')}
      </div>
      <p style="font-size: 0.8rem; color: #6B7280; margin-top: 8px;">Use in headings</p>
    </div>
  `;
  
  panel.innerHTML = html;
}

function insertText(text) {
  const content = document.getElementById('content');
  const cursorPos = content.selectionStart;
  const before = content.value.substring(0, cursorPos);
  const after = content.value.substring(cursorPos);
  
  content.value = before + text + after;
  content.focus();
  content.selectionStart = content.selectionEnd = cursorPos + text.length;
  
  updateKeywordTracking();
}

function updateKeywordTracking() {
  const content = document.getElementById('content').value.toLowerCase();
  const title = document.getElementById('title').value.toLowerCase();
  const fullText = title + ' ' + content;
  
  // Count keyword usage
  const allKeywords = [...keywordData.primary, ...keywordData.secondary, ...keywordData.longTail];
  
  allKeywords.forEach(keyword => {
    const regex = new RegExp(keyword.toLowerCase(), 'gi');
    const matches = fullText.match(regex);
    keywordData.usage[keyword] = matches ? matches.length : 0;
  });
  
  // Update score
  let score = 0;
  let feedback = [];
  
  keywordData.primary.forEach(kw => {
    const usage = keywordData.usage[kw] || 0;
    if (usage >= 8 && usage <= 15) {
      score += 30;
      feedback.push(`✅ "${kw}" used optimally (${usage}×)`);
    } else if (usage > 0) {
      score += 15;
      feedback.push(`⚠️ "${kw}" needs more (${usage}×)`);
    } else {
      feedback.push(`❌ "${kw}" not found`);
    }
  });
  
  // Check title
  if (keywordData.primary.some(kw => title.includes(kw.toLowerCase()))) {
    score += 20;
    feedback.push('✅ Keyword in title');
  }
  
  document.getElementById('keywordScore').textContent = Math.min(score, 100);
  document.getElementById('keywordFeedback').innerHTML = feedback.join('<br>');
  
  // Update display if panel exists
  if (document.getElementById('keywordsPanel')) {
    displayKeywords();
  }
}

async function optimizeWithKeywords() {
  const content = document.getElementById('content').value;
  
  if (!content || keywordData.primary.length === 0) {
    showMessage('❌ Please generate keywords first', 'error');
    return;
  }
  
  const btn = event.target;
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<span class="loading-spinner"></span> Optimizing...';
  btn.disabled = true;
  
  showMessage('✨ AI is optimizing your content...', 'info');
  
  try {
    const prompt = `Optimize this content with these keywords naturally:

PRIMARY (use 8-12 times): ${keywordData.primary.join(', ')}
SECONDARY (use 3-5 times): ${keywordData.secondary.join(', ')}
LONG-TAIL (use in headings): ${keywordData.longTail.join(', ')}

Content:
${content}

Rules:
- Keep same structure
- Add keywords naturally
- Don't keyword stuff
- Maintain quality
- Keep all markdown links

Return ONLY the optimized content, no explanation.`;
    
    const optimized = await callGroqAPI(prompt, 'You are an SEO content optimizer.');
    document.getElementById('content').value = optimized.trim();
    
    updateKeywordTracking();
    updateWordCount();
    
    showMessage('✅ Content optimized with keywords!', 'success');
  } catch (error) {
    showMessage(`❌ Error: ${error.message}`, 'error');
  } finally {
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
}

// ============================================
// INTERNAL LINKING
// ============================================

async function suggestInternalLinks() {
  const content = document.getElementById('content').value;
  const title = document.getElementById('title').value;
  
  if (!content) {
    showMessage('❌ Please add content first', 'error');
    return;
  }
  
  const btn = event.target;
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<span class="loading-spinner"></span> Finding...';
  btn.disabled = true;
  
  showMessage('🔗 AI is finding link opportunities...', 'info');
  
  try {
    // Create example posts context
    const postsContext = publishedPosts.length > 0
      ? publishedPosts.map(p => `- ${p.title} (slug: ${p.slug})`).join('\n')
      : `- Modern Living Room Ideas (slug: modern-living-room-ideas)
- Bedroom Design Tips (slug: bedroom-design-tips)
- Kitchen Decor Trends (slug: kitchen-decor-trends)`;
    
    const prompt = `Find 3-5 internal linking opportunities in this content:

Title: ${title}
Content: ${content.substring(0, 1500)}

Available posts:
${postsContext}

Return JSON:
{
  "suggestions": [
    {
      "anchor_text": "exact phrase from content",
      "target_slug": "slug-to-link-to",
      "target_title": "Post Title",
      "reason": "why relevant"
    }
  ]
}`;
    
    const response = await callGroqAPI(prompt, 'You are an internal linking expert.');
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      displayLinkSuggestions(data.suggestions || []);
      showMessage('✅ Link suggestions ready!', 'success');
    } else {
      throw new Error('Could not parse AI response');
    }
  } catch (error) {
    showMessage(`❌ Error: ${error.message}`, 'error');
  } finally {
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
}

function displayLinkSuggestions(suggestions) {
  const panel = document.getElementById('linksPanel');
  
  if (suggestions.length === 0) {
    panel.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #6B7280;">
        <div style="font-size: 3rem; margin-bottom: 16px;">🔍</div>
        <h3>No opportunities found</h3>
        <p>Try different content or add more published posts</p>
      </div>
    `;
    return;
  }
  
  const html = suggestions.map((link, i) => `
    <div class="link-suggestion">
      <strong>${i + 1}. "${link.anchor_text}"</strong>
      <small>→ ${link.target_title}</small>
      <p style="font-size: 0.85rem; color: #6B7280; margin-bottom: 12px;">${link.reason}</p>
      <button class="btn btn-sm btn-primary" onclick='addInternalLink(${JSON.stringify(link)})'>
        ✅ Insert Link
      </button>
    </div>
  `).join('');
  
  panel.innerHTML = html;
  updateLinkStats();
}

function addInternalLink(link) {
  const content = document.getElementById('content');
  const regex = new RegExp(`\\b${link.anchor_text}\\b(?!\\])`, 'i');
  
  if (regex.test(content.value)) {
    content.value = content.value.replace(regex, `[${link.anchor_text}](/posts/${link.target_slug}.html)`);
    showMessage(`✅ Added link to "${link.target_title}"`, 'success');
    updateLinkStats();
  } else {
    showMessage(`⚠️ Could not find "${link.anchor_text}" in content`, 'error');
  }
}

function updateLinkStats() {
  const content = document.getElementById('content').value;
  const links = (content.match(/\[.*?\]\(\/posts\/.*?\.html\)/g) || []).length;
  
  document.getElementById('currentLinks').textContent = links;
  
  const statusEl = document.getElementById('linkStatus');
  if (links >= 3 && links <= 7) {
    statusEl.textContent = '✅';
    statusEl.style.color = '#10B981';
  } else if (links > 7) {
    statusEl.textContent = '⚠️';
    statusEl.style.color = '#F59E0B';
  } else {
    statusEl.textContent = '❌';
    statusEl.style.color = '#DC2626';
  }
}

// ============================================
// SAVE POST TO DATABASE
// ============================================

// Update your existing publishToN8N function to save post data
const originalPublishToN8N = publishToN8N;

async function publishToN8N() {
  // Call original publish function
  await originalPublishToN8N();
  
  // After successful publish, save to database
  const title = document.getElementById('title').value;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const category = document.getElementById('category').value;
  
  publishedPosts.push({
    title: title,
    slug: slug,
    category: category,
    tags: tags,
    publishDate: new Date().toISOString()
  });
  
  localStorage.setItem('wgd_published_posts', JSON.stringify(publishedPosts));
}

// Listen for content changes
document.addEventListener('DOMContentLoaded', () => {
  const contentEl = document.getElementById('content');
  if (contentEl) {
    contentEl.addEventListener('input', () => {
      if (keywordData.primary.length > 0) {
        setTimeout(updateKeywordTracking, 500);
      }
      updateLinkStats();
    });
  }
});
