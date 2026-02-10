// ============================================
// WORLD-CLASS BLOG EDITOR LOGIC - N8N PROXY VERSION (FIXED)
// Enhanced for Furniture & Home Decor Excellence
// Inspired by: Tom's Guide, Good Housekeeping, Veranda
// ============================================

// Global state
let selectedProducts = [];
let currentKeywords = null;
let allProducts = [];
let tags = [];
let autosaveInterval = null;

// ============================================
// N8N CONFIGURATION
// ============================================

// Get N8N webhook URL from config or use default
const N8N_WEBHOOK_URL = window.CONFIG?.N8N_GROQ_PROXY || "http://localhost:5678/webhook/groq-proxy";

// ============================================
// IMPROVED N8N PROXY CALL WITH PROPER ERROR HANDLING
// ============================================

async function callN8NProxy(action, payload = {}) {
  try {
    console.log(`🔄 Calling N8N proxy - Action: ${action}`);
    
    // Validate N8N URL
    if (!N8N_WEBHOOK_URL || N8N_WEBHOOK_URL.trim() === '') {
      throw new Error('N8N webhook URL is not configured');
    }
    
    // Build request body
    const requestBody = {
      action: action,
      ...payload
    };
    
    console.log('📤 Request payload:', JSON.stringify(requestBody, null, 2));
    
    // Make the request
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    
    // Read response as text first for debugging
    const responseText = await response.text();
    console.log(`📥 N8N Response (${response.status}):`, responseText);
    
    // Check for HTTP errors
    if (!response.ok) {
      console.error(`❌ HTTP Error ${response.status}:`, responseText);
      throw new Error(`N8N returned error ${response.status}: ${responseText.substring(0, 200)}`);
    }
    
    // Check for empty response
    if (!responseText || responseText.trim() === "") {
      throw new Error("Empty response from N8N webhook");
    }
    
    // Try parsing JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (jsonError) {
      console.error("❌ JSON Parse Error:", jsonError);
      console.error("Raw response:", responseText);
      throw new Error(`Invalid JSON from N8N: ${jsonError.message}`);
    }
    
    // Validate response structure
    if (!data) {
      throw new Error("N8N returned null data");
    }
    
    // Check for error in response
    if (data.error) {
      throw new Error(data.error);
    }
    
    console.log('✅ N8N call successful');
    return data;
    
  } catch (error) {
    console.error("❌ N8N Proxy Error:", error);
    
    // Provide user-friendly error messages
    if (error.message.includes('fetch')) {
      throw new Error('Cannot connect to N8N webhook. Please check if N8N is running.');
    } else if (error.message.includes('NetworkError') || error.message.includes('CORS')) {
      throw new Error('Network error. Check N8N CORS settings and webhook configuration.');
    }
    
    throw error;
  }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 World-Class Blog Editor Initializing...');
  
  // Check N8N configuration
  checkN8NConfiguration();
  
  initializeEditor();
  loadProducts();
  setupEventListeners();
  setupAutosave();
  loadDraftIfExists();
  
  console.log('✅ Editor initialized successfully');
});

function checkN8NConfiguration() {
  const setupWarning = document.getElementById('setupWarning');
  
  if (!window.CONFIG || !window.CONFIG.N8N_GROQ_PROXY) {
    if (setupWarning) {
      setupWarning.style.display = 'block';
      setupWarning.innerHTML = `
        <strong>⚠️ N8N Not Configured</strong><br>
        Please configure your N8N webhook URL in config-complete.js<br>
        <code>N8N_GROQ_PROXY: "http://your-n8n-instance:5678/webhook/groq-proxy"</code>
      `;
    }
    console.warn('⚠️ N8N webhook not configured');
  } else if (window.CONFIG.N8N_GROQ_PROXY.includes('localhost')) {
    if (setupWarning) {
      setupWarning.style.display = 'block';
      setupWarning.innerHTML = `
        <strong>ℹ️ Using Local N8N</strong><br>
        Make sure N8N is running on ${window.CONFIG.N8N_GROQ_PROXY}
      `;
    }
    console.log(`ℹ️ Using local N8N: ${window.CONFIG.N8N_GROQ_PROXY}`);
  } else {
    console.log(`✅ N8N configured: ${window.CONFIG.N8N_GROQ_PROXY}`);
  }
}

function initializeEditor() {
  // Initialize tag input
  const tagInput = document.getElementById('tagInput');
  if (tagInput) {
    tagInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTag(this.value);
        this.value = '';
      }
    });
  }
  
  // Initialize preview update
  const contentField = document.getElementById('content');
  if (contentField) {
    contentField.addEventListener('input', debounce(updatePreview, 300));
  }
  
  // Initial preview
  updatePreview();
  
  // Initial metrics
  updateAllMetrics();
}

function setupEventListeners() {
  // Auto-update counters with debouncing for performance
  const titleInput = document.getElementById('title');
  const contentInput = document.getElementById('content');
  const seoTitleInput = document.getElementById('seoTitle');
  const seoDescInput = document.getElementById('seoDescription');
  
  if (titleInput) {
    titleInput.addEventListener('input', debounce(() => {
      updateTitleCounter();
      updateGooglePreview();
    }, 300));
  }
  
  if (contentInput) {
    contentInput.addEventListener('input', debounce(() => {
      updateWordCount();
      calculateSEOScore();
      if (currentKeywords) {
        analyzeKeywordUsage();
      }
    }, 500));
  }
  
  if (seoTitleInput) {
    seoTitleInput.addEventListener('input', debounce(() => {
      updateSEOTitleCounter();
      updateGooglePreview();
    }, 300));
  }
  
  if (seoDescInput) {
    seoDescInput.addEventListener('input', debounce(() => {
      updateSEODescCounter();
      updateGooglePreview();
    }, 300));
  }
}

function setupAutosave() {
  // Auto-save draft every 30 seconds
  autosaveInterval = setInterval(() => {
    const data = collectFormData();
    if (data.title || data.content) {
      try {
        localStorage.setItem('blogDraft', JSON.stringify(data));
        localStorage.setItem('blogDraftTimestamp', new Date().toISOString());
        console.log('💾 Draft auto-saved');
      } catch (e) {
        console.error('Auto-save failed:', e);
      }
    }
  }, 30000);
}

function loadDraftIfExists() {
  try {
    const draft = localStorage.getItem('blogDraft');
    const timestamp = localStorage.getItem('blogDraftTimestamp');
    
    if (draft && timestamp) {
      const draftAge = (Date.now() - new Date(timestamp)) / 1000 / 60; // minutes
      
      if (draftAge < 1440) { // Less than 24 hours old
        if (confirm(`Found a draft from ${Math.round(draftAge)} minutes ago. Load it?`)) {
          const data = JSON.parse(draft);
          restoreFormData(data);
          showStatus('✅ Draft restored successfully!', 'success');
        }
      }
    }
  } catch (e) {
    console.error('Error loading draft:', e);
  }
}

function restoreFormData(data) {
  if (data.title) document.getElementById('title').value = data.title;
  if (data.content) document.getElementById('content').value = data.content;
  if (data.category) document.getElementById('category').value = data.category;
  if (data.seoTitle) document.getElementById('seoTitle').value = data.seoTitle;
  if (data.seoDescription) document.getElementById('seoDescription').value = data.seoDescription;
  if (data.author) {
    if (data.author.name) document.getElementById('authorName').value = data.author.name;
    if (data.author.role) document.getElementById('authorRole').value = data.author.role;
    if (data.author.bio) document.getElementById('authorBio').value = data.author.bio;
  }
  if (data.tags) {
    tags = data.tags;
    renderAllTags();
  }
  if (data.selectedProducts) {
    selectedProducts = data.selectedProducts;
  }
  if (data.keywords) {
    currentKeywords = data.keywords;
  }
  
  updateAllMetrics();
}

