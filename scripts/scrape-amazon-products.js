/**
 * scrape-amazon-products.js
 *
 * Reads all .md posts, finds products listed in frontmatter that are missing
 * image_url or title, fetches that data from Amazon, and writes it back into
 * the frontmatter — so you only ever need to paste the affiliate link + price
 * + tier + benefit.
 *
 * Run:  node scripts/scrape-amazon-products.js
 *
 * Dependencies:
 *   npm install gray-matter node-fetch cheerio js-yaml
 */

'use strict';

const fs      = require('fs');
const path    = require('path');
const matter  = require('gray-matter');
const yaml    = require('js-yaml');

// ─── Dynamic imports for ESM-only packages ────────────────────────────────────
let fetch, load;

async function init() {
  const fetchMod   = await import('node-fetch');
  const cheerioMod = await import('cheerio');
  fetch = fetchMod.default;
  load  = cheerioMod.load;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const POSTS_DIR = path.join(__dirname, '../content/posts');

// Rotating user agents to avoid Amazon's bot detection
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
];
let uaIndex = 0;
const nextUA = () => USER_AGENTS[uaIndex++ % USER_AGENTS.length];

// Sleep helper — Amazon throttles aggressive scrapers
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── Extract ASIN from any Amazon URL ─────────────────────────────────────────
function extractASIN(url) {
  if (!url) return null;
  const m = url.match(/\/(?:dp|gp\/product|d)\/([A-Z0-9]{10})/i);
  return m ? m[1] : null;
}

// ─── Build canonical Amazon product URL from ASIN ─────────────────────────────
function canonicalUrl(asin) {
  return `https://www.amazon.com/dp/${asin}`;
}

// ─── Fetch product data from Amazon ───────────────────────────────────────────
async function fetchAmazonProduct(affiliateUrl) {
  const asin = extractASIN(affiliateUrl);
  if (!asin) {
    console.warn(`  ⚠️  Cannot extract ASIN from: ${affiliateUrl}`);
    return null;
  }

  const url = canonicalUrl(asin);

  try {
    await sleep(1500 + Math.random() * 1000); // 1.5–2.5s delay between requests

    const res = await fetch(url, {
      headers: {
        'User-Agent':      nextUA(),
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control':   'no-cache',
        'Pragma':          'no-cache',
      },
      redirect: 'follow',
    });

    if (!res.ok) {
      console.warn(`  ⚠️  HTTP ${res.status} for ASIN ${asin}`);
      return null;
    }

    const html = await res.text();
    const $    = load(html);

    // ── Title ─────────────────────────────────────────────────────────────────
    const title =
      $('#productTitle').text().trim() ||
      $('h1[data-automation-id="title"]').text().trim() ||
      $('h1.product-title-word-break').text().trim() ||
      null;

    // ── Image ─────────────────────────────────────────────────────────────────
    // Amazon stores the full-size image URL in a JSON blob inside a <script> tag
    let image_url = null;

    $('script').each((_, el) => {
      const src = $(el).html() || '';
      if (src.includes('"large"') && src.includes('m.media-amazon.com')) {
        const m = src.match(/"large"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
        if (m) { image_url = m[1]; return false; }
      }
    });

    // Fallback: main product image tag
    if (!image_url) {
      image_url =
        $('#landingImage').attr('src') ||
        $('#imgBlkFront').attr('src')  ||
        $('#main-image').attr('src')   ||
        null;
    }

    // ── Price (optional auto-fetch — you can always set price manually) ────────
    const priceText =
      $('.a-price .a-offscreen').first().text().trim() ||
      $('#price_inside_buybox').text().trim()          ||
      $('#priceblock_ourprice').text().trim()          ||
      null;

    // Parse numeric price
    const priceMatch = priceText ? priceText.match(/[\d,]+\.?\d*/) : null;
    const price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : null;

    if (!title && !image_url) {
      console.warn(`  ⚠️  Could not parse title or image for ASIN ${asin} — Amazon may be blocking. Add manually.`);
      return null;
    }

    return { asin, title, image_url, price };

  } catch (err) {
    console.warn(`  ⚠️  Fetch error for ASIN ${asin}: ${err.message}`);
    return null;
  }
}

// ─── Process a single post file ───────────────────────────────────────────────
async function processPost(filePath) {
  const raw          = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);

  const products = data.featured_products;
  if (!Array.isArray(products) || products.length === 0) return false;

  let changed = false;

  for (const p of products) {
    // Only process entries that have an affiliate_url but are missing image_url or title
    if (!p.affiliate_url) continue;
    const needsImage = !p.image_url || p.image_url === '';
    const needsTitle = !p.name    || p.name === '';

    if (!needsImage && !needsTitle) continue;

    console.log(`  🔍 Fetching data for: ${p.affiliate_url}`);
    const fetched = await fetchAmazonProduct(p.affiliate_url);

    if (!fetched) continue;

    if (needsTitle  && fetched.title)     { p.name      = fetched.title;     changed = true; }
    if (needsImage  && fetched.image_url) { p.image_url = fetched.image_url; changed = true; }

    // Auto-fill price only if completely absent (user-set price takes priority)
    if ((!p.price || p.price === '') && fetched.price) {
      p.price = `$${fetched.price.toFixed(2)}`;
      changed = true;
    }
  }

  if (!changed) return false;

  // Write back — preserve existing content exactly, only update frontmatter
  const newFrontmatter = yaml.dump(data, {
    lineWidth:    -1,
    noRefs:       true,
    quotingType:  '"',
    forceQuotes:  false,
  });

  fs.writeFileSync(filePath, `---\n${newFrontmatter}---\n${content}`, 'utf8');
  return true;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  await init();

  console.log('🛒 Amazon product scraper starting...\n');

  const files = fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(POSTS_DIR, f));

  let updated = 0;

  for (const file of files) {
    const name = path.basename(file);
    console.log(`📄 ${name}`);
    const changed = await processPost(file);
    if (changed) {
      console.log(`  ✅ Updated product data`);
      updated++;
    }
  }

  console.log(`\n🎉 Done — ${updated} post(s) updated with Amazon product data.`);
}

main().catch(err => { console.error(err); process.exit(1); });
