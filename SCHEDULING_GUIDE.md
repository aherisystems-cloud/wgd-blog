# 📅 Blog Scheduling System - Setup Guide

## 🎯 Overview

This world-class blog scheduling system allows you to:
- ✍️ Create and edit blog posts with a beautiful UI
- 📅 Schedule posts to publish automatically
- 📊 Manage your content queue visually
- 🤖 Auto-publish via GitHub Actions
- 🚀 Deploy to Cloudflare Pages automatically

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install js-yaml gray-matter marked moment-timezone
```

### Step 2: Set Up GitHub Actions

1. Copy `.github/workflows/publish-scheduled-posts.yml` to your repository
2. The workflow runs every hour automatically
3. It checks for scheduled posts and publishes them when ready

### Step 3: Create Directory Structure

```bash
mkdir -p content/posts/drafts
```

Your directory structure should look like:
```
content/
  posts/
    drafts/           # Scheduled and draft posts
    published-post.md # Published posts
  images/
```

### Step 4: Access the Scheduler

Open `admin/scheduler.html` in your browser to start creating and scheduling posts!

## 📝 How to Use

### Creating a Scheduled Post

1. **Open the Scheduler**: Navigate to `admin/scheduler.html`

2. **Fill in Post Details**:
   - Title (required)
   - Content in Markdown (required)
   - Category, tags, author info
   - SEO metadata

3. **Choose Publication Method**:
   - **Publish Now**: Post goes live immediately
   - **Schedule**: Select a future date/time

4. **Save the Post**:
   - Click "Schedule Post" or "Publish Now"
   - A `.md` file will download automatically

5. **Upload to GitHub**:
   - Save the downloaded file to:
     - `content/posts/drafts/` (for scheduled posts)
     - `content/posts/` (for immediate publishing)
   - Commit and push to GitHub

### The Magic Happens Automatically

Once you push your scheduled posts to GitHub:

1. **GitHub Actions** runs every hour
2. **Checks** the `content/posts/drafts/` folder
3. **Compares** each post's `scheduled_date` with current time
4. **Publishes** posts that are ready by:
   - Moving them to `content/posts/`
   - Removing the `scheduled_date` field
   - Triggering site rebuild
5. **Cloudflare Pages** detects the changes and deploys

## 📁 File Structure

### Scheduled Post Format

```yaml
---
title: "Your Awesome Post"
slug: "your-awesome-post"
date: "2026-02-15T10:00:00Z"
scheduled_date: "2026-02-20T15:00:00Z"  # Will publish at this time
category: "Furniture"
tags:
  - standing desk
  - home office
author:
  name: "Rita N."
  role: "Content Editor"
seo:
  title: "Your Awesome Post | Wow Glam Decor"
  description: "Brief description for SEO"
published: false
---

## Your Content Here

Write your amazing post in Markdown...
```

### Published Post Format

```yaml
---
title: "Your Awesome Post"
slug: "your-awesome-post"
date: "2026-02-20T15:00:00Z"
category: "Furniture"
tags:
  - standing desk
  - home office
author:
  name: "Rita N."
  role: "Content Editor"
seo:
  title: "Your Awesome Post | Wow Glam Decor"
  description: "Brief description for SEO"
published: true
---

## Your Content Here

Write your amazing post in Markdown...
```

## 🔧 Configuration

### Adjust Schedule Frequency

Edit `.github/workflows/publish-scheduled-posts.yml`:

```yaml
on:
  schedule:
    - cron: '5 * * * *'  # Every hour at :05
    # - cron: '0 */4 * * *'  # Every 4 hours
    # - cron: '0 9,15 * * *'  # 9am and 3pm daily
```

### Timezone Settings

Posts are scheduled in UTC. The scheduler interface will convert your local time to UTC automatically.

## 📊 Managing Your Content

### Using the Queue Tab

- View all posts (scheduled, draft, published)
- Filter by status
- Edit or delete posts
- See publication times at a glance

### Bulk Scheduling with Claude

1. Generate multiple posts with Claude
2. Copy each post's content
3. Use the scheduler to set different publication dates
4. Download all posts
5. Upload to `content/posts/drafts/` in one commit

## 🎨 Customization

### Styling the Scheduler

Edit `admin/scheduler.html` CSS variables:

```css
:root {
  --primary: #7C3AED;        /* Main brand color */
  --secondary: #EC4899;      /* Accent color */
  --success: #10B981;        /* Success actions */
}
```

### Adding Categories

Edit the category dropdown in `scheduler.html`:

```html
<select id="category">
  <option>Your Custom Category</option>
  <!-- Add more categories -->
</select>
```

## 🐛 Troubleshooting

### Posts Not Publishing

1. Check the GitHub Actions tab for errors
2. Verify `scheduled_date` is in the past
3. Ensure the post is in `content/posts/drafts/`
4. Check the workflow ran (every hour at :05)

### Workflow Not Running

1. Go to repo Settings → Actions → General
2. Ensure "Allow all actions" is selected
3. Check that scheduled workflows are enabled

### Manual Trigger

You can manually trigger the publish workflow:
1. Go to Actions tab
2. Select "Publish Scheduled Posts"
3. Click "Run workflow"

## 🚀 Advanced Features

### Email Notifications (Optional)

Add to your workflow after publishing:

```yaml
- name: Send notification
  if: steps.publish.outputs.posts_published == 'true'
  run: |
    # Add your notification logic here
    echo "Posts published!"
```

### Social Media Auto-Post (Future)

The frontmatter is ready for social media integration:

```yaml
social:
  twitter: "Your tweet text"
  linkedin: "Your LinkedIn post"
```

## 📈 Best Practices

1. **Schedule in Advance**: Queue posts 1-2 weeks ahead
2. **Consistent Timing**: Pick optimal times (e.g., 9am, 3pm)
3. **Batch Create**: Generate 5-10 posts with Claude at once
4. **Review Before Upload**: Check formatting and links
5. **Monitor Actions**: Regularly check GitHub Actions tab

## 🎯 Workflow Example

### Weekly Content Planning

**Monday**: Generate 5 posts with Claude
**Tuesday**: Schedule them throughout the week
**Wednesday-Sunday**: Posts auto-publish at set times
**Weekend**: Review analytics, plan next week

### Sample Schedule

```
Mon 9am  - "Best Standing Desks"
Tue 3pm  - "Small Space Storage Ideas"
Wed 9am  - "Lighting Trends 2026"
Thu 3pm  - "DIY Headboard Tutorial"
Fri 9am  - "Outdoor Furniture Guide"
```

## 🔐 Security

- Never commit API keys or tokens
- Use GitHub Secrets for sensitive data
- Review Actions logs for anomalies
- Keep dependencies updated

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Markdown Guide](https://www.markdownguide.org/)

## 💡 Tips for Success

1. **Write in Batches**: Create 10+ posts when inspired
2. **Strategic Timing**: Schedule for high-traffic hours
3. **Content Mix**: Vary categories and types
4. **SEO Optimization**: Use the SEO fields consistently
5. **Quality Over Quantity**: Better to post less but higher quality

---

**Need Help?** Check the GitHub Issues or the Actions logs for detailed error messages.

**Pro Tip**: Set calendar reminders to review your queue weekly and ensure you always have posts scheduled 2+ weeks out.