// ============================================
// ENHANCED AI FUNCTIONS - N8N PROXY WITH EEAT
// ============================================

async function generateAIContent() {
  const topic = document.getElementById('aiTopic')?.value?.trim();
  
  if (!topic) {
    showStatus('❌ Please enter a topic first', 'error');
    return;
  }
  
  const btn = event?.target;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span> AI Writing Article...';
  }
  
  showStatus('🤖 AI is writing your world-class article...', 'info');
  
  try {
    // Build EEAT-optimized prompt
    const enhancedPrompt = buildEEATPrompt(topic);
    
    // Call N8N with proper error handling
    const data = await callN8NProxy('generate', {
      prompt: enhancedPrompt,
      topic: topic,
      title: topic,
      max_tokens: 4000,
      temperature: 0.7
    });
    
    // Validate response structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from N8N');
    }
    
    const generatedContent = data.choices[0].message.content;
    
    if (!generatedContent || generatedContent.trim().length < 100) {
      throw new Error('Generated content is too short or empty');
    }
    
    // Parse and set content
    const parsedContent = parseAIContent(generatedContent, topic);
    
    document.getElementById('content').value = parsedContent.content;
    document.getElementById('title').value = parsedContent.title;
    
    // Auto-detect category
    autoDetectCategory(parsedContent.content, parsedContent.title);
    
    // Auto-generate tags
    autoGenerateTags(parsedContent.content, parsedContent.title);
    
    const imageCount = data.imageCount || 0;
    showStatus(`✅ World-class article generated! ${imageCount} images included`, 'success');
    
    // Auto-generate SEO metadata
    setTimeout(() => aiSEO(), 1500);
    
    // Update all metrics
    updateAllMetrics();
    
    // Switch to content tab to show results
    switchTab(0);
    
  } catch (error) {
    console.error('AI Generation Error:', error);
    showStatus(`❌ Generation failed: ${error.message}`, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '✨ Generate Full Article';
    }
  }
}

function buildEEATPrompt(topic) {
  return `You are a professional furniture and home decor writer for a premium lifestyle publication (like Tom's Guide, Good Housekeeping, or Veranda).

Write a comprehensive, SEO-optimized blog post about: "${topic}"

CRITICAL REQUIREMENTS FOR EXCELLENCE:

1. **EEAT OPTIMIZATION** (Google's Quality Guidelines):
   
   **EXPERIENCE:**
   - Include specific product testing insights (e.g., "After using this sofa for 6 months...")
   - Provide exact measurements (e.g., "ideal for rooms 12x15 feet or larger")
   - Share practical installation/assembly tips
   - Mention real-world scenarios (e.g., "perfect for families with pets because...")
   
   **EXPERTISE:**
   - Reference design principles (e.g., "Following the rule of thirds...")
   - Explain color theory when relevant
   - Discuss material properties (e.g., "Top-grain leather vs bonded leather...")
   - Use professional terminology with explanations
   
   **AUTHORITATIVENESS:**
   - Cite design trends (e.g., "According to 2025 design forecasts...")
   - Reference industry standards
   - Include professional recommendations
   - Mention what "interior designers recommend"
   
   **TRUSTWORTHINESS:**
   - Be honest about pros AND cons for each recommendation
   - Provide realistic price ranges (budget: $X-Y, mid-range: $Y-Z, premium: $Z+)
   - Disclose maintenance requirements
   - Warn about common mistakes to avoid

2. **CONTENT STRUCTURE** (1,500-2,000 words):
   
   ## Introduction (150-200 words)
   - Start with a relatable problem or desire
   - Preview the value readers will gain
   - Establish credibility early
   - Set clear expectations
   
   ## Main Content (7-10 sections with H2 headings):
   
   ### What to Consider Before Buying
   - Key decision factors
   - Room measurements guide
   - Budget planning tips
   
   ### [Main Recommendation/Idea #1]
   - 150-250 words each
   - Include [PRODUCT ZONE: relevant product keyword]
   - Specific details and examples
   
   ### [Continue with 5-8 more main sections]
   
   ### Budget Breakdown
   - Entry-level options: $X-$Y (what to expect)
   - Mid-range picks: $Y-$Z (best value)
   - Premium choices: $Z+ (investment pieces)
   
   ### Maintenance & Care Tips
   - Daily care requirements
   - Cleaning recommendations
   - Longevity factors
   
   ### Common Mistakes to Avoid
   - Pitfall #1 and how to avoid it
   - Pitfall #2 and solution
   - Pitfall #3 and alternative approach
   
   ## Conclusion (100-150 words)
   - Summarize 3-4 key takeaways
   - Provide actionable next steps
   - End with encouraging final thought

3. **WRITING STYLE** (Tom's Guide / Good Housekeeping Standard):
   - Conversational yet authoritative tone
   - Use "you" to address readers directly
   - Short paragraphs (2-4 sentences maximum)
   - Varied sentence length for readability rhythm
   - Active voice preferred (90%+ of sentences)
   - No jargon without immediate explanation
   - Use sensory details (textures, colors, feelings)
   - Include specific examples and scenarios

4. **SEO INTEGRATION**:
   - Use the main keyword naturally 8-12 times throughout
   - Include semantic variations (e.g., "modern sofa" → "contemporary couch")
   - Add 3-4 question-based H2 headings (e.g., "What Makes a Good...?")
   - Use long-tail keywords in H3 subheadings
   - Naturally incorporate related terms

5. **PRODUCT MENTION ZONES** (Mark clearly for affiliate links):
   - After each main recommendation, add: [PRODUCT ZONE: product type/keyword]
   - Include 8-12 zones throughout the article
   - Example: [PRODUCT ZONE: modern sectional sofa]

Format in clean Markdown with proper heading hierarchy (## for main sections, ### for subsections).
Make it engaging, trustworthy, genuinely helpful, and ready to publish.

Write the complete article now:`;
}

