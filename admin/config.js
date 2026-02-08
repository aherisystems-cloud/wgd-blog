// ============================================
// CONFIGURATION FILE
// ============================================
// This file should be kept secure and not committed to public repos
// Add this to your .gitignore file

window.CONFIG = {
  // Get your FREE Groq API key from: https://console.groq.com/keys
  GROQ_API_KEY: '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',
  GROQ_MODEL: 'llama-3.3-70b-versatile',
  
  // N8N Webhook URL for auto-publishing
  N8N_WEBHOOK_URL: 'https://your-n8n-instance.com/webhook/publish-blog',
  
  // Your blog configuration
  BLOG_CONFIG: {
    siteUrl: 'https://wowglamdecor.com',
    siteName: 'Wow Glam Decor',
    defaultAuthor: {
      name: 'Sarah Mitchell',
      role: 'Interior Design Expert',
      bio: 'Interior design enthusiast and home decor blogger with over 10 years of experience transforming spaces.',
      avatar: '/content/images/author-avatar.jpg'
    }
  }
};

// Product Database with Affiliate Links
// Add your actual affiliate products here
window.AFFILIATE_PRODUCTS = {
  // Format: 'product-name': { name: 'Display Name', url: 'affiliate-link', keywords: ['keyword1', 'keyword2'] }
  
  'modern-sofa': {
    name: 'Modern Minimalist Sofa',
    url: 'https://wayfair.com/furniture/modern-sofa?refid=YOUR_ID',
    keywords: ['modern sofa', 'minimalist sofa', 'contemporary couch'],
    category: 'Living Room'
  },
  
  'velvet-armchair': {
    name: 'Velvet Accent Armchair',
    url: 'https://wayfair.com/furniture/velvet-armchair?refid=YOUR_ID',
    keywords: ['velvet chair', 'accent chair', 'armchair'],
    category: 'Living Room'
  },
  
  'coffee-table': {
    name: 'Glass Coffee Table',
    url: 'https://ikea.com/coffee-table?affiliate=YOUR_ID',
    keywords: ['coffee table', 'center table', 'living room table'],
    category: 'Living Room'
  },
  
  'floor-lamp': {
    name: 'Modern Arc Floor Lamp',
    url: 'https://westelm.com/floor-lamp?cm_sp=YOUR_ID',
    keywords: ['floor lamp', 'standing lamp', 'arc lamp'],
    category: 'Lighting'
  },
  
  'wall-art': {
    name: 'Abstract Canvas Wall Art',
    url: 'https://amazon.com/wall-art?tag=YOUR_TAG',
    keywords: ['wall art', 'canvas art', 'abstract painting'],
    category: 'Decor'
  },
  
  'throw-pillows': {
    name: 'Decorative Throw Pillows Set',
    url: 'https://target.com/throw-pillows?ref=YOUR_ID',
    keywords: ['throw pillows', 'decorative pillows', 'cushions'],
    category: 'Decor'
  },
  
  'area-rug': {
    name: 'Modern Area Rug',
    url: 'https://wayfair.com/rugs/area-rug?refid=YOUR_ID',
    keywords: ['area rug', 'living room rug', 'carpet'],
    category: 'Rugs'
  },
  
  'curtains': {
    name: 'Blackout Curtains',
    url: 'https://amazon.com/curtains?tag=YOUR_TAG',
    keywords: ['curtains', 'drapes', 'window treatment'],
    category: 'Window Treatments'
  },
  
  'bedding-set': {
    name: 'Luxury Bedding Set',
    url: 'https://wayfair.com/bedding/luxury-set?refid=YOUR_ID',
    keywords: ['bedding set', 'duvet cover', 'comforter set'],
    category: 'Bedroom'
  },
  
  'nightstand': {
    name: 'Modern Nightstand',
    url: 'https://ikea.com/nightstand?affiliate=YOUR_ID',
    keywords: ['nightstand', 'bedside table', 'night table'],
    category: 'Bedroom'
  }
};
