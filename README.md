# 📅 World-Class Blog Scheduling System

> **Professional blog scheduling with automatic publishing for Cloudflare Pages + GitHub**

Transform your blog workflow from manual posting to automated content scheduling with a beautiful, intuitive interface.

---

## ✨ Features

🎯 **Smart Scheduling**
- Visual calendar interface
- Schedule posts days, weeks, or months in advance
- Automatic timezone conversion
- Bulk upload support

🤖 **Automated Publishing**
- GitHub Actions-powered automation
- Hourly checks for scheduled content
- Automatic site rebuilds
- Zero manual intervention needed

🎨 **Beautiful UI/UX**
- Modern, gradient-based design
- Intuitive drag-and-drop (coming soon)
- Real-time preview
- Mobile responsive

📊 **Content Management**
- Visual post queue
- Filter by status (scheduled/draft/published)
- Edit and reschedule easily
- Track performance metrics

⚡ **Developer-Friendly**
- Markdown-based
- Git-powered workflow
- Cloudflare Pages integration
- SEO optimized

---

## 🚀 Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Folder Structure

```bash
mkdir -p content/posts/drafts
```

### 3. Copy Files to Your Repo

```bash
# Copy workflow
cp .github/workflows/publish-scheduled-posts.yml your-repo/.github/workflows/

# Copy scheduler interface
cp admin/scheduler.html your-repo/admin/

# Copy publish script
cp scripts/publish-scheduled.js your-repo/scripts/
```

### 4. Open Scheduler

Navigate to `admin/scheduler.html` in your browser and start creating!

---

## 📖 How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│  1. CREATE POSTS                                                │
│  Use the beautiful scheduler interface                          │
│  ↓                                                               │
│  2. SCHEDULE                                                     │
│  Set publication date/time                                       │
│  ↓                                                               │
│  3. UPLOAD TO GITHUB                                            │
│  Save .md files to content/posts/drafts/                        │
│  ↓                                                               │
│  4. GITHUB ACTIONS (Every Hour)                                 │
│  Checks scheduled_date vs current time                          │
│  ↓                                                               │
│  5. AUTO-PUBLISH                                                │
│  Moves posts to content/posts/                                  │
│  ↓                                                               │
│  6. CLOUDFLARE PAGES                                            │
│  Detects changes and deploys automatically                      │
│  ↓                                                               │
│  7. LIVE! 🎉                                                    │
│  Your post is now public                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Scheduler Interface

### Create Tab
Create and schedule posts with a professional editor:
- Rich markdown support
- SEO optimization fields
- Tag management
- Author info
- Schedule or publish immediately

### Queue Tab
Manage all your posts visually:
- Filter by status
- See scheduled dates at a glance
- Edit or delete posts
- Beautiful card-based layout

### Calendar Tab
Visual overview of your content calendar *(coming soon)*

---

## 📝 Post Format

### Scheduled Post

```yaml
---
title: "Amazing Post Title"
slug: "amazing-post-title"
scheduled_date: "2026-03-15T10:00:00Z"  # UTC time
category: "Furniture"
tags:
  - home decor
  - small spaces
author:
  name: "Rita N."
  role: "Content Editor"
seo:
  title: "Amazing Post Title | Your Blog"
  description: "Brief SEO description"
---

## Your Content

Write amazing content here...
```

When the scheduled time arrives, GitHub Actions automatically:
1. Removes `scheduled_date` field
2. Sets `published: true`
3. Moves file to main posts directory
4. Triggers site rebuild

---

## 🔧 Configuration

### Change Schedule Frequency

Edit `.github/workflows/publish-scheduled-posts.yml`:

```yaml
schedule:
  - cron: '5 * * * *'     # Every hour (default)
  # - cron: '0 9 * * *'   # Daily at 9am
  # - cron: '0 */6 * * *' # Every 6 hours
```

### Customize Categories

Edit `admin/scheduler.html`:

```javascript
<select id="category">
  <option>Your Category 1</option>
  <option>Your Category 2</option>
</select>
```

### Brand Colors

Update CSS variables:

```css
:root {
  --primary: #7C3AED;     /* Your brand color */
  --secondary: #EC4899;   /* Accent color */
  --success: #10B981;     /* Success states */
}
```

---

## 🤖 Using with Claude

Generate posts in bulk with Claude and schedule them effortlessly.

**Sample Prompt:**

```
Generate 5 blog posts about standing desks for small apartments.

For each post provide:
- Title (SEO optimized)
- 1200-1500 words in Markdown
- 5-7 relevant tags
- SEO description
- Category: Furniture

Output in markdown format with YAML frontmatter.
```

