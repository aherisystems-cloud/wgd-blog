// ============================================
// CONFIGURATION FILE - Modern Furniture & Home Decor
// ============================================
// SECURITY NOTE: This file is safe to commit to GitHub
// API keys are loaded from GitHub Secrets or environment variables

window.CONFIG = {
  // ============================================
  // API CONFIGURATION
  // ============================================
  
  // API keys will be injected during deployment via GitHub Actions
  // DO NOT hardcode API keys here - use GitHub Secrets instead
  GROQ_API_KEY: window.ENV_GROQ_API_KEY || '',  // Injected from GitHub Secrets
  GROQ_MODEL: 'llama-3.3-70b-versatile',
  
  // N8N Webhook URL - injected from GitHub Secrets
  N8N_WEBHOOK_URL: window.ENV_N8N_WEBHOOK_URL || '',  // Injected from GitHub Secrets
  
  // Blog configuration
  BLOG_CONFIG: {
    siteUrl: 'https://wowglamdecor.com',
    siteName: 'Wow Glam Decor',
    defaultAuthor: {
      name: 'Sarah Mitchell',
      role: 'Interior Design Expert',
      bio: 'Interior design enthusiast and home decor blogger with over 10 years of experience transforming spaces into stunning, functional homes.',
      avatar: '/content/images/author-avatar.jpg'
    }
  }
};

// ============================================
// SECURITY VALIDATION
// ============================================
// Check if API keys are loaded (helps with debugging)
if (!window.CONFIG.GROQ_API_KEY) {
  console.warn('⚠️ GROQ API Key not loaded. Please check GitHub Secrets configuration.');
}

if (!window.CONFIG.N8N_WEBHOOK_URL) {
  console.warn('⚠️ N8N Webhook URL not loaded. Please check GitHub Secrets configuration.');
}

// ============================================
// AFFILIATE PRODUCTS DATABASE - 150+ PRODUCTS
// ============================================
// Organized by category for easy management
// Format: 'product-id': { name, url, keywords, category, price (optional) }

