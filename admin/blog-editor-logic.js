// ============================================
// BLOG EDITOR - COMPLETE JAVASCRIPT LOGIC
// ============================================

// Global state
let selectedProducts = new Set();
let currentTags = [];
let generatedKeywords = null;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ Blog Editor initialized');
  
  // Initialize product grid
  renderProductGrid();
  renderCategoryFilters();
  
  // Setup tag input
  setupTagInput();
  
  // Initial counters
  updateTitleCounter();
  updateWordCount();
  updateSEOTitleCounter();
  updateSEODescCounter();
  updateGooglePreview();
  
  // Check API configuration
  if (!window.CONFIG || !window.CONFIG.GROQ_API_KEY) {
    console.warn('⚠️ Warning: Groq API key not configured. AI features will not work.');
  }
});

// ============================================
// TAB SWITCHING
// ============================================

function switchTab(index) {
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.tab-content');
  
  tabs.forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
  });
  
  contents.forEach((content, i) => {
    content.classList.toggle('active', i === index);
  });
  
  // Update preview when switching to preview tab
  if (index === 5) {
    updatePreview();
  }
}

// ============================================
// COUNTERS & UPDATES
// ============================================

function updateTitleCounter() {
  const title = document.getElementById('title').value;
  const counter = document.getElementById('titleCounter');
  const length = title.length;
  
  counter.textContent = `${length} / 60 characters`;
  
  if (length === 0) {
    counter.className = 'counter bad';
  } else if (length < 40) {
    counter.className = 'counter warning';
  } else if (length <= 60) {
    counter.className = 'counter good';
  } else {
    counter.className = 'counter bad';
  }
  
  updateSEOScore();
  updateGooglePreview();
}

function updateWordCount() {
  const content = document.getElementById('content').value;
  const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
  const readingTime = Math.ceil(words / 200);
  
  document.getElementById('wordCounter').textContent = `${words} words`;
  document.getElementById('readingTime').textContent = `${readingTime} min read`;
  
  const counter = document.getElementById('wordCounter');
  if (words < 300) {
    counter.className = 'counter bad';
  } else if (words < 800) {
    counter.className = 'counter warning';
  } else {
    counter.className = 'counter good';
  }
  
  updateSEOScore();
}

function updateSEOTitleCounter() {
  const seoTitle = document.getElementById('seoTitle').value;
  const counter = document.getElementById('seoTitleCounter');
  const length = seoTitle.length;
  
  counter.textContent = `${length} / 60 characters`;
  
  if (length === 0) {
    counter.className = 'counter';
  } else if (length <= 60) {
    counter.className = 'counter good';
  } else {
    counter.className = 'counter bad';
  }
}

function updateSEODescCounter() {
  const seoDesc = document.getElementById('seoDescription').value;
  const counter = document.getElementById('seoDescCounter');
  const length = seoDesc.length;
  
  counter.textContent = `${length} / 160 characters`;
  
  if (length === 0) {
    counter.className = 'counter';
  } else if (length >= 150 && length <= 160) {
    counter.className = 'counter good';
  } else if (length >= 120 && length < 150) {
    counter.className = 'counter warning';
  } else {
    counter.className = 'counter bad';
  }
}

function updateGooglePreview() {
  const title = document.getElementById('seoTitle').value || document.getElementById('title').value;
  const description = document.getElementById('seoDescription').value;
  const titleSlug = document.getElementById('title').value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  document.getElementById('googleTitle').textContent = title || 'Your title will appear here';
  document.getElementById('googleUrl').textContent = `wowglamdecor.com › ${titleSlug || 'your-slug'}`;
  document.getElementById('googleDesc').textContent = description || 'Your meta description will appear here...';
}

