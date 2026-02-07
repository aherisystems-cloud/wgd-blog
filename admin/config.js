// Configuration for AI Blog Editor - Wow Glam Decor
// IMPORTANT: This file contains sensitive API keys!
// Add this file to .gitignore before committing to GitHub

window.ENV = {
  // ===========================================
  // GROQ API CONFIGURATION
  // ===========================================
  // Get your free API key from: https://console.groq.com/keys
  // 1. Sign up at console.groq.com
  // 2. Navigate to "API Keys"
  // 3. Click "Create API Key"
  // 4. Copy the key and paste below
  GROQ_API_KEY: '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',
  
  // Model Selection:
  // - 'llama-3.3-70b-versatile' (RECOMMENDED - Best quality, fast, 128K tokens)
  // - 'llama-3.1-70b-versatile' (Very fast, very good quality, 128K tokens)
  // - 'mixtral-8x7b-32768' (Extremely fast, good quality, 32K tokens)
  // - 'llama-3.1-8b-instant' (Lightning fast, decent quality, 128K tokens)
  GROQ_MODEL: 'llama-3.3-70b-versatile',
  
  // ===========================================
  // N8N WEBHOOK CONFIGURATION
  // ===========================================
  // Your n8n webhook URL for publishing blog posts
  // Format: https://your-instance.app.n8n.cloud/webhook/publish-blog
  // Or for local testing: http://localhost:5678/webhook/publish-blog
  N8N_WEBHOOK_URL: 'http://localhost:5678/webhook/publish-blog',
  
  // ===========================================
  // OPTIONAL: ANTHROPIC API (Alternative AI)
  // ===========================================
  // If you want to use Claude instead of Groq, uncomment and add your key:
  // ANTHROPIC_API_KEY: 'sk-ant-YOUR_KEY_HERE',
  // AI_PROVIDER: 'groq' // Options: 'groq' or 'anthropic'
};

// ===========================================
// SETUP INSTRUCTIONS
// ===========================================
/*

STEP 1: Get Groq API Key
   1. Visit: https://console.groq.com/keys
   2. Sign up for free account
   3. Create API key
   4. Copy key (starts with 'gsk_')
   5. Replace 'YOUR_GROQ_API_KEY_HERE' above

STEP 2: Get n8n Webhook URL
   1. Set up n8n workflow (see setup guide)
   2. Copy webhook URL from n8n
   3. Replace 'YOUR_N8N_WEBHOOK_URL_HERE' above

STEP 3: Add to .gitignore
   Add this line to your .gitignore file:
   admin/config.js
   
   This prevents your API keys from being committed to GitHub!

STEP 4: Test
   1. Open /admin/blog-editor.html in browser
   2. Open console (F12)
   3. Type: window.ENV.GROQ_API_KEY
   4. Should show your key (not 'YOUR_GROQ_API_KEY_HERE')

*/

// ===========================================
// EXAMPLE (DO NOT USE THESE VALUES!)
// ===========================================
/*
window.ENV = {
  GROQ_API_KEY: 'gsk_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnop',
  GROQ_MODEL: 'llama-3.3-70b-versatile',
  N8N_WEBHOOK_URL: 'https://myinstance.app.n8n.cloud/webhook/publish-blog'
};
*/