function parseAIContent(content, originalTopic) {
  // Extract title if present in content
  const titleMatch = content.match(/^#\s+(.+)$/m);
  let title = titleMatch ? titleMatch[1].trim() : generateSmartTitle(originalTopic);
  
  // Remove title from content if it was extracted
  let cleanContent = titleMatch ? content.replace(/^#\s+.+$/m, '').trim() : content;
  
  // Ensure content starts properly
  if (!cleanContent.startsWith('##')) {
    cleanContent = cleanContent.replace(/^[^\n]*\n/, ''); // Remove any preamble
  }
  
  return {
    title: title,
    content: cleanContent
  };
}

function generateSmartTitle(topic) {
  const cleaned = topic.trim();
  
  if (cleaned.split(' ').length >= 4) {
    return cleaned;
  }
  
  const words = cleaned.toLowerCase();
  
  if (words.includes('how to')) {
    return cleaned;
  } else if (words.includes('best')) {
    return `${cleaned} for 2025`;
  } else if (words.includes('ideas') || words.includes('tips')) {
    return cleaned;
  } else {
    return `${cleaned}: Complete Guide & Expert Tips`;
  }
}

function autoDetectCategory(content, title) {
  const combinedText = (title + ' ' + content).toLowerCase();
  
  const categoryKeywords = {
    'Living Room': ['living room', 'sofa', 'sectional', 'coffee table', 'tv stand', 'entertainment center'],
    'Bedroom': ['bedroom', 'bed', 'mattress', 'nightstand', 'dresser', 'bedding', 'headboard'],
    'Dining Room': ['dining', 'dining table', 'dining chair', 'buffet', 'sideboard', 'china cabinet'],
    'Home Office': ['office', 'desk', 'office chair', 'workspace', 'ergonomic', 'work from home'],
    'Kitchen': ['kitchen', 'kitchen storage', 'kitchen island', 'pantry', 'kitchen table'],
    'Bathroom': ['bathroom', 'vanity', 'shower', 'bathtub', 'bathroom storage'],
    'Storage & Organization': ['storage', 'organization', 'organizing', 'declutter', 'closet', 'shelving'],
    'Modern Style': ['modern', 'contemporary', 'minimalist', 'clean lines', 'sleek'],
    'Scandinavian Style': ['scandinavian', 'nordic', 'hygge', 'scandi'],
    'Luxury & Glam Decor': ['luxury', 'elegant', 'glamorous', 'upscale', 'premium', 'high-end'],
    'Boho & Rustic Decor': ['boho', 'bohemian', 'rustic', 'farmhouse', 'cottage'],
    'Budget Furniture': ['budget', 'affordable', 'cheap', 'inexpensive', 'under $', 'save money'],
    'Luxury Furniture': ['luxury', 'premium', 'high-end', 'designer', 'expensive'],
    'Small Space Storage': ['small space', 'apartment', 'tiny', 'compact', 'space-saving'],
    'Best Of Lists': ['best', 'top 10', 'top 5', 'ultimate guide', 'complete guide', 'roundup']
  };
  
  let bestMatch = '';
  let bestScore = 0;
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    let score = 0;
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = combinedText.match(regex);
      if (matches) score += matches.length;
    });
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = category;
    }
  }
  
  if (bestMatch) {
    const categorySelect = document.getElementById('category');
    if (categorySelect) {
      categorySelect.value = bestMatch;
    }
  }
}

function autoGenerateTags(content, title) {
  const text = (title + ' ' + content).toLowerCase();
  
  const commonTags = [
    'home decor', 'interior design', 'furniture', 'home improvement',
    'room makeover', 'decorating tips', 'design ideas', 'home styling',
    'modern furniture', 'budget decorating', 'luxury decor', 'small space',
    'DIY home', 'home organization', 'furniture guide', 'decor trends',
    'living room ideas', 'bedroom decor', 'furniture shopping', 'home design'
  ];
  
  const suggestedTags = commonTags.filter(tag => {
    const tagWords = tag.split(' ');
    return tagWords.every(word => text.includes(word));
  }).slice(0, 6);
  
  tags = suggestedTags;
  renderAllTags();
}

async function aiImprove() {
  const content = document.getElementById('content')?.value;
  
  if (!content || content.length < 100) {
    showStatus('❌ Please add some content first', 'error');
    return;
  }
  
  const btn = event?.target;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span> Enhancing...';
  }
  
  showStatus('🤖 AI is elevating your content to magazine quality...', 'info');
  
  try {
    const enhancedPrompt = `You are an expert editor for premium home decor publications like Veranda and Good Housekeeping.

Improve this furniture/decor blog content to MAGAZINE QUALITY:

${content}

IMPROVEMENTS TO MAKE:

1. **EEAT Enhancement**:
   - Add specific measurements, dimensions, or room sizes where missing
   - Include material specifications (e.g., "solid oak", "tempered glass", "100% cotton")
   - Add expert insights (e.g., "Interior designers recommend...")
   - Include practical testing observations or real-world usage notes

2. **Readability**:
   - Break any long paragraphs into 2-4 sentences
   - Vary sentence structure (mix short punchy sentences with longer flowing ones)
   - Make sentences flow naturally with better transitions
   - Remove redundancy and repetitive phrasing

3. **Engagement**:
   - Add more sensory details (textures, colors)
   - Use stronger, more specific verbs
   - Include relatable scenarios
   - Add helpful pro tips in natural spots

4. **SEO Enhancement**:
   - Add semantic keyword variations naturally
   - Include more question-based subheadings where appropriate
   - Add relevant long-tail phrases organically
   - Improve heading hierarchy if needed

5. **Trustworthiness**:
   - Add pros AND cons where relevant
   - Include realistic price expectations or ranges
   - Mention maintenance requirements where important
   - Note common pitfalls to avoid

6. **Product Integration**:
   - Keep all [PRODUCT ZONE: ...] markers intact
   - Make product mentions feel more natural and helpful
   - Add context around why specific products are recommended

KEEP:
- Same overall structure and main points
- All existing headings (but you can improve wording)
- All [PRODUCT ZONE] markers
- All existing image links (![...](https://...))
- Same markdown formatting

Return ONLY the improved markdown content, with no preamble or explanation.`;

    const data = await callN8NProxy('improve', {
      prompt: enhancedPrompt,
      content: content,
      max_tokens: 4000,
      temperature: 0.6
    });
    
    // Validate response
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from N8N');
    }
    
    const improved = data.choices[0].message.content;
    
    if (!improved || improved.length < 100) {
      throw new Error('Improved content is too short');
    }
    
    document.getElementById('content').value = improved;
    updateAllMetrics();
    showStatus('✅ Content elevated to magazine quality!', 'success');
    
  } catch (error) {
    console.error('AI Improvement Error:', error);
    showStatus(`❌ Improvement failed: ${error.message}`, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '💡 Improve Content';
    }
  }
}

async function aiSEO() {
  const title = document.getElementById('title')?.value;
  const content = document.getElementById('content')?.value;
  
  if (!title) {
    showStatus('❌ Please add a title first', 'error');
    return;
  }
  
  const btn = event?.target;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span> Optimizing SEO...';
  }
  
  showStatus('🤖 AI is crafting click-worthy SEO metadata...', 'info');
  
  try {
    const seoPrompt = `You are an SEO expert specializing in furniture and home decor content.

Generate highly optimized SEO metadata for this blog post:

Article Title: ${title}

Content Preview:
${content.substring(0, 600)}

Generate:

1. **SEO Title** (50-60 characters - STRICT LIMIT):
   - Include primary keyword naturally
   - Add year (2025) if it fits and makes sense
   - Make it compelling and click-worthy
   - Front-load the most important keyword
   - Examples: "10 Best Modern Sofas for Small Spaces (2025 Guide)"
   
2. **Meta Description** (150-160 characters - STRICT LIMIT):
   - Start with benefit or hook
   - Include primary keyword naturally
   - Add clear call-to-action
   - Make it engaging and specific
   - Examples: "Discover the best modern sofas for compact living rooms. Expert-tested picks, buying tips & budget options. Transform your space today!"

Return ONLY a JSON object with this EXACT format (no markdown, no code blocks):
{
  "metaTitle": "your optimized title here",
  "metaDescription": "your optimized description here"
}`;

    const data = await callN8NProxy('seo', {
      prompt: seoPrompt,
      title: title,
      content: content,
      max_tokens: 300,
      temperature: 0.7
    });
    
    // Validate response
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from N8N');
    }
    
    const aiResponse = data.choices[0].message.content;
    let seoData;
    
    try {
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        seoData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.warn('JSON parsing failed, using fallback');
      seoData = {
        metaTitle: title.substring(0, 60),
        metaDescription: generateMetaFromContent(content)
      };
    }
    
    // Set values
    document.getElementById('seoTitle').value = seoData.metaTitle;
    document.getElementById('seoDescription').value = seoData.metaDescription;
    
    // Update counters
    updateSEOTitleCounter();
    updateSEODescCounter();
    updateGooglePreview();
    
    showStatus('✅ SEO metadata crafted perfectly!', 'success');
    
  } catch (error) {
    console.error('AI SEO Error:', error);
    showStatus(`❌ SEO generation failed: ${error.message}`, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '🎯 Optimize SEO';
    }
  }
}