function updateSEOScore() {
  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
  const headings = (content.match(/^#{2,3}\s/gm) || []).length;
  
  let score = 0;
  
  // Title check
  if (title.length >= 40 && title.length <= 60) {
    score += 25;
    document.getElementById('titleScore').textContent = '✅';
  } else {
    document.getElementById('titleScore').textContent = '❌';
  }
  
  // Content length
  if (words >= 800) {
    score += 35;
    document.getElementById('contentScore').textContent = '✅ ' + words + ' words';
  } else if (words >= 300) {
    score += 20;
    document.getElementById('contentScore').textContent = '⚠️ ' + words + ' words';
  } else {
    document.getElementById('contentScore').textContent = '❌ ' + words + ' words';
  }
  
  // Headings
  if (headings >= 3) {
    score += 20;
    document.getElementById('headingScore').textContent = '✅ ' + headings + ' headings';
  } else {
    document.getElementById('headingScore').textContent = '❌ ' + headings + ' headings';
  }
  
  // Product links
  const productLinks = (content.match(/\[([^\]]+)\]\(https?:\/\/[^\)]+\)/g) || []).length;
  document.getElementById('affiliateScore').textContent = productLinks;
  if (productLinks >= 3) {
    score += 20;
  }
  
  // Update score display
  document.getElementById('seoScore').textContent = score;
  const scoreCircle = document.getElementById('scoreCircle');
  scoreCircle.className = 'score-circle';
  
  if (score >= 80) {
    scoreCircle.classList.add('grade-a');
  } else if (score >= 60) {
    scoreCircle.classList.add('grade-b');
  } else if (score >= 40) {
    scoreCircle.classList.add('grade-c');
  } else {
    scoreCircle.classList.add('grade-d');
  }
}

// ============================================
// STATUS MESSAGES
// ============================================

function showStatus(message, type = 'info') {
  const statusEl = document.getElementById('statusMessage');
  if (!statusEl) return;
  
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
  statusEl.style.display = 'block';
  
  if (type === 'success' || type === 'info') {
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 5000);
  }
}

// ============================================
// AI CONTENT GENERATION
// ============================================