Then simply:
1. Copy each post into the scheduler
2. Set different schedule dates
3. Download all .md files
4. Upload to GitHub in one commit

See `CLAUDE_PROMPTS.md` for detailed templates.

---

## 📊 Workflow Examples

### Daily Posting

```
Monday    9:00 AM - Product Review
Tuesday   9:00 AM - How-to Guide  
Wednesday 9:00 AM - Trend Article
Thursday  9:00 AM - Tips & Tricks
Friday    9:00 AM - Round-up Post
```

### Multiple Posts Per Day

```
Morning   9:00 AM  - Long-form article
Afternoon 2:00 PM  - Quick tips
Evening   6:00 PM  - Product spotlight
```

### Bulk Scheduling

```
Week 1: Generate 10 posts with Claude
Week 2: Schedule across next 2 months
Week 3: Review analytics, adjust strategy
Week 4: Generate next batch
```

---

## 🎯 Best Practices

### Content Creation
- ✅ Batch create 10-20 posts at once
- ✅ Use AI (Claude) for efficiency
- ✅ Review and edit before scheduling
- ✅ Add high-quality images

### Scheduling Strategy
- ✅ Schedule 2-4 weeks in advance
- ✅ Post at consistent times
- ✅ Vary content types
- ✅ Consider peak traffic times

### SEO Optimization
- ✅ Always fill SEO fields
- ✅ Use target keywords naturally
- ✅ Write compelling meta descriptions
- ✅ Add relevant tags

---

## 🐛 Troubleshooting

### Posts Not Publishing?

**Check:**
1. Is `scheduled_date` in the past?
2. Is the post in `content/posts/drafts/`?
3. Did GitHub Actions run? (Check Actions tab)
4. Are there any error logs?

**Manual Trigger:**
1. Go to GitHub Actions
2. Select "Publish Scheduled Posts"
3. Click "Run workflow"

### Workflow Not Running?

**Fix:**
1. Go to Settings → Actions → General
2. Enable "Allow all actions and reusable workflows"
3. Enable "Read and write permissions" for GITHUB_TOKEN

### Time Zone Issues?

- All times are stored in UTC
- The scheduler converts your local time automatically
- Double-check the `scheduled_date` in the .md file

---

## 📚 Documentation

- 📘 **[Full Setup Guide](SCHEDULING_GUIDE.md)** - Complete walkthrough
- 🤖 **[Claude Prompts](CLAUDE_PROMPTS.md)** - Templates for AI content generation
- 🔧 **[API Docs](docs/API.md)** - Technical reference *(coming soon)*

---

## 🎨 UI Preview

### Main Interface
- Clean, modern gradient design
- Intuitive three-tab layout
- Real-time stats dashboard
- Mobile responsive

### Post Creation
- Full markdown editor
- Live character counts
- Tag management
- Schedule picker with visual feedback

### Queue Management
- Card-based layout
- Color-coded status badges
- Quick actions (edit/delete)
- Filter and search

---

## 🚦 System Requirements

- Node.js 18+
- GitHub repository
- Cloudflare Pages account
- Modern web browser

---

## 🔒 Security

- No API keys in code
- Uses GitHub's native GITHUB_TOKEN
- All actions run in isolated environments
- Regular dependency updates

---

## 📈 Roadmap

- [x] Automatic scheduling
- [x] Beautiful UI
- [x] GitHub Actions integration
- [x] Bulk operations
- [ ] Visual calendar view
- [ ] Drag-and-drop rescheduling
- [ ] Analytics integration
- [ ] Email notifications
- [ ] Social media auto-posting
- [ ] Image upload/management
- [ ] Multi-user support
- [ ] Post templates

---

## 🤝 Contributing

Found a bug? Have a feature request?
1. Open an issue
2. Submit a PR
3. Share your improvements!

---

## 📄 License

MIT License - feel free to use and modify for your own projects!

---

## 💡 Pro Tips

**Efficiency Hacks:**
- Generate 20 posts on Sunday, schedule for the month
- Use Claude to create content outlines quickly
- Set consistent posting times for reader expectations
- Review analytics monthly to optimize timing

**Content Quality:**
- Always proofread AI-generated content
- Add personal touches and examples
- Include high-quality images
- Optimize for mobile readers

**SEO Wins:**
- Fill every SEO field completely
- Research keywords before writing
- Internal linking between posts
- Update old posts regularly

---

<div align="center">

**Built with ❤️ for content creators who want to work smarter, not harder**

[Get Started](#-quick-start-5-minutes) • [Documentation](SCHEDULING_GUIDE.md) • [Support](#-troubleshooting)

</div>