function generateMetaFromContent(content) {
  if (!content) return 'Discover expert tips and recommendations for your home.';
  
  // Extract first meaningful paragraph
  const paragraphs = content.split('\n\n').filter(p => 
    p.length > 50 && !p.startsWith('#') && !p.startsWith('[') && !p.startsWith('!')
  );
  
  if (paragraphs.length > 0) {
    let desc = paragraphs[0].replace(/[#*_`\[\]]/g, '').trim();
    if (desc.length > 157) {
      desc = desc.substring(0, 157) + '...';
    }
    return desc;
  }
  
  return 'Discover expert tips and recommendations for your home.';
}

// ============================================
// ADVANCED KEYWORD RESEARCH & OPTIMIZATION
// ============================================

async function generateKeywords() {
  const title = document.getElementById('title')?.value;
  const content = document.getElementById('content')?.value;
  const category = document.getElementById('category')?.value;
  
  if (!title) {
    showStatus('❌ Please add a title first', 'error');
    return;
  }
  
  const btn = event?.target;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span> Researching Keywords...';
  }
  
  showStatus('🤖 AI is researching optimal SEO keywords...', 'info');
  
  try {
    const keywordPrompt = `You are an SEO keyword researcher specializing in furniture and home decor content.

Analyze this article and generate a comprehensive keyword strategy:

Article Title: "${title}"
Category: ${category || 'General Home Decor'}
Content Preview: ${content.substring(0, 500)}

Generate a multi-tier SEO keyword strategy:

1. **Primary Keywords** (1-2 keywords, high search volume):
   - Main topic keywords users actually search for
   - Example: "modern sectional sofa", "small living room ideas"

2. **Secondary Keywords** (3-5 keywords, moderate volume):
   - Related topics and natural variations
   - Example: "contemporary couch", "L-shaped sofa", "modular seating"

3. **Long-Tail Keywords** (5-8 phrases, specific user intent):
   - Question-based or very specific queries
   - Example: "best sectional sofa for small apartment", "how to choose modern sectional", "affordable contemporary couches under $1000"

4. **LSI Keywords** (5-7 terms, semantic relevance):
   - Related concepts Google associates with the topic
   - Example: "living room furniture", "seating arrangement", "upholstery fabric"

5. **Buying-Intent Phrases** (3-5 commercial phrases):
   - Keywords indicating purchase readiness
   - Example: "best [product] for [use]", "[product] reviews 2025", "where to buy [product]"

Return ONLY a JSON object with this EXACT format:
{
  "primary": ["keyword1", "keyword2"],
  "secondary": ["keyword1", "keyword2", "keyword3"],
  "longTail": ["long phrase 1", "long phrase 2", "long phrase 3"],
  "lsi": ["related term 1", "related term 2", "related term 3"],
  "buyingIntent": ["buying phrase 1", "buying phrase 2"]
}`;

    const data = await callN8NProxy('keywords', {
      prompt: keywordPrompt,
      title: title,
      content: content,
      category: category,
      max_tokens: 1000,
      temperature: 0.6
    });
    
    // Validate response
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from N8N');
    }
    
    const aiResponse = data.choices[0].message.content;
    let keywords;
    
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        keywords = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
      
      // Validate structure
      if (!keywords.primary || !keywords.secondary) {
        throw new Error('Invalid keyword structure');
      }
      
    } catch (parseError) {
      console.warn('Keyword parsing failed, using fallback');
      keywords = createFallbackKeywords(title);
    }
    
    currentKeywords = keywords;
    displayKeywords(keywords);
    analyzeKeywordUsage();
    
    showStatus('✅ Keyword strategy generated successfully!', 'success');
    
  } catch (error) {
    console.error('Keyword Generation Error:', error);
    showStatus(`❌ Keyword generation failed: ${error.message}`, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '🔍 Generate SEO Keywords with AI';
    }
  }
}

function createFallbackKeywords(title) {
  const words = title.toLowerCase().split(' ').filter(w => w.length > 3);
  
  return {
    primary: [words.slice(0, 3).join(' ')],
    secondary: [
      words.slice(1, 4).join(' '),
      words.slice(0, 2).join(' '),
      'home decor'
    ],
    longTail: [
      `best ${words.slice(0, 2).join(' ')}`,
      `how to choose ${words[0]} ${words[1] || ''}`,
      `${words[0]} ${words[1] || ''} guide 2025`
    ],
    lsi: ['home decor', 'interior design', 'furniture', 'home improvement', 'room styling'],
    buyingIntent: [
      `buy ${words[0]} ${words[1] || ''}`,
      `${words[0]} ${words[1] || ''} reviews`,
      `best ${words[0]} ${words[1] || ''} 2025`
    ]
  };
}

function displayKeywords(keywords) {
  const panel = document.getElementById('keywordsPanel');
  
  if (!panel) return;
  
  let html = '<div style="display: grid; gap: 20px;">';
  
  // Primary Keywords
  html += `
    <div style="background: linear-gradient(135deg, rgba(123, 31, 162, 0.1), rgba(156, 77, 204, 0.1)); border: 2px solid #7B1FA2; border-radius: 12px; padding: 20px;">
      <h4 style="margin-bottom: 12px; color: #7B1FA2;">🎯 Primary Keywords <span style="font-size: 0.85rem; font-weight: normal;">(Use 8-12x throughout)</span></h4>
      <div>
        ${keywords.primary.map(kw => `
          <span class="keyword-chip primary" onclick="copyKeyword('${escapeQuotes(kw)}')">
            ${kw}
            <span class="usage-badge" id="usage-primary-${slugify(kw)}">${countKeywordUsage(kw)}x</span>
          </span>
        `).join('')}
      </div>
    </div>
  `;
  
  // Secondary Keywords
  html += `
    <div style="background: rgba(59, 130, 246, 0.05); border: 2px solid #3B82F6; border-radius: 12px; padding: 20px;">
      <h4 style="margin-bottom: 12px; color: #3B82F6;">📊 Secondary Keywords <span style="font-size: 0.85rem; font-weight: normal;">(Use 3-5x each)</span></h4>
      <div>
        ${keywords.secondary.map(kw => `
          <span class="keyword-chip secondary" onclick="copyKeyword('${escapeQuotes(kw)}')">
            ${kw}
            <span class="usage-badge" id="usage-secondary-${slugify(kw)}">${countKeywordUsage(kw)}x</span>
          </span>
        `).join('')}
      </div>
    </div>
  `;
  
  // Long-Tail Keywords
  html += `
    <div style="background: rgba(16, 185, 129, 0.05); border: 2px solid #10B981; border-radius: 12px; padding: 20px;">
      <h4 style="margin-bottom: 12px; color: #10B981;">🔍 Long-Tail Keywords <span style="font-size: 0.85rem; font-weight: normal;">(Use in H2/H3 headings)</span></h4>
      <div>
        ${keywords.longTail.map(kw => `
          <span class="keyword-chip longtail" onclick="copyKeyword('${escapeQuotes(kw)}')">
            ${kw}
            <span class="usage-badge" id="usage-longtail-${slugify(kw)}">${countKeywordUsage(kw)}x</span>
          </span>
        `).join('')}
      </div>
    </div>
  `;
  
  // LSI and Buying Intent
  html += `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      <div style="background: white; border: 2px solid #E5E7EB; border-radius: 12px; padding: 16px;">
        <h5 style="margin-bottom: 8px; font-size: 0.9rem; color: #6B7280;">💡 LSI Keywords (Semantic)</h5>
        <div style="font-size: 0.85rem; color: #374151; line-height: 1.8;">
          ${keywords.lsi.join(', ')}
        </div>
      </div>
      <div style="background: white; border: 2px solid #E5E7EB; border-radius: 12px; padding: 16px;">
        <h5 style="margin-bottom: 8px; font-size: 0.9rem; color: #6B7280;">💰 Buying Intent</h5>
        <div style="font-size: 0.85rem; color: #374151; line-height: 1.8;">
          ${keywords.buyingIntent.join(', ')}
        </div>
      </div>
    </div>
  `;
  
  html += '</div>';
  
  panel.innerHTML = html;
}