async function generateAIContent() {
  const topic = document.getElementById('aiTopic').value.trim();
  
  if (!topic) {
    showStatus('❌ Please enter a topic first', 'error');
    return;
  }
  
  if (!window.CONFIG || !window.CONFIG.GROQ_API_KEY) {
    showStatus('❌ Error: Groq API key not configured. Check SETUP.md for instructions.', 'error');
    return;
  }
  
  const btn = event.target;
  btn.disabled = true;
  btn.innerHTML = '<span class="loading-spinner"></span> Generating...';
  
  showStatus('🤖 AI is writing your article...', 'info');
  
  try {
    const prompt = `Write a comprehensive, SEO-optimized blog post about: "${topic}"

Requirements:
- Write 1000-1500 words
- Use markdown formatting with ## and ### headings
- Include an engaging introduction
- Add 4-6 main sections with subheadings
- Write in a friendly, conversational tone
- Include practical tips and actionable advice
- End with a strong conclusion
- Optimize for home decor and furniture keywords
- Make it scannable with bullet points where appropriate

Format: Use proper markdown. Start with ## Introduction, use ### for subsections.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${window.CONFIG.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: window.CONFIG.GROQ_MODEL,
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 3000
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    // Set content
    document.getElementById('content').value = generatedContent;
    
    // Generate title from topic
    const titleMatch = topic.match(/^(\d+\s+)?(.+)$/);
    const cleanTitle = titleMatch ? titleMatch[0] : topic;
    document.getElementById('title').value = cleanTitle;
    
    // Auto-generate SEO meta
    await aiSEO();
    
    // Update all counters
    updateTitleCounter();
    updateWordCount();
    
    showStatus('✅ Article generated successfully!', 'success');
    
  } catch (error) {
    console.error('AI Generation Error:', error);
    showStatus(`❌ Error: ${error.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '✨ Generate Full Article';
  }
}

async function aiImprove() {
  const content = document.getElementById('content').value;
  
  if (!content) {
    showStatus('❌ Please add some content first', 'error');
    return;
  }
  
  if (!window.CONFIG || !window.CONFIG.GROQ_API_KEY) {
    showStatus('❌ Error: Groq API key not configured', 'error');
    return;
  }
  
  const btn = event.target;
  btn.disabled = true;
  btn.innerHTML = '<span class="loading-spinner"></span> Improving...';
  
  showStatus('🤖 AI is improving your content...', 'info');
  
  try {
    const prompt = `Improve this blog post content. Make it more engaging, add practical tips, improve readability, and ensure it's SEO-friendly. Keep the same structure but enhance the writing:

${content}

Return the improved version in markdown format.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${window.CONFIG.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: window.CONFIG.GROQ_MODEL,
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 3000
      })
    });
    
    const data = await response.json();
    document.getElementById('content').value = data.choices[0].message.content;
    updateWordCount();
    
    showStatus('✅ Content improved!', 'success');
    
  } catch (error) {
    console.error('AI Improve Error:', error);
    showStatus(`❌ Error: ${error.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '💡 Improve Content';
  }
}

async function aiSEO() {
  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  
  if (!title && !content) {
    showStatus('❌ Please add a title or content first', 'error');
    return;
  }
  
  if (!window.CONFIG || !window.CONFIG.GROQ_API_KEY) {
    showStatus('❌ Error: Groq API key not configured', 'error');
    return;
  }
  
  const btn = event.target;
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="loading-spinner"></span> Optimizing...';
  
  showStatus('🤖 AI is generating SEO metadata...', 'info');
  
  try {
    const prompt = `Create SEO metadata for this blog post:

Title: ${title}
Content preview: ${content.substring(0, 500)}...

Generate:
1. SEO Meta Title (50-60 characters, compelling, includes main keyword)
2. SEO Meta Description (150-160 characters, compelling, includes CTA)

Format your response as:
TITLE: [your title here]
DESCRIPTION: [your description here]`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${window.CONFIG.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: window.CONFIG.GROQ_MODEL,
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 500
      })
    });
    
    const data = await response.json();
    const result = data.choices[0].message.content;
    
    // Parse response
    const titleMatch = result.match(/TITLE:\s*(.+)/i);
    const descMatch = result.match(/DESCRIPTION:\s*(.+)/i);
    
    if (titleMatch) {
      document.getElementById('seoTitle').value = titleMatch[1].trim();
      updateSEOTitleCounter();
    }
    
    if (descMatch) {
      document.getElementById('seoDescription').value = descMatch[1].trim();
      updateSEODescCounter();
    }
    
    updateGooglePreview();
    showStatus('✅ SEO metadata generated!', 'success');
    
  } catch (error) {
    console.error('AI SEO Error:', error);
    showStatus(`❌ Error: ${error.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

// ============================================
// TAGS
// ============================================

function setupTagInput() {
  const tagInput = document.getElementById('tagInput');
  if (!tagInput) return;
  
  tagInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = this.value.trim();
      if (tag && !currentTags.includes(tag)) {
        currentTags.push(tag);
        renderTags();
        this.value = '';
      }
    }
  });
}

function renderTags() {
  const container = document.getElementById('tagsContainer');
  const tagInput = document.getElementById('tagInput');
  
  container.innerHTML = '';
  
  currentTags.forEach((tag, index) => {
    const tagEl = document.createElement('div');
    tagEl.className = 'tag';
    tagEl.innerHTML = `
      ${tag}
      <button type="button" onclick="removeTag(${index})">×</button>
    `;
    container.appendChild(tagEl);
  });
  
  container.appendChild(tagInput);
}

function removeTag(index) {
  currentTags.splice(index, 1);
  renderTags();
}

// ============================================
// PRODUCTS
// ============================================

function renderCategoryFilters() {
  const container = document.getElementById('categoryFilters');
  if (!container || !window.getAllCategories) return;
  
  const categories = window.getAllCategories();
  
  let html = '<button class="category-filter active" onclick="filterByCategory(\'\')">All</button>';
  categories.forEach(cat => {
    html += `<button class="category-filter" onclick="filterByCategory('${cat}')">${cat}</button>`;
  });
  
  container.innerHTML = html;
}

function filterByCategory(category) {
  const filters = document.querySelectorAll('.category-filter');
  filters.forEach(f => {
    if (category === '' && f.textContent === 'All') {
      f.classList.add('active');
    } else if (f.textContent === category) {
      f.classList.add('active');
    } else {
      f.classList.remove('active');
    }
  });
  
  renderProductGrid(category);
}

function renderProductGrid(categoryFilter = '') {
  const grid = document.getElementById('productGrid');
  if (!grid || !window.AFFILIATE_PRODUCTS) return;
  
  const products = categoryFilter 
    ? window.getProductsByCategory(categoryFilter)
    : window.AFFILIATE_PRODUCTS;
  
  let html = '';
  let count = 0;
  
  for (const [id, product] of Object.entries(products)) {
    const isSelected = selectedProducts.has(id);
    html += `
      <div class="product-card ${isSelected ? 'selected' : ''}" onclick="toggleProduct('${id}')">
        <div class="checkbox">${isSelected ? '✓' : ''}</div>
        <div class="product-category">${product.category}</div>
        <div class="product-name">${product.name}</div>
        ${product.price ? `<div class="product-price">${product.price}</div>` : ''}
        <div class="product-keywords">${product.keywords.slice(0, 3).join(', ')}</div>
      </div>
    `;
    count++;
  }
  
  if (count === 0) {
    html = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>No products found</h3>
        <p>Try adjusting your search or filter</p>
      </div>
    `;
  }
  
  grid.innerHTML = html;
  updateProductCount(count);
}