window.AFFILIATE_PRODUCTS = {
  
  // ============================================
  // LIVING ROOM FURNITURE (25 products)
  // ============================================
  
  'modern-sectional-sofa': {
    name: 'Modern Sectional Sofa',
    url: 'https://www.wayfair.com/furniture/sectional-sofas?refid=YOUR_AFFILIATE_ID',
    keywords: ['sectional sofa', 'modern sectional', 'l-shaped sofa', 'corner sofa', 'modular sofa'],
    category: 'Living Room',
    price: '$1,299'
  },
  
  'mid-century-sofa': {
    name: 'Mid-Century Modern Sofa',
    url: 'https://www.westelm.com/mid-century-sofa?cm_sp=YOUR_AFFILIATE_ID',
    keywords: ['mid-century sofa', 'retro sofa', 'vintage-style sofa', 'mid-century modern couch'],
    category: 'Living Room',
    price: '$1,499'
  },
  
  'velvet-loveseat': {
    name: 'Velvet Loveseat',
    url: 'https://www.wayfair.com/furniture/velvet-loveseat?refid=YOUR_AFFILIATE_ID',
    keywords: ['velvet loveseat', 'plush loveseat', 'two-seater sofa', 'luxury loveseat'],
    category: 'Living Room',
    price: '$799'
  },
  
  'leather-recliner': {
    name: 'Leather Reclining Chair',
    url: 'https://www.amazon.com/leather-recliner?tag=YOUR_AFFILIATE_TAG',
    keywords: ['leather recliner', 'reclining chair', 'power recliner', 'comfortable recliner'],
    category: 'Living Room',
    price: '$899'
  },
  
  'accent-chair-velvet': {
    name: 'Velvet Accent Chair',
    url: 'https://www.wayfair.com/furniture/accent-chairs?refid=YOUR_AFFILIATE_ID',
    keywords: ['accent chair', 'armchair', 'occasional chair', 'statement chair', 'velvet chair'],
    category: 'Living Room',
    price: '$399'
  },
  
  'wingback-chair': {
    name: 'Tufted Wingback Chair',
    url: 'https://www.target.com/wingback-chair?ref=YOUR_AFFILIATE_ID',
    keywords: ['wingback chair', 'high back chair', 'traditional armchair', 'reading chair'],
    category: 'Living Room',
    price: '$449'
  },
  
  'swivel-chair': {
    name: 'Modern Swivel Chair',
    url: 'https://www.wayfair.com/furniture/swivel-chairs?refid=YOUR_AFFILIATE_ID',
    keywords: ['swivel chair', 'rotating chair', 'swivel accent chair', 'spinning chair'],
    category: 'Living Room',
    price: '$599'
  },
  
  'glass-coffee-table': {
    name: 'Modern Glass Coffee Table',
    url: 'https://www.wayfair.com/furniture/glass-coffee-table?refid=YOUR_AFFILIATE_ID',
    keywords: ['glass coffee table', 'modern coffee table', 'center table', 'living room table'],
    category: 'Living Room',
    price: '$349'
  },
  
  'marble-coffee-table': {
    name: 'Marble Top Coffee Table',
    url: 'https://www.westelm.com/marble-coffee-table?cm_sp=YOUR_AFFILIATE_ID',
    keywords: ['marble coffee table', 'stone coffee table', 'luxury coffee table', 'marble top table'],
    category: 'Living Room',
    price: '$699'
  },
  
  'wooden-coffee-table': {
    name: 'Solid Wood Coffee Table',
    url: 'https://www.wayfair.com/furniture/wood-coffee-table?refid=YOUR_AFFILIATE_ID',
    keywords: ['wood coffee table', 'wooden coffee table', 'solid wood table', 'rustic coffee table'],
    category: 'Living Room',
    price: '$499'
  },
  
  'nesting-tables': {
    name: 'Modern Nesting Tables Set',
    url: 'https://www.wayfair.com/furniture/nesting-tables?refid=YOUR_AFFILIATE_ID',
    keywords: ['nesting tables', 'stacking tables', 'side tables set', 'occasional tables'],
    category: 'Living Room',
    price: '$249'
  },
  
  'c-table': {
    name: 'C-Shaped Side Table',
    url: 'https://www.amazon.com/c-table?tag=YOUR_AFFILIATE_TAG',
    keywords: ['c table', 'c-shaped table', 'sofa side table', 'laptop table', 'snack table'],
    category: 'Living Room',
    price: '$89'
  },
  
  'console-table': {
    name: 'Narrow Console Table',
    url: 'https://www.amazon.com/console-table?tag=YOUR_AFFILIATE_TAG',
    keywords: ['console table', 'entryway table', 'sofa table', 'hallway table', 'narrow table'],
    category: 'Living Room',
    price: '$299'
  },
  
  'tv-stand-modern': {
    name: 'Modern TV Stand',
    url: 'https://www.wayfair.com/furniture/tv-stands?refid=YOUR_AFFILIATE_ID',
    keywords: ['tv stand', 'media console', 'entertainment center', 'television stand', 'media unit'],
    category: 'Living Room',
    price: '$449'
  },
  
  'floating-tv-console': {
    name: 'Floating TV Console',
    url: 'https://www.ikea.com/tv-console?affiliate=YOUR_AFFILIATE_ID',
    keywords: ['floating tv console', 'wall-mounted media console', 'floating entertainment center'],
    category: 'Living Room',
    price: '$399'
  },
  
  'bookshelf-modern': {
    name: 'Modern Open Bookshelf',
    url: 'https://www.wayfair.com/furniture/bookcases?refid=YOUR_AFFILIATE_ID',
    keywords: ['bookshelf', 'bookcase', 'open shelving', 'display shelf', 'modern shelving unit'],
    category: 'Living Room',
    price: '$329'
  },
  
  'ladder-shelf': {
    name: 'Ladder Bookshelf',
    url: 'https://www.target.com/ladder-shelf?ref=YOUR_AFFILIATE_ID',
    keywords: ['ladder shelf', 'leaning bookshelf', 'ladder bookcase', 'tiered shelf'],
    category: 'Living Room',
    price: '$179'
  },
  
  'storage-ottoman': {
    name: 'Storage Ottoman',
    url: 'https://www.target.com/storage-ottoman?ref=YOUR_AFFILIATE_ID',
    keywords: ['storage ottoman', 'ottoman with storage', 'coffee table ottoman', 'upholstered ottoman'],
    category: 'Living Room',
    price: '$199'
  },
  
  'pouf-ottoman': {
    name: 'Round Pouf Ottoman',
    url: 'https://www.wayfair.com/furniture/poufs?refid=YOUR_AFFILIATE_ID',
    keywords: ['pouf', 'pouf ottoman', 'floor cushion', 'moroccan pouf', 'round ottoman'],
    category: 'Living Room',
    price: '$89'
  },
  
  'floor-lamp-arc': {
    name: 'Arc Floor Lamp',
    url: 'https://www.westelm.com/arc-floor-lamp?cm_sp=YOUR_AFFILIATE_ID',
    keywords: ['arc floor lamp', 'modern floor lamp', 'arching floor lamp', 'standing lamp'],
    category: 'Living Room',
    price: '$299'
  },
  
  'tripod-floor-lamp': {
    name: 'Tripod Floor Lamp',
    url: 'https://www.wayfair.com/lighting/floor-lamps?refid=YOUR_AFFILIATE_ID',
    keywords: ['tripod floor lamp', 'three-legged lamp', 'modern standing lamp', 'decorative floor lamp'],
    category: 'Living Room',
    price: '$199'
  },
  
  'table-lamp-set': {
    name: 'Modern Table Lamp Set',
    url: 'https://www.target.com/table-lamps?ref=YOUR_AFFILIATE_ID',
    keywords: ['table lamp', 'bedside lamp', 'desk lamp', 'modern table lamp', 'accent lamp'],
    category: 'Living Room',
    price: '$129'
  },
  
  'area-rug-modern': {
    name: 'Modern Area Rug',
    url: 'https://www.wayfair.com/rugs/area-rugs?refid=YOUR_AFFILIATE_ID',
    keywords: ['area rug', 'living room rug', 'modern rug', 'floor rug', 'carpet'],
    category: 'Living Room',
    price: '$299'
  },
  
  'shag-rug': {
    name: 'Plush Shag Rug',
    url: 'https://www.wayfair.com/rugs/shag-rugs?refid=YOUR_AFFILIATE_ID',
    keywords: ['shag rug', 'fluffy rug', 'plush rug', 'soft rug', 'high pile rug'],
    category: 'Living Room',
    price: '$249'
  },
  
  'geometric-rug': {
    name: 'Geometric Pattern Rug',
    url: 'https://www.westelm.com/geometric-rug?cm_sp=YOUR_AFFILIATE_ID',
    keywords: ['geometric rug', 'patterned rug', 'modern pattern rug', 'contemporary rug'],
    category: 'Living Room',
    price: '$399'
  },
  
  // ============================================
  // BEDROOM FURNITURE (30 products)
  // ============================================
  
  'platform-bed-frame': {
    name: 'Modern Platform Bed Frame',
    url: 'https://www.wayfair.com/furniture/platform-beds?refid=YOUR_AFFILIATE_ID',
    keywords: ['platform bed', 'modern bed frame', 'low profile bed', 'contemporary bed'],
    category: 'Bedroom',
    price: '$699'
  },
  
  'upholstered-bed': {
    name: 'Upholstered Bed Frame',
    url: 'https://www.westelm.com/upholstered-bed?cm_sp=YOUR_AFFILIATE_ID',
    keywords: ['upholstered bed', 'fabric bed frame', 'padded headboard bed', 'luxury bed frame'],
    category: 'Bedroom',
    price: '$1,199'
  },
  
  'storage-bed': {
    name: 'Bed Frame with Storage',
    url: 'https://www.ikea.com/storage-bed?affiliate=YOUR_AFFILIATE_ID',
    keywords: ['storage bed', 'bed with drawers', 'storage bed frame', 'platform bed with storage'],
    category: 'Bedroom',
    price: '$899'
  },
  
  'canopy-bed': {
    name: 'Modern Canopy Bed',
    url: 'https://www.wayfair.com/furniture/canopy-beds?refid=YOUR_AFFILIATE_ID',
    keywords: ['canopy bed', 'four poster bed', 'canopy bed frame', 'modern canopy bed'],
    category: 'Bedroom',
    price: '$1,499'
  },
  
  'tufted-headboard': {
    name: 'Tufted Velvet Headboard',
    url: 'https://www.wayfair.com/furniture/headboards?refid=YOUR_AFFILIATE_ID',
    keywords: ['tufted headboard', 'upholstered headboard', 'velvet headboard', 'button-tufted headboard'],
    category: 'Bedroom',
    price: '$399'
  },
  
  'nightstand-modern': {
    name: 'Modern Nightstand',
    url: 'https://www.wayfair.com/furniture/nightstands?refid=YOUR_AFFILIATE_ID',
    keywords: ['nightstand', 'bedside table', 'night table', 'modern nightstand', 'bedside cabinet'],
    category: 'Bedroom',
    price: '$199'
  },
  
  'floating-nightstand': {
    name: 'Floating Nightstand',
    url: 'https://www.amazon.com/floating-nightstand?tag=YOUR_AFFILIATE_TAG',
    keywords: ['floating nightstand', 'wall-mounted nightstand', 'floating bedside table'],
    category: 'Bedroom',
    price: '$129'
  },
  
  'nightstand-set': {
    name: 'Nightstand Set of 2',
    url: 'https://www.target.com/nightstand-set?ref=YOUR_AFFILIATE_ID',
    keywords: ['nightstand set', 'matching nightstands', 'bedside table pair', 'nightstand pair'],
    category: 'Bedroom',
    price: '$349'
  },
  
  'dresser-modern': {
    name: 'Modern 6-Drawer Dresser',
    url: 'https://www.wayfair.com/furniture/dressers?refid=YOUR_AFFILIATE_ID',
    keywords: ['dresser', 'modern dresser', 'chest of drawers', 'bedroom dresser', '6-drawer dresser'],
    category: 'Bedroom',
    price: '$599'
  },
  
  'tall-dresser': {
    name: 'Tall 5-Drawer Dresser',
    url: 'https://www.ikea.com/dresser?affiliate=YOUR_AFFILIATE_ID',
    keywords: ['tall dresser', 'vertical dresser', 'narrow dresser', 'chest dresser', 'lingerie chest'],
    category: 'Bedroom',
    price: '$449'
  },
  
  'double-dresser': {
    name: 'Double Wide Dresser',
    url: 'https://www.wayfair.com/furniture/dressers?refid=YOUR_AFFILIATE_ID',
    keywords: ['double dresser', 'wide dresser', '8-drawer dresser', 'long dresser'],
    category: 'Bedroom',
    price: '$799'
  },
  
  'vanity-table': {
    name: 'Modern Vanity Table',
    url: 'https://www.wayfair.com/furniture/vanity-tables?refid=YOUR_AFFILIATE_ID',
    keywords: ['vanity table', 'makeup vanity', 'dressing table', 'vanity desk', 'beauty station'],
    category: 'Bedroom',
    price: '$349'
  },
  
  'vanity-with-mirror': {
    name: 'Vanity Set with Mirror',
    url: 'https://www.amazon.com/vanity-set?tag=YOUR_AFFILIATE_TAG',
    keywords: ['vanity set', 'vanity with mirror', 'makeup vanity set', 'vanity table with lights'],
    category: 'Bedroom',
    price: '$429'
  },
  
  'full-length-mirror': {
    name: 'Full-Length Floor Mirror',
    url: 'https://www.target.com/full-length-mirror?ref=YOUR_AFFILIATE_ID',
    keywords: ['full-length mirror', 'floor mirror', 'standing mirror', 'leaning mirror', 'full body mirror'],
    category: 'Bedroom',
    price: '$149'
  },
  
  'wall-mirror-large': {
    name: 'Large Wall Mirror',
    url: 'https://www.wayfair.com/decor-pillows/wall-mirrors?refid=YOUR_AFFILIATE_ID',
    keywords: ['wall mirror', 'large mirror', 'decorative mirror', 'hanging mirror', 'statement mirror'],
    category: 'Bedroom',
    price: '$199'
  },
  
  'bedding-set-luxury': {
    name: 'Luxury Bedding Set',
    url: 'https://www.wayfair.com/bed-bath/bedding-sets?refid=YOUR_AFFILIATE_ID',
    keywords: ['bedding set', 'comforter set', 'duvet cover set', 'luxury bedding', 'bed linen set'],
    category: 'Bedroom',
    price: '$199'
  },
  
  'linen-duvet-cover': {
    name: 'Linen Duvet Cover',
    url: 'https://www.westelm.com/linen-duvet?cm_sp=YOUR_AFFILIATE_ID',
    keywords: ['linen duvet cover', 'natural linen bedding', 'breathable duvet cover', 'European linen'],
    category: 'Bedroom',
    price: '$169'
  },
  
  'cotton-sheets': {
    name: 'Egyptian Cotton Sheet Set',
    url: 'https://www.amazon.com/cotton-sheets?tag=YOUR_AFFILIATE_TAG',
    keywords: ['cotton sheets', 'Egyptian cotton sheets', 'luxury sheets', 'bed sheets', 'sheet set'],
    category: 'Bedroom',
    price: '$89'
  },
  
  'weighted-blanket': {
    name: 'Weighted Blanket',
    url: 'https://www.amazon.com/weighted-blanket?tag=YOUR_AFFILIATE_TAG',
    keywords: ['weighted blanket', 'heavy blanket', 'anxiety blanket', 'sensory blanket'],
    category: 'Bedroom',
    price: '$79'
  },
  
  'throw-blanket': {
    name: 'Chunky Knit Throw Blanket',
    url: 'https://www.target.com/throw-blanket?ref=YOUR_AFFILIATE_ID',
    keywords: ['throw blanket', 'knit blanket', 'cozy blanket', 'decorative blanket', 'accent blanket'],
    category: 'Bedroom',
    price: '$49'
  },
  
  'memory-foam-pillow': {
    name: 'Memory Foam Pillow Set',
    url: 'https://www.amazon.com/memory-foam-pillow?tag=YOUR_AFFILIATE_TAG',
    keywords: ['memory foam pillow', 'contour pillow', 'neck support pillow', 'ergonomic pillow'],
    category: 'Bedroom',
    price: '$69'
  },
  
  'down-pillow': {
    name: 'Down Alternative Pillow',
    url: 'https://www.wayfair.com/bed-bath/pillows?refid=YOUR_AFFILIATE_ID',
    keywords: ['down pillow', 'feather pillow', 'soft pillow', 'fluffy pillow', 'plush pillow'],
    category: 'Bedroom',
    price: '$59'
  },
  
  'decorative-pillows': {
    name: 'Decorative Throw Pillows Set',
    url: 'https://www.target.com/decorative-pillows?ref=YOUR_AFFILIATE_ID',
    keywords: ['decorative pillows', 'throw pillows', 'accent pillows', 'cushions', 'bed pillows'],
    category: 'Bedroom',
    price: '$39'
  },
  
  'blackout-curtains': {
    name: 'Blackout Curtains',
    url: 'https://www.wayfair.com/decor-pillows/blackout-curtains?refid=YOUR_AFFILIATE_ID',
    keywords: ['blackout curtains', 'room darkening curtains', 'thermal curtains', 'light blocking drapes'],
    category: 'Bedroom',
    price: '$79'
  },
  
  'sheer-curtains': {
    name: 'Sheer White Curtains',
    url: 'https://www.amazon.com/sheer-curtains?tag=YOUR_AFFILIATE_TAG',
    keywords: ['sheer curtains', 'white curtains', 'light curtains', 'airy curtains', 'voile curtains'],
    category: 'Bedroom',
    price: '$39'
  },
  
  'curtain-rod': {
    name: 'Modern Curtain Rod',
    url: 'https://www.target.com/curtain-rod?ref=YOUR_AFFILIATE_ID',
    keywords: ['curtain rod', 'drapery rod', 'window rod', 'adjustable curtain rod', 'curtain hardware'],
    category: 'Bedroom',
    price: '$29'
  },
  
  'wardrobe-closet': {
    name: 'Portable Wardrobe Closet',
    url: 'https://www.amazon.com/wardrobe-closet?tag=YOUR_AFFILIATE_TAG',
    keywords: ['wardrobe', 'portable closet', 'clothes storage', 'wardrobe closet', 'armoire'],
    category: 'Bedroom',
    price: '$199'
  },
  
  'closet-organizer': {
    name: 'Closet Organization System',
    url: 'https://www.wayfair.com/storage-organization/closet-organizers?refid=YOUR_AFFILIATE_ID',
    keywords: ['closet organizer', 'closet system', 'wardrobe organizer', 'closet storage'],
    category: 'Bedroom',
    price: '$299'
  },
  
  'shoe-rack': {
    name: 'Modern Shoe Rack',
    url: 'https://www.ikea.com/shoe-rack?affiliate=YOUR_AFFILIATE_ID',
    keywords: ['shoe rack', 'shoe storage', 'shoe organizer', 'shoe shelf', 'entryway shoe rack'],
    category: 'Bedroom',
    price: '$49'
  },
  
  'jewelry-organizer': {
    name: 'Jewelry Organizer Box',
    url: 'https://www.amazon.com/jewelry-organizer?tag=YOUR_AFFILIATE_TAG',
    keywords: ['jewelry organizer', 'jewelry box', 'jewelry storage', 'jewelry holder'],
    category: 'Bedroom',
    price: '$39'
  },
  
  // ============================================
  // DINING ROOM FURNITURE (20 products)
  // ============================================
  
  'dining-table-modern': {
    name: 'Modern Dining Table',
    url: 'https://www.wayfair.com/furniture/dining-tables?refid=YOUR_AFFILIATE_ID',
    keywords: ['dining table', 'modern dining table', 'kitchen table', 'dinner table', 'dining room table'],
    category: 'Dining Room',
    price: '$799'
  },
  
  'round-dining-table': {
    name: 'Round Dining Table',
    url: 'https://www.westelm.com/round-dining-table?cm_sp=YOUR_AFFILIATE_ID',
    keywords: ['round dining table', 'circular dining table', 'round kitchen table', 'pedestal table'],
    category: 'Dining Room',
    price: '$899'
  },
  
  'extendable-dining-table': {
    name: 'Extendable Dining Table',
    url: 'https://www.ikea.com/extendable-table?affiliate=YOUR_AFFILIATE_ID',
    keywords: ['extendable dining table', 'expandable table', 'drop-leaf table', 'extension table'],
    category: 'Dining Room',
    price: '$699'
  },
  
  'marble-dining-table': {
    name: 'Marble Top Dining Table',
    url: 'https://www.wayfair.com/furniture/marble-dining-table?refid=YOUR_AFFILIATE_ID',
    keywords: ['marble dining table', 'marble table', 'stone top table', 'luxury dining table'],
    category: 'Dining Room',
    price: '$1,299'
  },
  
  'dining-chairs-set': {
    name: 'Modern Dining Chairs Set of 4',
    url: 'https://www.wayfair.com/furniture/dining-chairs?refid=YOUR_AFFILIATE_ID',
    keywords: ['dining chairs', 'modern dining chairs', 'kitchen chairs', 'upholstered dining chairs'],
    category: 'Dining Room',
    price: '$599'
  },
  
  'velvet-dining-chairs': {
    name: 'Velvet Dining Chairs',
    url: 'https://www.target.com/velvet-dining-chairs?ref=YOUR_AFFILIATE_ID',
    keywords: ['velvet dining chairs', 'luxury dining chairs', 'plush dining chairs', 'soft dining chairs'],
    category: 'Dining Room',
    price: '$699'
  },
  
  'leather-dining-chairs': {
    name: 'Leather Dining Chairs',
    url: 'https://www.westelm.com/dining-chairs?cm_sp=YOUR_AFFILIATE_ID',
    keywords: ['leather dining chairs', 'leather chairs', 'faux leather chairs', 'modern leather chairs'],
    category: 'Dining Room',
    price: '$799'
  },
  
  'dining-bench': {
    name: 'Upholstered Dining Bench',
    url: 'https://www.wayfair.com/furniture/dining-benches?refid=YOUR_AFFILIATE_ID',
    keywords: ['dining bench', 'upholstered bench', 'kitchen bench', 'dining room bench'],
    category: 'Dining Room',
    price: '$299'
  },
  
  'bar-stools-modern': {
    name: 'Modern Bar Stools Set',
    url: 'https://www.wayfair.com/furniture/bar-stools?refid=YOUR_AFFILIATE_ID',
    keywords: ['bar stools', 'counter stools', 'kitchen stools', 'modern bar stools', 'bar chairs'],
    category: 'Dining Room',
    price: '$399'
  },
  
  'counter-stools': {
    name: 'Counter Height Stools',
    url: 'https://www.target.com/counter-stools?ref=YOUR_AFFILIATE_ID',
    keywords: ['counter stools', 'counter height stools', 'kitchen island stools', 'breakfast bar stools'],
    category: 'Dining Room',
    price: '$349'
  },
  
  'sideboard-buffet': {
    name: 'Modern Sideboard Buffet',
    url: 'https://www.westelm.com/sideboard?cm_sp=YOUR_AFFILIATE_ID',
    keywords: ['sideboard', 'buffet cabinet', 'dining room storage', 'credenza', 'server cabinet'],
    category: 'Dining Room',
    price: '$899'
  },
  
  'china-cabinet': {
    name: 'Glass Door China Cabinet',
    url: 'https://www.wayfair.com/furniture/china-cabinets?refid=YOUR_AFFILIATE_ID',
    keywords: ['china cabinet', 'display cabinet', 'curio cabinet', 'glass cabinet', 'hutch'],
    category: 'Dining Room',
    price: '$799'
  },
  
  'bar-cart': {
    name: 'Modern Bar Cart',
    url: 'https://www.target.com/bar-cart?ref=YOUR_AFFILIATE_ID',
    keywords: ['bar cart', 'drinks cart', 'rolling bar cart', 'beverage cart', 'serving cart'],
    category: 'Dining Room',
    price: '$199'
  },
  
  'wine-rack': {
    name: 'Wall-Mounted Wine Rack',
    url: 'https://www.wayfair.com/storage-organization/wine-racks?refid=YOUR_AFFILIATE_ID',
    keywords: ['wine rack', 'wine storage', 'wall wine rack', 'wine holder', 'bottle holder'],
    category: 'Dining Room',
    price: '$149'
  },
  
  'chandelier-modern': {
    name: 'Modern Chandelier',
    url: 'https://www.wayfair.com/lighting/chandeliers?refid=YOUR_AFFILIATE_ID',
    keywords: ['chandelier', 'modern chandelier', 'dining room chandelier', 'pendant chandelier'],
    category: 'Dining Room',
    price: '$399'
  },
  
  'pendant-lights-set': {
    name: 'Pendant Lights Set of 3',
    url: 'https://www.westelm.com/pendant-lights?cm_sp=YOUR_AFFILIATE_ID',
    keywords: ['pendant lights', 'hanging lights', 'kitchen pendant lights', 'island lights'],
    category: 'Dining Room',
    price: '$299'
  },
  
  'dining-table-runner': {
    name: 'Modern Table Runner',
    url: 'https://www.target.com/table-runner?ref=YOUR_AFFILIATE_ID',
    keywords: ['table runner', 'dining table runner', 'modern table runner', 'table decor'],
    category: 'Dining Room',
    price: '$29'
  },
  
  'placemats-set': {
    name: 'Placemats Set of 6',
    url: 'https://www.amazon.com/placemats?tag=YOUR_AFFILIATE_TAG',
    keywords: ['placemats', 'table placemats', 'dining placemats', 'table mats'],
    category: 'Dining Room',
    price: '$39'
  },
  
  'dinnerware-set': {
    name: 'Modern Dinnerware Set',
    url: 'https://www.wayfair.com/kitchen-tabletop/dinnerware-sets?refid=YOUR_AFFILIATE_ID',
    keywords: ['dinnerware set', 'dish set', 'plate set', 'dinner plates', 'modern dinnerware'],
    category: 'Dining Room',
    price: '$149'
  },
  
  'flatware-set': {
    name: 'Stainless Steel Flatware Set',
    url: 'https://www.amazon.com/flatware-set?tag=YOUR_AFFILIATE_TAG',
    keywords: ['flatware set', 'silverware set', 'cutlery set', 'utensil set', 'modern flatware'],
    category: 'Dining Room',
    price: '$79'
  },
  
  // ============================================
  // HOME OFFICE FURNITURE (20 products)
  // ============================================
  
  'standing-desk': {
    name: 'Adjustable Standing Desk',
    url: 'https://www.amazon.com/standing-desk?tag=YOUR_AFFILIATE_TAG',
    keywords: ['standing desk', 'adjustable desk', 'sit-stand desk', 'height adjustable desk'],
    category: 'Home Office',
    price: '$399'
  },
  
  'modern-desk': {
    name: 'Modern Computer Desk',
    url: 'https://www.wayfair.com/furniture/desks?refid=YOUR_AFFILIATE_ID',
    keywords: ['computer desk', 'modern desk', 'writing desk', 'home office desk', 'work desk'],
    category: 'Home Office',
    price: '$299'
  },
  
  'l-shaped-desk': {
    name: 'L-Shaped Corner Desk',
    url: 'https://www.ikea.com/corner-desk?affiliate=YOUR_AFFILIATE_ID',
    keywords: ['l-shaped desk', 'corner desk', 'l desk', 'gaming desk', 'large desk'],
    category: 'Home Office',
    price: '$449'
  },
  
  'executive-desk': {
    name: 'Executive Office Desk',
    url: 'https://www.wayfair.com/furniture/executive-desks?refid=YOUR_AFFILIATE_ID',
    keywords: ['executive desk', 'large desk', 'office desk', 'professional desk', 'manager desk'],
    category: 'Home Office',
    price: '$799'
  },
  
  'writing-desk': {
    name: 'Mid-Century Writing Desk',
    url: 'https://www.westelm.com/writing-desk?cm_sp=YOUR_AFFILIATE_ID',
    keywords: ['writing desk', 'small desk', 'compact desk', 'secretary desk', 'narrow desk'],
    category: 'Home Office',
    price: '$399'
  },
  
  'ergonomic-chair': {
    name: 'Ergonomic Office Chair',
    url: 'https://www.amazon.com/office-chair?tag=YOUR_AFFILIATE_TAG',
    keywords: ['ergonomic chair', 'office chair', 'desk chair', 'computer chair', 'task chair'],
    category: 'Home Office',
    price: '$299'
  },
  
  'executive-chair': {
    name: 'Leather Executive Chair',
    url: 'https://www.wayfair.com/furniture/office-chairs?refid=YOUR_AFFILIATE_ID',
    keywords: ['executive chair', 'leather office chair', 'high back chair', 'boss chair'],
    category: 'Home Office',
    price: '$499'
  },
  
  'gaming-chair': {
    name: 'Gaming Chair',
    url: 'https://www.amazon.com/gaming-chair?tag=YOUR_AFFILIATE_TAG',
    keywords: ['gaming chair', 'racing chair', 'pc gaming chair', 'gamer chair'],
    category: 'Home Office',
    price: '$249'
  },
  
  'mesh-chair': {
    name: 'Mesh Office Chair',
    url: 'https://www.target.com/mesh-chair?ref=YOUR_AFFILIATE_ID',
    keywords: ['mesh chair', 'breathable chair', 'mesh back chair', 'ventilated chair'],
    category: 'Home Office',
    price: '$199'
  },
  
  'filing-cabinet': {
    name: '3-Drawer Filing Cabinet',
    url: 'https://www.wayfair.com/storage-organization/filing-cabinets?refid=YOUR_AFFILIATE_ID',
    keywords: ['filing cabinet', 'file cabinet', 'office storage', 'document storage', 'file drawer'],
    category: 'Home Office',
    price: '$199'
  },
  
  'bookshelf-office': {
    name: '5-Tier Bookshelf',
    url: 'https://www.amazon.com/bookshelf?tag=YOUR_AFFILIATE_TAG',
    keywords: ['bookshelf', 'office bookshelf', '5-tier shelf', 'storage shelf', 'book storage'],
    category: 'Home Office',
    price: '$149'
  },
  
  'desk-organizer': {
    name: 'Desktop Organizer Set',
    url: 'https://www.target.com/desk-organizer?ref=YOUR_AFFILIATE_ID',
    keywords: ['desk organizer', 'desktop organizer', 'office organizer', 'desk accessories'],
    category: 'Home Office',
    price: '$39'
  },
  
  'monitor-stand': {
    name: 'Monitor Stand with Storage',
    url: 'https://www.amazon.com/monitor-stand?tag=YOUR_AFFILIATE_TAG',
    keywords: ['monitor stand', 'computer stand', 'desk riser', 'monitor riser'],
    category: 'Home Office',
    price: '$49'
  },
  
  'desk-lamp-led': {
    name: 'LED Desk Lamp',
    url: 'https://www.wayfair.com/lighting/desk-lamps?refid=YOUR_AFFILIATE_ID',
    keywords: ['desk lamp', 'led desk lamp', 'task lamp', 'reading lamp', 'study lamp'],
    category: 'Home Office',
    price: '$59'
  },
  
  'cable-management': {
    name: 'Cable Management Box',
    url: 'https://www.amazon.com/cable-management?tag=YOUR_AFFILIATE_TAG',
    keywords: ['cable management', 'cord organizer', 'cable box', 'wire management'],
    category: 'Home Office',
    price: '$29'
  },
  
  'desk-mat': {
    name: 'Large Desk Mat',
    url: 'https://www.amazon.com/desk-mat?tag=YOUR_AFFILIATE_TAG',
    keywords: ['desk mat', 'desk pad', 'mouse pad', 'desk protector', 'large mouse pad'],
    category: 'Home Office',
    price: '$25'
  },
  
  'whiteboard': {
    name: 'Wall-Mounted Whiteboard',
    url: 'https://www.amazon.com/whiteboard?tag=YOUR_AFFILIATE_TAG',
    keywords: ['whiteboard', 'dry erase board', 'wall whiteboard', 'office board'],
    category: 'Home Office',
    price: '$49'
  },
  
  'bulletin-board': {
    name: 'Cork Bulletin Board',
    url: 'https://www.target.com/bulletin-board?ref=YOUR_AFFILIATE_ID',
    keywords: ['bulletin board', 'cork board', 'pin board', 'notice board', 'message board'],
    category: 'Home Office',
    price: '$29'
  },
  
  'printer-stand': {
    name: 'Mobile Printer Stand',
    url: 'https://www.amazon.com/printer-stand?tag=YOUR_AFFILIATE_TAG',
    keywords: ['printer stand', 'printer cart', 'printer table', 'mobile printer stand'],
    category: 'Home Office',
    price: '$79'
  },
  
  'bookends-modern': {
    name: 'Modern Bookends Set',
    url: 'https://www.target.com/bookends?ref=YOUR_AFFILIATE_ID',
    keywords: ['bookends', 'metal bookends', 'decorative bookends', 'modern bookends'],
    category: 'Home Office',
    price: '$25'
  },
  
  // ============================================
  // WALL DECOR & ART (15 products)
  // ============================================
  
  'canvas-wall-art': {
    name: 'Abstract Canvas Wall Art',
    url: 'https://www.amazon.com/canvas-wall-art?tag=YOUR_AFFILIATE_TAG',
    keywords: ['canvas wall art', 'wall art', 'canvas print', 'abstract art', 'modern art'],
    category: 'Wall Decor',
    price: '$79'
  },
  
  'framed-prints-set': {
    name: 'Framed Art Prints Set of 3',
    url: 'https://www.wayfair.com/decor-pillows/framed-art?refid=YOUR_AFFILIATE_ID',
    keywords: ['framed prints', 'wall art set', 'framed art', 'gallery wall', 'art prints'],
    category: 'Wall Decor',
    price: '$129'
  },
  
  'metal-wall-art': {
    name: 'Modern Metal Wall Art',
    url: 'https://www.wayfair.com/decor-pillows/metal-wall-art?refid=YOUR_AFFILIATE_ID',
    keywords: ['metal wall art', 'metal sculpture', 'wall sculpture', '3d wall art'],
    category: 'Wall Decor',
    price: '$99'
  },
  
  'gallery-wall-frames': {
    name: 'Gallery Wall Frame Set',
    url: 'https://www.amazon.com/picture-frames?tag=YOUR_AFFILIATE_TAG',
    keywords: ['gallery wall frames', 'picture frames', 'photo frames', 'frame set', 'wall frames'],
    category: 'Wall Decor',
    price: '$59'
  },
  
  'floating-shelves': {
    name: 'Floating Wall Shelves Set',
    url: 'https://www.target.com/floating-shelves?ref=YOUR_AFFILIATE_ID',
    keywords: ['floating shelves', 'wall shelves', 'display shelves', 'floating shelf set'],
    category: 'Wall Decor',
    price: '$49'
  },
  
  'macrame-wall-hanging': {
    name: 'Macrame Wall Hanging',
    url: 'https://www.amazon.com/macrame-wall-hanging?tag=YOUR_AFFILIATE_TAG',
    keywords: ['macrame wall hanging', 'boho wall decor', 'macrame art', 'wall tapestry'],
    category: 'Wall Decor',
    price: '$39'
  },
  
  'wall-clock-modern': {
    name: 'Modern Wall Clock',
    url: 'https://www.wayfair.com/decor-pillows/wall-clocks?refid=YOUR_AFFILIATE_ID',
    keywords: ['wall clock', 'modern clock', 'large wall clock', 'decorative clock'],
    category: 'Wall Decor',
    price: '$69'
  },
  
  'wall-sconces': {
    name: 'Modern Wall Sconces Pair',
    url: 'https://www.wayfair.com/lighting/wall-sconces?refid=YOUR_AFFILIATE_ID',
    keywords: ['wall sconces', 'wall lights', 'wall lamps', 'sconce lighting'],
    category: 'Wall Decor',
    price: '$149'
  },
  
  'neon-sign': {
    name: 'Custom LED Neon Sign',
    url: 'https://www.amazon.com/neon-sign?tag=YOUR_AFFILIATE_TAG',
    keywords: ['neon sign', 'led neon sign', 'wall neon light', 'neon decor'],
    category: 'Wall Decor',
    price: '$89'
  },
  
  'wall-decals': {
    name: 'Removable Wall Decals',
    url: 'https://www.amazon.com/wall-decals?tag=YOUR_AFFILIATE_TAG',
    keywords: ['wall decals', 'wall stickers', 'vinyl decals', 'removable decals'],
    category: 'Wall Decor',
    price: '$19'
  },
  
  'wall-planters': {
    name: 'Hanging Wall Planters Set',
    url: 'https://www.target.com/wall-planters?ref=YOUR_AFFILIATE_ID',
    keywords: ['wall planters', 'hanging planters', 'wall plant holders', 'vertical garden'],
    category: 'Wall Decor',
    price: '$45'
  },
  
  'peel-and-stick-wallpaper': {
    name: 'Peel and Stick Wallpaper',
    url: 'https://www.amazon.com/peel-stick-wallpaper?tag=YOUR_AFFILIATE_TAG',
    keywords: ['peel and stick wallpaper', 'removable wallpaper', 'temporary wallpaper', 'wall covering'],
    category: 'Wall Decor',
    price: '$39'
  },
  
  'accent-wall-panels': {
    name: '3D Wall Panels',
    url: 'https://www.wayfair.com/home-improvement/wall-panels?refid=YOUR_AFFILIATE_ID',
    keywords: ['wall panels', '3d wall panels', 'textured wall panels', 'accent wall'],
    category: 'Wall Decor',
    price: '$129'
  },
  
  'wall-hooks-decorative': {
    name: 'Decorative Wall Hooks Set',
    url: 'https://www.target.com/wall-hooks?ref=YOUR_AFFILIATE_ID',
    keywords: ['wall hooks', 'coat hooks', 'decorative hooks', 'entryway hooks'],
    category: 'Wall Decor',
    price: '$29'
  },
  
  'pegboard-wall': {
    name: 'Modern Pegboard Set',
    url: 'https://www.ikea.com/pegboard?affiliate=YOUR_AFFILIATE_ID',
    keywords: ['pegboard', 'wall organizer', 'pegboard wall', 'storage board'],
    category: 'Wall Decor',
    price: '$39'
  },
  
  // ============================================
  // LIGHTING (15 products)
  // ============================================
  
  'ceiling-light-modern': {
    name: 'Modern Ceiling Light',
    url: 'https://www.wayfair.com/lighting/ceiling-lights?refid=YOUR_AFFILIATE_ID',
    keywords: ['ceiling light', 'flush mount light', 'ceiling fixture', 'overhead light'],
    category: 'Lighting',
    price: '$129'
  },
  
  'smart-bulbs': {
    name: 'Smart LED Bulbs 4-Pack',
    url: 'https://www.amazon.com/smart-bulbs?tag=YOUR_AFFILIATE_TAG',
    keywords: ['smart bulbs', 'led smart bulbs', 'wifi bulbs', 'color changing bulbs'],
    category: 'Lighting',
    price: '$49'
  },
  
  'led-strip-lights': {
    name: 'LED Strip Lights',
    url: 'https://www.amazon.com/led-strip-lights?tag=YOUR_AFFILIATE_TAG',
    keywords: ['led strip lights', 'rgb led strips', 'accent lighting', 'under cabinet lighting'],
    category: 'Lighting',
    price: '$29'
  },
  
  'track-lighting': {
    name: 'Modern Track Lighting Kit',
    url: 'https://www.wayfair.com/lighting/track-lighting?refid=YOUR_AFFILIATE_ID',
    keywords: ['track lighting', 'adjustable lights', 'ceiling track lights', 'directional lighting'],
    category: 'Lighting',
    price: '$199'
  },
  
  'recessed-lighting': {
    name: 'LED Recessed Lighting Set',
    url: 'https://www.amazon.com/recessed-lighting?tag=YOUR_AFFILIATE_TAG',
    keywords: ['recessed lighting', 'can lights', 'downlights', 'ceiling recessed lights'],
    category: 'Lighting',
    price: '$89'
  },
  
  'string-lights': {
    name: 'Fairy String Lights',
    url: 'https://www.amazon.com/string-lights?tag=YOUR_AFFILIATE_TAG',
    keywords: ['string lights', 'fairy lights', 'twinkle lights', 'decorative lights'],
    category: 'Lighting',
    price: '$19'
  },
  
  'globe-string-lights': {
    name: 'Globe String Lights',
    url: 'https://www.target.com/globe-lights?ref=YOUR_AFFILIATE_ID',
    keywords: ['globe lights', 'bistro lights', 'cafe lights', 'patio string lights'],
    category: 'Lighting',
    price: '$35'
  },
  
  'torchiere-lamp': {
    name: 'LED Torchiere Floor Lamp',
    url: 'https://www.wayfair.com/lighting/torchiere-lamps?refid=YOUR_AFFILIATE_ID',
    keywords: ['torchiere lamp', 'uplight floor lamp', 'tall floor lamp', 'corner lamp'],
    category: 'Lighting',
    price: '$89'
  },
  
  'reading-lamp': {
    name: 'Adjustable Reading Lamp',
    url: 'https://www.amazon.com/reading-lamp?tag=YOUR_AFFILIATE_TAG',
    keywords: ['reading lamp', 'book light', 'adjustable lamp', 'gooseneck lamp'],
    category: 'Lighting',
    price: '$45'
  },
  
  'salt-lamp': {
    name: 'Himalayan Salt Lamp',
    url: 'https://www.amazon.com/salt-lamp?tag=YOUR_AFFILIATE_TAG',
    keywords: ['salt lamp', 'himalayan salt lamp', 'pink salt lamp', 'natural lamp'],
    category: 'Lighting',
    price: '$29'
  },
  
  'sunset-lamp': {
    name: 'Sunset Projection Lamp',
    url: 'https://www.amazon.com/sunset-lamp?tag=YOUR_AFFILIATE_TAG',
    keywords: ['sunset lamp', 'projection lamp', 'sunset light', 'mood lighting'],
    category: 'Lighting',
    price: '$39'
  },
  
  'under-cabinet-lights': {
    name: 'Under Cabinet LED Lights',
    url: 'https://www.amazon.com/under-cabinet-lights?tag=YOUR_AFFILIATE_TAG',
    keywords: ['under cabinet lights', 'kitchen counter lights', 'cabinet lighting', 'puck lights'],
    category: 'Lighting',
    price: '$49'
  },
  
  'dimmer-switch': {
    name: 'Smart Dimmer Switch',
    url: 'https://www.amazon.com/dimmer-switch?tag=YOUR_AFFILIATE_TAG',
    keywords: ['dimmer switch', 'light dimmer', 'smart dimmer', 'wifi dimmer switch'],
    category: 'Lighting',
    price: '$39'
  },
  
  'night-light': {
    name: 'Motion Sensor Night Light',
    url: 'https://www.amazon.com/night-light?tag=YOUR_AFFILIATE_TAG',
    keywords: ['night light', 'motion sensor light', 'plug-in night light', 'hallway light'],
    category: 'Lighting',
    price: '$19'
  },
  
  'grow-lights': {
    name: 'LED Plant Grow Lights',
    url: 'https://www.amazon.com/grow-lights?tag=YOUR_AFFILIATE_TAG',
    keywords: ['grow lights', 'plant lights', 'led grow lights', 'indoor plant lights'],
    category: 'Lighting',
    price: '$45'
  },
  
  // ============================================
  // DECORATIVE ACCESSORIES (15 products)
  // ============================================
  
  'throw-pillows-set': {
    name: 'Decorative Throw Pillows 4-Pack',
    url: 'https://www.target.com/throw-pillows?ref=YOUR_AFFILIATE_ID',
    keywords: ['throw pillows', 'decorative pillows', 'accent pillows', 'couch pillows', 'sofa pillows'],
    category: 'Decor Accessories',
    price: '$59'
  },
  
  'velvet-pillows': {
    name: 'Velvet Throw Pillows Set',
    url: 'https://www.westelm.com/throw-pillows?cm_sp=YOUR_AFFILIATE_ID',
    keywords: ['velvet pillows', 'luxury pillows', 'plush pillows', 'velvet cushions'],
    category: 'Decor Accessories',
    price: '$79'
  },
  
  'lumbar-pillows': {
    name: 'Lumbar Support Pillows',
    url: 'https://www.target.com/lumbar-pillows?ref=YOUR_AFFILIATE_ID',
    keywords: ['lumbar pillows', 'long pillows', 'rectangular pillows', 'accent pillows'],
    category: 'Decor Accessories',
    price: '$39'
  },
  
  'decorative-vases': {
    name: 'Modern Ceramic Vases Set',
    url: 'https://www.target.com/vases?ref=YOUR_AFFILIATE_ID',
    keywords: ['vases', 'decorative vases', 'ceramic vases', 'flower vases', 'table vases'],
    category: 'Decor Accessories',
    price: '$45'
  },
  
  'glass-vase': {
    name: 'Large Glass Vase',
    url: 'https://www.wayfair.com/decor-pillows/vases?refid=YOUR_AFFILIATE_ID',
    keywords: ['glass vase', 'clear vase', 'modern vase', 'tall vase', 'floor vase'],
    category: 'Decor Accessories',
    price: '$69'
  },
  
  'artificial-plants': {
    name: 'Faux Plants Set',
    url: 'https://www.amazon.com/artificial-plants?tag=YOUR_AFFILIATE_TAG',
    keywords: ['artificial plants', 'faux plants', 'fake plants', 'indoor plants', 'decorative plants'],
    category: 'Decor Accessories',
    price: '$39'
  },
  
  'fiddle-leaf-fig': {
    name: 'Faux Fiddle Leaf Fig Tree',
    url: 'https://www.target.com/faux-tree?ref=YOUR_AFFILIATE_ID',
    keywords: ['fiddle leaf fig', 'faux tree', 'artificial tree', 'fake fiddle leaf fig'],
    category: 'Decor Accessories',
    price: '$89'
  },
  
  'plant-pots': {
    name: 'Modern Plant Pots Set',
    url: 'https://www.amazon.com/plant-pots?tag=YOUR_AFFILIATE_TAG',
    keywords: ['plant pots', 'planters', 'flower pots', 'ceramic pots', 'indoor planters'],
    category: 'Decor Accessories',
    price: '$35'
  },
  
  'plant-stand': {
    name: 'Mid-Century Plant Stand',
    url: 'https://www.wayfair.com/outdoor/plant-stands?refid=YOUR_AFFILIATE_ID',
    keywords: ['plant stand', 'planter stand', 'flower stand', 'tall plant stand'],
    category: 'Decor Accessories',
    price: '$59'
  },
  
  'candles-set': {
    name: 'Scented Candles Gift Set',
    url: 'https://www.target.com/candles?ref=YOUR_AFFILIATE_ID',
    keywords: ['candles', 'scented candles', 'decorative candles', 'candle set', 'home fragrance'],
    category: 'Decor Accessories',
    price: '$39'
  },
  
  'candle-holders': {
    name: 'Modern Candle Holders Set',
    url: 'https://www.wayfair.com/decor-pillows/candle-holders?refid=YOUR_AFFILIATE_ID',
    keywords: ['candle holders', 'candlesticks', 'taper holders', 'decorative holders'],
    category: 'Decor Accessories',
    price: '$49'
  },
  
  'decorative-tray': {
    name: 'Ottoman Coffee Table Tray',
    url: 'https://www.target.com/decorative-tray?ref=YOUR_AFFILIATE_ID',
    keywords: ['decorative tray', 'coffee table tray', 'ottoman tray', 'serving tray'],
    category: 'Decor Accessories',
    price: '$35'
  },
  
  'decorative-bowls': {
    name: 'Ceramic Decorative Bowls',
    url: 'https://www.wayfair.com/decor-pillows/decorative-bowls?refid=YOUR_AFFILIATE_ID',
    keywords: ['decorative bowls', 'ceramic bowls', 'centerpiece bowls', 'accent bowls'],
    category: 'Decor Accessories',
    price: '$45'
  },
  
  'coffee-table-books': {
    name: 'Coffee Table Books Set',
    url: 'https://www.amazon.com/coffee-table-books?tag=YOUR_AFFILIATE_TAG',
    keywords: ['coffee table books', 'decorative books', 'design books', 'art books'],
    category: 'Decor Accessories',
    price: '$59'
  },
  
  'decorative-objects': {
    name: 'Modern Sculpture Decor Set',
    url: 'https://www.westelm.com/decorative-objects?cm_sp=YOUR_AFFILIATE_ID',
    keywords: ['decorative objects', 'sculptures', 'modern decor', 'accent pieces', 'bookshelf decor'],
    category: 'Decor Accessories',
    price: '$79'
  },
  
  // ============================================
  // STORAGE & ORGANIZATION (10 products)
  // ============================================
  
  'storage-baskets': {
    name: 'Woven Storage Baskets Set',
    url: 'https://www.target.com/storage-baskets?ref=YOUR_AFFILIATE_ID',
    keywords: ['storage baskets', 'woven baskets', 'organizing baskets', 'decorative baskets'],
    category: 'Storage',
    price: '$49'
  },
  
  'cube-storage': {
    name: 'Cube Storage Organizer',
    url: 'https://www.target.com/cube-storage?ref=YOUR_AFFILIATE_ID',
    keywords: ['cube storage', 'cubby organizer', 'storage cubes', 'modular storage'],
    category: 'Storage',
    price: '$79'
  },
  
  'storage-bins': {
    name: 'Fabric Storage Bins Set',
    url: 'https://www.amazon.com/storage-bins?tag=YOUR_AFFILIATE_TAG',
    keywords: ['storage bins', 'fabric bins', 'collapsible bins', 'storage boxes'],
    category: 'Storage',
    price: '$29'
  },
  
  'under-bed-storage': {
    name: 'Under Bed Storage Containers',
    url: 'https://www.amazon.com/under-bed-storage?tag=YOUR_AFFILIATE_TAG',
    keywords: ['under bed storage', 'bed storage boxes', 'rolling storage', 'underbed bins'],
    category: 'Storage',
    price: '$39'
  },
  
  'over-door-organizer': {
    name: 'Over-the-Door Organizer',
    url: 'https://www.amazon.com/over-door-organizer?tag=YOUR_AFFILIATE_TAG',
    keywords: ['over door organizer', 'door storage', 'hanging organizer', 'door rack'],
    category: 'Storage',
    price: '$25'
  },
  
  'drawer-organizers': {
    name: 'Drawer Divider Set',
    url: 'https://www.amazon.com/drawer-organizers?tag=YOUR_AFFILIATE_TAG',
    keywords: ['drawer organizers', 'drawer dividers', 'drawer inserts', 'organizer trays'],
    category: 'Storage',
    price: '$29'
  },
  
  'storage-trunk': {
    name: 'Vintage Storage Trunk',
    url: 'https://www.wayfair.com/storage-organization/storage-trunks?refid=YOUR_AFFILIATE_ID',
    keywords: ['storage trunk', 'decorative trunk', 'coffee table trunk', 'storage chest'],
    category: 'Storage',
    price: '$149'
  },
  
  'coat-rack': {
    name: 'Modern Coat Rack Stand',
    url: 'https://www.amazon.com/coat-rack?tag=YOUR_AFFILIATE_TAG',
    keywords: ['coat rack', 'coat stand', 'hall tree', 'entryway rack', 'jacket stand'],
    category: 'Storage',
    price: '$69'
  },
  
  'laundry-hamper': {
    name: 'Modern Laundry Hamper',
    url: 'https://www.target.com/laundry-hamper?ref=YOUR_AFFILIATE_ID',
    keywords: ['laundry hamper', 'laundry basket', 'clothes hamper', 'dirty clothes basket'],
    category: 'Storage',
    price: '$39'
  },
  
  'magazine-rack': {
    name: 'Modern Magazine Rack',
    url: 'https://www.wayfair.com/storage-organization/magazine-racks?refid=YOUR_AFFILIATE_ID',
    keywords: ['magazine rack', 'magazine holder', 'book rack', 'reading rack'],
    category: 'Storage',
    price: '$45'
  }
  
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get products by category
window.getProductsByCategory = function(category) {
  return Object.entries(window.AFFILIATE_PRODUCTS)
    .filter(([id, product]) => product.category === category)
    .reduce((obj, [id, product]) => {
      obj[id] = product;
      return obj;
    }, {});
};

// Get all categories
window.getAllCategories = function() {
  const categories = new Set();
  Object.values(window.AFFILIATE_PRODUCTS).forEach(product => {
    categories.add(product.category);
  });
  return Array.from(categories).sort();
};

// Search products by keyword
window.searchProducts = function(searchTerm) {
  const term = searchTerm.toLowerCase();
  return Object.entries(window.AFFILIATE_PRODUCTS)
    .filter(([id, product]) => {
      return product.name.toLowerCase().includes(term) ||
             product.keywords.some(keyword => keyword.toLowerCase().includes(term)) ||
             product.category.toLowerCase().includes(term);
    })
    .reduce((obj, [id, product]) => {
      obj[id] = product;
      return obj;
    }, {});
};