function countKeywordUsage(keyword) {
  const content = document.getElementById('content')?.value?.toLowerCase() || '';
  const title = document.getElementById('title')?.value?.toLowerCase() || '';
  const combined = title + ' ' + content;
  
  const escaped = keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'gi');
  const matches = combined.match(regex);
  
  return matches ? matches.length : 0;
}

function analyzeKeywordUsage() {
  if (!currentKeywords) return;
  
  // Calculate scores
  const primaryUsage = currentKeywords.primary.map(kw => countKeywordUsage(kw));
  const avgPrimary = primaryUsage.reduce((a, b) => a + b, 0) / primaryUsage.length;
  
  const secondaryUsage = currentKeywords.secondary.map(kw => countKeywordUsage(kw));
  const totalSecondary = secondaryUsage.reduce((a, b) => a + b, 0);
  
  const content = document.getElementById('content')?.value || '';
  const headings = content.match(/#{2,3}\s+.+/g) || [];
  const headingsWithLongTail = headings.filter(h => 
    currentKeywords.longTail.some(kw => h.toLowerCase().includes(kw.toLowerCase()))
  );
  
  let score = 0;
  let feedback = [];
  
  // Primary keyword score (40 points)
  if (avgPrimary >= 8 && avgPrimary <= 15) {
    score += 40;
    feedback.push('✅ Excellent primary keyword density (8-15x)');
  } else if (avgPrimary >= 5) {
    score += 25;
    feedback.push(`⚠️ Primary keywords used ${Math.round(avgPrimary)}x (aim for 8-12x)`);
  } else {
    score += 10;
    feedback.push(`❌ Primary keywords under-used (${Math.round(avgPrimary)}x, need 8-12x)`);
  }
  
  // Secondary keyword score (30 points)
  if (totalSecondary >= 10) {
    score += 30;
    feedback.push('✅ Good secondary keyword coverage');
  } else if (totalSecondary >= 5) {
    score += 20;
    feedback.push(`⚠️ Add more secondary keywords (${totalSecondary}/10+)`);
  } else {
    score += 5;
    feedback.push(`❌ Secondary keywords need work (${totalSecondary}/10+)`);
  }
  
  // Long-tail in headings (30 points)
  if (headingsWithLongTail.length >= 3) {
    score += 30;
    feedback.push('✅ Long-tail keywords in headings');
  } else if (headingsWithLongTail.length >= 1) {
    score += 15;
    feedback.push(`⚠️ Add more long-tail keywords to headings (${headingsWithLongTail.length}/3+)`);
  } else {
    score += 0;
    feedback.push('❌ Use long-tail keywords in H2/H3 headings');
  }
  
  // Update UI
  const scoreEl = document.getElementById('keywordScore');
  if (scoreEl) {
    scoreEl.textContent = score;
    const circle = scoreEl.parentElement;
    if (circle) {
      circle.className = 'score-circle ' + getScoreGrade(score);
    }
  }
  
  const feedbackEl = document.getElementById('keywordFeedback');
  if (feedbackEl) {
    feedbackEl.innerHTML = `
      <div style="line-height: 1.8; font-size: 0.9rem;">
        ${feedback.join('<br>')}
      </div>
    `;
  }
  
  // Update individual keyword counts
  if (currentKeywords.primary) {
    currentKeywords.primary.forEach(kw => {
      const el = document.getElementById(`usage-primary-${slugify(kw)}`);
      if (el) el.textContent = countKeywordUsage(kw) + 'x';
    });
  }
  
  if (currentKeywords.secondary) {
    currentKeywords.secondary.forEach(kw => {
      const el = document.getElementById(`usage-secondary-${slugify(kw)}`);
      if (el) el.textContent = countKeywordUsage(kw) + 'x';
    });
  }
  
  if (currentKeywords.longTail) {
    currentKeywords.longTail.forEach(kw => {
      const el = document.getElementById(`usage-longtail-${slugify(kw)}`);
      if (el) el.textContent = countKeywordUsage(kw) + 'x';
    });
  }
}

function getScoreGrade(score) {
  if (score >= 90) return 'grade-a';
  if (score >= 70) return 'grade-b';
  if (score >= 50) return 'grade-c';
  return 'grade-d';
}

function copyKeyword(keyword) {
  navigator.clipboard.writeText(keyword).then(() => {
    showStatus(`✅ Copied: "${keyword}"`, 'success');
    setTimeout(() => {
      const statusEl = document.getElementById('statusMessage');
      if (statusEl && statusEl.textContent.includes('Copied:')) {
        statusEl.className = 'status-message';
      }
    }, 2000);
  }).catch(err => {
    console.error('Copy failed:', err);
    showStatus('❌ Failed to copy keyword', 'error');
  });
}

async function optimizeWithKeywords() {
  if (!currentKeywords) {
    showStatus('❌ Please generate keywords first', 'error');
    return;
  }
  
  const content = document.getElementById('content')?.value;
  
  if (!content || content.length < 200) {
    showStatus('❌ Please add more content first (at least 200 words)', 'error');
    return;
  }
  
  const btn = event?.target;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span> Optimizing...';
  }
  
  showStatus('🤖 AI is naturally incorporating keywords into your content...', 'info');
  
  try {
    const optimizePrompt = `You are an SEO content optimizer for furniture and home decor articles.

Optimize this content by naturally incorporating these keywords:

**PRIMARY KEYWORDS** (use 8-12 times total): ${currentKeywords.primary.join(', ')}
**SECONDARY KEYWORDS** (use 3-5 times each): ${currentKeywords.secondary.join(', ')}
**LONG-TAIL KEYWORDS** (use in questions/subheadings): ${currentKeywords.longTail.join(', ')}
**LSI TERMS** (sprinkle naturally): ${currentKeywords.lsi.join(', ')}

CURRENT CONTENT:
${content}

OPTIMIZATION REQUIREMENTS:
1. Naturally integrate primary keywords 8-12 times throughout (current count: ${countKeywordUsage(currentKeywords.primary[0])})
2. Add secondary keywords 3-5 times each where they fit naturally
3. Convert some H2 headings to long-tail keyword questions (e.g., "How to choose...")
4. Sprinkle LSI terms where they fit naturally in context
5. Maintain excellent readability - NO keyword stuffing
6. Keep all existing structure, headings, and main points
7. Preserve all [PRODUCT ZONE: ...] markers
8. Keep all image links intact
9. Don't change the markdown formatting

The goal is to make the content more SEO-friendly while keeping it natural and reader-friendly.

Return ONLY the optimized markdown content with no preamble or explanation.`;

    const data = await callN8NProxy('optimize', {
      prompt: optimizePrompt,
      content: content,
      keywords: currentKeywords,
      max_tokens: 4000,
      temperature: 0.5
    });
    
    // Validate response
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from N8N');
    }
    
    const optimized = data.choices[0].message.content;
    
    if (!optimized || optimized.length < 200) {
      throw new Error('Optimized content is too short');
    }
    
    document.getElementById('content').value = optimized;
    updateAllMetrics();
    analyzeKeywordUsage();
    showStatus('✅ Content optimized with keywords naturally!', 'success');
    
  } catch (error) {
    console.error('Keyword Optimization Error:', error);
    showStatus(`❌ Optimization failed: ${error.message}`, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '✨ Auto-Optimize Content with Keywords';
    }
  }
}