function searchProducts() {
  const searchTerm = document.getElementById('productSearch').value;
  const clearBtn = document.getElementById('clearSearch');
  
  if (searchTerm) {
    clearBtn.style.display = 'block';
    const results = window.searchProducts(searchTerm);
    renderSearchResults(results);
  } else {
    clearBtn.style.display = 'none';
    renderProductGrid();
  }
}

function renderSearchResults(products) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  
  let html = '';
  let count = 0;
  
  for (const [id, product] of Object.entries(products)) {
    const isSelected = selectedProducts.has(id);
    html += `
      <div class="product-card ${isSelected ? 'selected' : ''}" onclick="toggleProduct('${id}')">
        <div class="checkbox">${isSelected ? '✓' : ''}</div>
        <div class="product-category">${product.category}</div>
        <div class="product-name">${product.name}</div>
        ${product.price ? `<div class="product-price">${product.price}</div>` : ''}
        <div class="product-keywords">${product.keywords.slice(0, 3).join(', ')}</div>
      </div>
    `;
    count++;
  }
  
  if (count === 0) {
    html = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>No products found</h3>
        <p>Try different keywords</p>
      </div>
    `;
  }
  
  grid.innerHTML = html;
  updateProductCount(count);
}

function clearProductSearch() {
  document.getElementById('productSearch').value = '';
  document.getElementById('clearSearch').style.display = 'none';
  renderProductGrid();
}

function toggleProduct(productId) {
  if (selectedProducts.has(productId)) {
    selectedProducts.delete(productId);
  } else {
    selectedProducts.add(productId);
  }
  
  // Re-render to update selection state
  const searchTerm = document.getElementById('productSearch').value;
  if (searchTerm) {
    searchProducts();
  } else {
    const activeFilter = document.querySelector('.category-filter.active');
    const category = activeFilter && activeFilter.textContent !== 'All' ? activeFilter.textContent : '';
    renderProductGrid(category);
  }
  
  updateSelectedCount();
}

function updateProductCount(count) {
  const el = document.getElementById('productCount');
  if (el) {
    el.textContent = `${count} products ${document.getElementById('productSearch').value ? 'found' : 'available'}`;
  }
}

function updateSelectedCount() {
  const el = document.getElementById('selectedCount');
  if (el) {
    el.textContent = `${selectedProducts.size} selected`;
  }
}

function clearAllSelections() {
  selectedProducts.clear();
  const searchTerm = document.getElementById('productSearch').value;
  if (searchTerm) {
    searchProducts();
  } else {
    renderProductGrid();
  }
  updateSelectedCount();
  showStatus('✅ All selections cleared', 'success');
}

function insertProductLinks() {
  if (selectedProducts.size === 0) {
    showStatus('❌ Please select at least one product first', 'error');
    return;
  }
  
  const content = document.getElementById('content');
  let insertedCount = 0;
  let linksText = '\n\n## Recommended Products\n\n';
  
  selectedProducts.forEach(productId => {
    const product = window.AFFILIATE_PRODUCTS[productId];
    if (product) {
      linksText += `- [${product.name}](${product.url})${product.price ? ' - ' + product.price : ''}\n`;
      insertedCount++;
    }
  });
  
  content.value += linksText;
  updateWordCount();
  
  showStatus(`✅ Inserted ${insertedCount} product links!`, 'success');
  
  // Show affiliate stats
  displayAffiliateStats();
}

function displayAffiliateStats() {
  const panel = document.getElementById('affiliateStatsPanel');
  const stats = document.getElementById('affiliateStats');
  
  if (!panel || !stats) return;
  
  let html = '<div style="display: grid; gap: 12px;">';
  
  selectedProducts.forEach(productId => {
    const product = window.AFFILIATE_PRODUCTS[productId];
    if (product) {
      html += `
        <div style="padding: 12px; background: #F9FAFB; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${product.name}</strong>
            <div style="font-size: 0.85rem; color: #6B7280;">${product.category}</div>
          </div>
          <div style="font-weight: 700; color: #10B981;">${product.price || 'N/A'}</div>
        </div>
      `;
    }
  });
  
  html += '</div>';
  stats.innerHTML = html;
  panel.style.display = 'block';
}

// ============================================
// PREVIEW
// ============================================

function updatePreview() {
  const content = document.getElementById('content').value;
  const previewEl = document.getElementById('previewContent');
  
  if (!previewEl) return;
  
  if (!content) {
    previewEl.innerHTML = '<p>Your blog post preview will appear here...</p>';
    return;
  }
  
  // Simple markdown to HTML conversion
  let html = content
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|l])/gm, '<p>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  previewEl.innerHTML = html;
}

// ============================================
// EXPORT & PUBLISH
// ============================================

function saveDraft() {
  const data = collectFormData();
  localStorage.setItem('blogDraft', JSON.stringify(data));
  showStatus('✅ Draft saved to browser storage!', 'success');
}

function exportMarkdown() {
  const content = document.getElementById('content').value;
  const title = document.getElementById('title').value;
  
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
  a.click();
  URL.revokeObjectURL(url);
  
  showStatus('✅ Markdown file downloaded!', 'success');
}

function exportFullHTML() {
  const data = collectFormData();
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.seoTitle || data.title}</title>
  <meta name="description" content="${data.seoDescription}">
</head>
<body>
  <article>
    <h1>${data.title}</h1>
    <div class="content">
      ${document.getElementById('previewContent').innerHTML}
    </div>
  </article>
</body>
</html>`;
  
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
  a.click();
  URL.revokeObjectURL(url);
  
  showStatus('✅ HTML file downloaded!', 'success');
}

