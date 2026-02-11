const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const matter = require('gray-matter');

const DRAFT_DIR = path.join(__dirname, '../content/posts/drafts');
const POSTS_DIR = path.join(__dirname, '../content/posts');

// Ensure directories exist
if (!fs.existsSync(DRAFT_DIR)) {
  fs.mkdirSync(DRAFT_DIR, { recursive: true });
}

function publishScheduledPosts() {
  console.log('🔍 Checking for scheduled posts...');
  
  const now = new Date();
  const nowUTC = now.toISOString();
  
  console.log(`Current time (UTC): ${nowUTC}`);
  
  if (!fs.existsSync(DRAFT_DIR)) {
    console.log('No drafts directory found');
    return false;
  }

  const draftFiles = fs.readdirSync(DRAFT_DIR)
    .filter(file => file.endsWith('.md'));

  if (draftFiles.length === 0) {
    console.log('No draft posts found');
    return false;
  }

  console.log(`Found ${draftFiles.length} draft post(s)`);

  let postsPublished = false;

  draftFiles.forEach(file => {
    const filePath = path.join(DRAFT_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    try {
      const { data: frontmatter, content } = matter(fileContent);
      
      // Check if post has scheduled_date and if it's time to publish
      if (frontmatter.scheduled_date) {
        const scheduledDate = new Date(frontmatter.scheduled_date);
        
        console.log(`\n📄 ${file}`);
        console.log(`   Scheduled for: ${scheduledDate.toISOString()}`);
        
        if (scheduledDate <= now) {
          console.log(`   ✅ PUBLISHING NOW!`);
          
          // Update frontmatter - remove scheduled_date, set publish date
          const updatedFrontmatter = { ...frontmatter };
          delete updatedFrontmatter.scheduled_date;
          
          // Set the date field to the scheduled date (or now if not set)
          updatedFrontmatter.date = frontmatter.date || scheduledDate.toISOString();
          updatedFrontmatter.published = true;
          
          // Reconstruct the markdown file
          const newContent = matter.stringify(content, updatedFrontmatter);
          
          // Move to posts directory
          const newPath = path.join(POSTS_DIR, file);
          fs.writeFileSync(newPath, newContent, 'utf8');
          
          // Delete from drafts
          fs.unlinkSync(filePath);
          
          console.log(`   📦 Moved to: ${newPath}`);
          postsPublished = true;
        } else {
          const timeUntil = Math.round((scheduledDate - now) / (1000 * 60 * 60));
          console.log(`   ⏳ Waiting (${timeUntil} hours remaining)`);
        }
      } else {
        console.log(`\n📄 ${file} - No scheduled_date field, skipping`);
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  });

  if (postsPublished) {
    console.log('\n🎉 Successfully published scheduled posts!');
    // Set output for GitHub Actions
    console.log('::set-output name=posts_published::true');
  } else {
    console.log('\n⏰ No posts ready to publish yet');
  }

  return postsPublished;
}

// Run the function
publishScheduledPosts();