// ============================================
// PRODUCT MANAGEMENT
// ============================================

function loadProducts() {
  // Load from window.AFFILIATE_PRODUCTS (from config-complete.js)
  if (window.AFFILIATE_PRODUCTS) {
    allProducts = Object.entries(window.AFFILIATE_PRODUCTS).map(([id, product]) => ({
      id: id,
      name: product.name,
      category: product.category,
      price: product.price || '',
      keywords: product.keywords.join(', '),
      affiliateUrl: product.url
    }));
  } else {
    // Fallback mock data
    allProducts = [
      {
        id: 'mock-1',
        name: "Modern Minimalist Sofa",
        category: "Living Room",
        price: "$899",
        keywords: "modern sofa, minimalist furniture, living room",
        affiliateUrl: "https://example.com/product1"
      },
      {
        id: 'mock-2',
        name: "Scandinavian Coffee Table",
        category: "Living Room",
        price: "$249",
        keywords: "coffee table, scandinavian, modern furniture",
        affiliateUrl: "https://example.com/product2"
      }
    ];
  }
  
  renderProductGrid(allProducts);
  renderCategoryFilters();
  
  console.log(`✅ Loaded ${allProducts.length} products`);
}

function renderProductGrid(products) {
  const grid = document.getElementById('productGrid');
  
  if (!grid) return;
  
  if (products.length === 0) {
    grid.innerHTML = `
      <div class="no-results" style="grid-column: 1 / -1;">
        <div class="no-results-icon">🔍</div>
        <h3>No products found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = products.map(product => {
    const isSelected = selectedProducts.includes(product.id);
    return `
      <div class="product-card ${isSelected ? 'selected' : ''}" 
           onclick="toggleProduct('${product.id}')">
        <div class="checkbox">
          ${isSelected ? '✓' : ''}
        </div>
        <div class="product-category">${product.category}</div>
        <div class="product-name">${product.name}</div>
        ${product.price ? `<div class="product-price">${product.price}</div>` : ''}
        <div class="product-keywords">${product.keywords.split(',').slice(0, 3).join(', ')}</div>
      </div>
    `;
  }).join('');
  
  const countEl = document.getElementById('productCount');
  if (countEl) {
    countEl.textContent = `${products.length} products available`;
  }
}

function renderCategoryFilters() {
  const categories = [...new Set(allProducts.map(p => p.category))].sort();
  const filterSection = document.getElementById('categoryFilters');
  
  if (!filterSection) return;
  
  filterSection.innerHTML = `
    <button class="category-filter active" onclick="filterByCategory('all')">
      All (${allProducts.length})
    </button>
    ${categories.map(cat => {
      const count = allProducts.filter(p => p.category === cat).length;
      return `<button class="category-filter" onclick="filterByCategory('${escapeQuotes(cat)}')">${cat} (${count})</button>`;
    }).join('')}
  `;
}

function toggleProduct(id) {
  const index = selectedProducts.indexOf(id);
  
  if (index > -1) {
    selectedProducts.splice(index, 1);
  } else {
    selectedProducts.push(id);
  }
  
  // Re-render to update selection state
  const searchQuery = document.getElementById('productSearch')?.value || '';
  if (searchQuery) {
    searchProducts();
  } else {
    const activeFilter = document.querySelector('.category-filter.active');
    if (activeFilter) {
      const category = activeFilter.textContent.split('(')[0].trim();
      if (category === 'All') {
        renderProductGrid(allProducts);
      } else {
        const filtered = allProducts.filter(p => p.category === category);
        renderProductGrid(filtered);
      }
    } else {
      renderProductGrid(allProducts);
    }
  }
  
  const selectedCountEl = document.getElementById('selectedCount');
  if (selectedCountEl) {
    selectedCountEl.textContent = `${selectedProducts.length} selected`;
  }
}

function searchProducts() {
  const searchInput = document.getElementById('productSearch');
  const clearBtn = document.getElementById('clearSearch');
  
  if (!searchInput) return;
  
  const query = searchInput.value.toLowerCase();
  
  if (clearBtn) {
    clearBtn.style.display = query ? 'block' : 'none';
  }
  
  if (!query) {
    renderProductGrid(allProducts);
    return;
  }
  
  const filtered = allProducts.filter(p => 
    p.name.toLowerCase().includes(query) ||
    p.keywords.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  );
  
  renderProductGrid(filtered);
}

function clearProductSearch() {
  const searchInput = document.getElementById('productSearch');
  const clearBtn = document.getElementById('clearSearch');
  
  if (searchInput) searchInput.value = '';
  if (clearBtn) clearBtn.style.display = 'none';
  
  renderProductGrid(allProducts);
}

function filterByCategory(category) {
  // Update active filter
  document.querySelectorAll('.category-filter').forEach(btn => {
    btn.classList.remove('active');
  });
  
  if (event && event.target) {
    event.target.classList.add('active');
  }
  
  if (category === 'all') {
    renderProductGrid(allProducts);
  } else {
    const filtered = allProducts.filter(p => p.category === category);
    renderProductGrid(filtered);
  }
}

function clearAllSelections() {
  selectedProducts = [];
  
  // Re-render current view
  const searchQuery = document.getElementById('productSearch')?.value || '';
  if (searchQuery) {
    searchProducts();
  } else {
    const activeFilter = document.querySelector('.category-filter.active');
    if (activeFilter) {
      const category = activeFilter.textContent.split('(')[0].trim();
      if (category === 'All') {
        renderProductGrid(allProducts);
      } else {
        const filtered = allProducts.filter(p => p.category === category);
        renderProductGrid(filtered);
      }
    } else {
      renderProductGrid(allProducts);
    }
  }
  
  const selectedCountEl = document.getElementById('selectedCount');
  if (selectedCountEl) {
    selectedCountEl.textContent = '0 selected';
  }
  
  showStatus('✅ All selections cleared', 'success');
}

function insertProductLinks() {
  if (selectedProducts.length === 0) {
    showStatus('❌ Please select products first', 'error');
    return;
  }
  
  const products = allProducts.filter(p => selectedProducts.includes(p.id));
  const content = document.getElementById('content')?.value || '';
  
  let newContent = content;
  const insertedProducts = [];
  
  // Try to insert contextually
  products.forEach(product => {
    const keywords = product.keywords.split(',').map(k => k.trim().toLowerCase());
    
    for (const keyword of keywords) {
      const regex = new RegExp(`(#{2,3}.*${escapeRegex(keyword)}.*\\n\\n[^#]+)`, 'i');
      const match = newContent.match(regex);
      
      if (match) {
        const productLink = `\n\n**[→ Check Price: ${product.name}](${product.affiliateUrl})** ${product.price}\n`;
        newContent = newContent.replace(match[0], match[0] + productLink);
        insertedProducts.push(product);
        break;
      }
    }
  });
  
  // If no contextual matches, add a products section
  if (insertedProducts.length === 0) {
    newContent += '\n\n## Recommended Products\n\n';
    products.forEach(product => {
      newContent += `### ${product.name}\n\n`;
      newContent += `${product.keywords.split(',')[0].trim()} ${product.price ? `- ${product.price}` : ''}\n\n`;
      newContent += `**[→ Check Price](${product.affiliateUrl})**\n\n`;
      insertedProducts.push(product);
    });
  }
  
  document.getElementById('content').value = newContent;
  updatePreview();
  updateAllMetrics();
  
  showStatus(`✅ Inserted ${insertedProducts.length} product link${insertedProducts.length > 1 ? 's' : ''}!`, 'success');
}