async function publishToN8N() {
  const data = collectFormData();
  
  if (!data.title || !data.content) {
    showStatus('❌ Please add a title and content first', 'error');
    return;
  }
  
  if (!window.CONFIG || !window.CONFIG.N8N_WEBHOOK_URL) {
    showStatus('❌ N8N Webhook URL not configured. Exporting instead...', 'error');
    exportMarkdown();
    return;
  }
  
  const btn = event.target;
  btn.disabled = true;
  btn.innerHTML = '<span class="loading-spinner"></span> Publishing...';
  
  showStatus('🚀 Publishing to website...', 'info');
  
  try {
    const response = await fetch(window.CONFIG.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Publishing failed');
    }
    
    showStatus('✅ Successfully published to website!', 'success');
    
  } catch (error) {
    console.error('Publish Error:', error);
    showStatus(`❌ Error: ${error.message}. Downloading instead...`, 'error');
    exportMarkdown();
  } finally {
    btn.disabled = false;
    btn.innerHTML = '🚀 Publish to Website';
  }
}

function collectFormData() {
  return {
    title: document.getElementById('title').value,
    category: document.getElementById('category').value,
    tags: currentTags,
    content: document.getElementById('content').value,
    seoTitle: document.getElementById('seoTitle').value || document.getElementById('title').value,
    seoDescription: document.getElementById('seoDescription').value,
    author: {
      name: document.getElementById('authorName').value,
      role: document.getElementById('authorRole').value,
      bio: document.getElementById('authorBio').value
    },
    selectedProducts: Array.from(selectedProducts),
    timestamp: new Date().toISOString()
  };
}

// ============================================
// KEYWORDS (STUBS - TO BE COMPLETED)
// ============================================

async function generateKeywords() {
  showStatus('🚧 Keyword generation feature coming soon!', 'info');
}

async function optimizeWithKeywords() {
  showStatus('🚧 Keyword optimization feature coming soon!', 'info');
}

async function suggestInternalLinks() {
  showStatus('🚧 Internal link suggestions feature coming soon!', 'info');
}

console.log('✅ Blog editor logic loaded successfully');