// ============================================
// UI HELPERS & METRICS
// ============================================

function switchTab(index) {
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.tab-content');
  
  tabs.forEach((t, i) => t.classList.toggle('active', i === index));
  contents.forEach((c, i) => c.classList.toggle('active', i === index));
  
  if (index === 5) {
    updatePreview();
  }
  
  if (index === 2 && currentKeywords) {
    analyzeKeywordUsage();
  }
}

function updateAllMetrics() {
  updateTitleCounter();
  updateWordCount();
  updateSEOTitleCounter();
  updateSEODescCounter();
  updateGooglePreview();
  calculateSEOScore();
  
  if (currentKeywords) {
    analyzeKeywordUsage();
  }
}

function updateTitleCounter() {
  const titleInput = document.getElementById('title');
  const counter = document.getElementById('titleCounter');
  
  if (!titleInput || !counter) return;
  
  const title = titleInput.value;
  const length = title.length;
  
  counter.textContent = `${length} / 60 characters`;
  
  if (length === 0) {
    counter.className = 'counter bad';
  } else if (length >= 40 && length <= 60) {
    counter.className = 'counter good';
  } else {
    counter.className = 'counter warning';
  }
}

function updateWordCount() {
  const contentInput = document.getElementById('content');
  const wordCounter = document.getElementById('wordCounter');
  const readingTime = document.getElementById('readingTime');
  
  if (!contentInput || !wordCounter) return;
  
  const content = contentInput.value;
  const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
  const minutes = Math.ceil(words / 200);
  
  wordCounter.textContent = `${words} words`;
  if (readingTime) {
    readingTime.textContent = `${minutes} min read`;
  }
  
  if (words >= 1500) {
    wordCounter.className = 'counter good';
  } else if (words >= 800) {
    wordCounter.className = 'counter warning';
  } else {
    wordCounter.className = 'counter bad';
  }
}

function updateSEOTitleCounter() {
  const input = document.getElementById('seoTitle');
  const counter = document.getElementById('seoTitleCounter');
  
  if (!input || !counter) return;
  
  const length = input.value.length;
  counter.textContent = `${length} / 60 characters`;
  
  if (length >= 50 && length <= 60) {
    counter.className = 'counter good';
  } else if (length >= 40 || (length > 60 && length <= 70)) {
    counter.className = 'counter warning';
  } else {
    counter.className = 'counter bad';
  }
}

function updateSEODescCounter() {
  const input = document.getElementById('seoDescription');
  const counter = document.getElementById('seoDescCounter');
  
  if (!input || !counter) return;
  
  const length = input.value.length;
  counter.textContent = `${length} / 160 characters`;
  
  if (length >= 150 && length <= 160) {
    counter.className = 'counter good';
  } else if (length >= 120 || (length > 160 && length <= 180)) {
    counter.className = 'counter warning';
  } else {
    counter.className = 'counter bad';
  }
}

function updateGooglePreview() {
  const titleInput = document.getElementById('title');
  const seoTitleInput = document.getElementById('seoTitle');
  const seoDescInput = document.getElementById('seoDescription');
  const googleTitle = document.getElementById('googleTitle');
  const googleDesc = document.getElementById('googleDesc');
  const googleUrl = document.getElementById('googleUrl');
  
  if (!googleTitle || !googleDesc || !googleUrl) return;
  
  const title = seoTitleInput?.value || titleInput?.value || 'Your title will appear here';
  const desc = seoDescInput?.value || 'Your meta description will appear here...';
  const slug = (titleInput?.value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
  
  googleTitle.textContent = title;
  googleDesc.textContent = desc;
  googleUrl.textContent = `${window.CONFIG?.BLOG_CONFIG?.siteUrl?.replace('https://', '') || 'wowglamdecor.com'} › blog › ${slug || 'your-slug'}`;
}

function calculateSEOScore() {
  const titleInput = document.getElementById('title');
  const contentInput = document.getElementById('content');
  
  if (!titleInput || !contentInput) return;
  
  let score = 0;
  const details = {
    title: '❌',
    content: '❌',
    headings: '❌',
    affiliate: 0
  };
  
  // Title check (25 points)
  const titleLength = titleInput.value.length;
  if (titleLength >= 40 && titleLength <= 60) {
    score += 25;
    details.title = '✅';
  } else if (titleLength >= 30) {
    score += 15;
    details.title = '⚠️';
  }
  
  // Content check (35 points)
  const content = contentInput.value;
  const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
  if (words >= 1500) {
    score += 35;
    details.content = `✅ ${words} words`;
  } else if (words >= 800) {
    score += 20;
    details.content = `⚠️ ${words} words`;
  } else {
    details.content = `❌ ${words} words (need 1500+)`;
  }
  
  // Headings check (20 points)
  const h2Count = (content.match(/^##\s+/gm) || []).length;
  const h3Count = (content.match(/^###\s+/gm) || []).length;
  const totalHeadings = h2Count + h3Count;
  
  if (totalHeadings >= 7) {
    score += 20;
    details.headings = `✅ ${totalHeadings} headings`;
  } else if (totalHeadings >= 4) {
    score += 12;
    details.headings = `⚠️ ${totalHeadings} headings`;
  } else {
    details.headings = `❌ ${totalHeadings} headings (need 7+)`;
  }
  
  // Links check (20 points)
  const linkMatches = content.match(/\[.+?\]\(.+?\)/g);
  const linkCount = linkMatches ? linkMatches.length : 0;
  
  if (linkCount >= 8) {
    score += 20;
    details.affiliate = `✅ ${linkCount} links`;
  } else if (linkCount >= 4) {
    score += 12;
    details.affiliate = `⚠️ ${linkCount} links`;
  } else {
    details.affiliate = `❌ ${linkCount} links (need 8+)`;
  }
  
  // Update UI
  const scoreEl = document.getElementById('seoScore');
  const titleScoreEl = document.getElementById('titleScore');
  const contentScoreEl = document.getElementById('contentScore');
  const headingScoreEl = document.getElementById('headingScore');
  const affiliateScoreEl = document.getElementById('affiliateScore');
  const circleEl = document.getElementById('scoreCircle');
  
  if (scoreEl) scoreEl.textContent = score;
  if (titleScoreEl) titleScoreEl.textContent = details.title;
  if (contentScoreEl) contentScoreEl.textContent = details.content;
  if (headingScoreEl) headingScoreEl.textContent = details.headings;
  if (affiliateScoreEl) affiliateScoreEl.textContent = details.affiliate;
  
  if (circleEl) {
    circleEl.className = 'score-circle ' + getScoreGrade(score);
  }
}

function updatePreview() {
  const contentInput = document.getElementById('content');
  const previewContent = document.getElementById('previewContent');
  
  if (!contentInput || !previewContent) return;
  
  const content = contentInput.value;
  
  if (!content) {
    previewContent.innerHTML = '<p style="color: #6B7280;">Your blog post preview will appear here...</p>';
    return;
  }
  
  let html = content
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color: #7B1FA2; font-weight: 600; text-decoration: none;">$1 →</a>')
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 12px; margin: 24px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul style="margin: 16px 0; padding-left: 24px;">$&</ul>')
    .split('\n\n')
    .map(para => {
      if (para.startsWith('<h') || para.startsWith('<ul') || para.startsWith('<img')) {
        return para;
      } else if (para.trim()) {
        return `<p style="margin-bottom: 16px; line-height: 1.8;">${para}</p>`;
      }
      return '';
    })
    .join('\n');
  
  previewContent.innerHTML = html;
}

function addTag(tagText) {
  if (!tagText || !tagText.trim()) return;
  
  const cleaned = tagText.trim();
  
  if (!tags.includes(cleaned)) {
    tags.push(cleaned);
    renderAllTags();
  }
}

function renderAllTags() {
  const container = document.getElementById('tagsContainer');
  const input = document.getElementById('tagInput');
  
  if (!container || !input) return;
  
  const existingTags = container.querySelectorAll('.tag');
  existingTags.forEach(tag => tag.remove());
  
  tags.forEach(tagText => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.innerHTML = `
      ${tagText}
      <button type="button" onclick="removeTag('${escapeQuotes(tagText)}')">×</button>
    `;
    container.insertBefore(tag, input);
  });
}

function removeTag(tagText) {
  tags = tags.filter(t => t !== tagText);
  renderAllTags();
}

function showStatus(message, type) {
  const status = document.getElementById('statusMessage');
  
  if (!status) return;
  
  status.textContent = message;
  status.className = `status-message ${type}`;
  
  if (type === 'success' || type === 'info') {
    setTimeout(() => {
      if (status.className.includes(type)) {
        status.className = 'status-message';
      }
    }, 5000);
  }
}

// ============================================
// EXPORT & PUBLISH FUNCTIONS
// ============================================

function saveDraft() {
  const data = collectFormData();
  
  try {
    localStorage.setItem('blogDraft', JSON.stringify(data));
    localStorage.setItem('blogDraftTimestamp', new Date().toISOString());
    showStatus('✅ Draft saved locally!', 'success');
  } catch (error) {
    console.error('Save error:', error);
    showStatus('❌ Failed to save draft', 'error');
  }
}

function exportMarkdown() {
  const content = document.getElementById('content')?.value;
  const title = document.getElementById('title')?.value;
  
  if (!title || !content) {
    showStatus('❌ Please add title and content first', 'error');
    return;
  }
  
  const markdown = `# ${title}\n\n${content}`;
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slugify(title)}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showStatus('✅ Markdown file downloaded!', 'success');
}

function exportFullHTML() {
  const data = collectFormData();
  
  if (!data.title || !data.content) {
    showStatus('❌ Please add title and content first', 'error');
    return;
  }
  
  let htmlContent = data.content
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%;" />')
    .split('\n\n')
    .map(p => p.startsWith('<h') || p.startsWith('<img') ? p : `<p>${p}</p>`)
    .join('\n');
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.seoTitle || data.title}</title>
  <meta name="description" content="${data.seoDescription || ''}">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      line-height: 1.8;
      color: #1A1D2E;
    }
    h1 { font-size: 2.5rem; margin-bottom: 24px; font-weight: 800; }
    h2 { font-size: 1.75rem; margin: 32px 0 16px; font-weight: 700; }
    h3 { font-size: 1.25rem; margin: 24px 0 12px; font-weight: 600; }
    p { margin-bottom: 16px; }
    a { color: #7B1FA2; text-decoration: none; }
    a:hover { text-decoration: underline; }
    img { border-radius: 12px; margin: 24px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .meta { color: #6B7280; font-size: 0.9rem; margin-bottom: 32px; }
  </style>
</head>
<body>
  <article>
    <h1>${data.title}</h1>
    <div class="meta">
      By ${data.author.name} | ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </div>
    ${htmlContent}
  </article>
</body>
</html>`;
  
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slugify(data.title)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showStatus('✅ HTML file exported!', 'success');
}

async function publishToN8N() {
  const data = collectFormData();
  
  if (!data.title || !data.content) {
    showStatus('❌ Please add title and content first', 'error');
    return;
  }
  
  const btn = event?.target;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span> Publishing...';
  }
  
  showStatus('🚀 Publishing to your website...', 'info');
  
  try {
    const result = await callN8NProxy('publish', {
      post: data,
      siteConfig: window.CONFIG?.BLOG_CONFIG || {}
    });
    
    showStatus('✅ Published successfully!', 'success');
    
    // Clear draft
    localStorage.removeItem('blogDraft');
    localStorage.removeItem('blogDraftTimestamp');
    
    // Show published URL if available
    if (result.publishedUrl) {
      setTimeout(() => {
        showStatus(`✅ Published at: ${result.publishedUrl}`, 'success');
      }, 2000);
    }
    
  } catch (error) {
    console.error('Publishing error:', error);
    showStatus(`❌ Publishing failed: ${error.message}`, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '🚀 Publish to Website';
    }
  }
}

function collectFormData() {
  return {
    title: document.getElementById('title')?.value || '',
    content: document.getElementById('content')?.value || '',
    category: document.getElementById('category')?.value || '',
    tags: tags,
    seoTitle: document.getElementById('seoTitle')?.value || '',
    seoDescription: document.getElementById('seoDescription')?.value || '',
    author: {
      name: document.getElementById('authorName')?.value || 'Sarah Mitchell',
      role: document.getElementById('authorRole')?.value || 'Interior Design Expert',
      bio: document.getElementById('authorBio')?.value || 'Interior design enthusiast with 10+ years of experience.'
    },
    selectedProducts: selectedProducts,
    keywords: currentKeywords,
    publishedAt: new Date().toISOString(),
    stats: {
      wordCount: document.getElementById('content')?.value.trim().split(/\s+/).filter(w => w.length > 0).length || 0,
      seoScore: parseInt(document.getElementById('seoScore')?.textContent) || 0,
      linkCount: (document.getElementById('content')?.value.match(/\[.+?\]\(.+?\)/g) || []).length
    }
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

function escapeQuotes(text) {
  return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================
// CLEANUP ON PAGE UNLOAD
// ============================================

window.addEventListener('beforeunload', function(e) {
  const data = collectFormData();
  if (data.title || data.content) {
    try {
      localStorage.setItem('blogDraft', JSON.stringify(data));
      localStorage.setItem('blogDraftTimestamp', new Date().toISOString());
    } catch (err) {
      console.error('Failed to save draft on unload:', err);
    }
  }
  
  if (autosaveInterval) {
    clearInterval(autosaveInterval);
  }
});

// ============================================
// INITIALIZATION COMPLETE
// ============================================

console.log('✅ World-Class Blog Editor Logic Loaded Successfully (FIXED)');
console.log('📊 Features: EEAT Optimization, Semantic SEO, Smart Product Integration');
console.log('🎯 Quality Standard: Tom\'s Guide / Good Housekeeping / Veranda');
console.log('🔧 N8N Integration: Enhanced error handling and validation');
