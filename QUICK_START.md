# ✅ Quick Start Checklist

Print this page and check off each step as you complete setup!

---

## 🎯 Phase 1: Initial Setup (10 minutes)

- [ ] **Install Node.js** (if not already installed)
  ```bash
  node --version  # Should be 18+
  ```

- [ ] **Clone or navigate to your blog repo**
  ```bash
  cd your-blog-repo
  ```

- [ ] **Install dependencies**
  ```bash
  npm install js-yaml gray-matter marked moment-timezone
  ```

- [ ] **Create required directories**
  ```bash
  mkdir -p content/posts/drafts
  mkdir -p .github/workflows
  mkdir -p scripts
  ```

---

## 🚀 Phase 2: Add Files (5 minutes)

- [ ] **Copy `publish-scheduled-posts.yml`**
  - Location: `.github/workflows/publish-scheduled-posts.yml`
  - This file handles automatic publishing

- [ ] **Copy `publish-scheduled.js`**
  - Location: `scripts/publish-scheduled.js`
  - This script checks and publishes posts

- [ ] **Copy `scheduler.html`**
  - Location: `admin/scheduler.html`
  - This is your main interface

- [ ] **Copy `package.json`**
  - Location: `package.json` (root)
  - Manages dependencies

---

## ⚙️ Phase 3: Configure GitHub (5 minutes)

- [ ] **Enable GitHub Actions**
  1. Go to your repo Settings
  2. Click "Actions" → "General"
  3. Select "Allow all actions and reusable workflows"
  4. Click "Save"

- [ ] **Set Workflow Permissions**
  1. Still in Settings → Actions → General
  2. Scroll to "Workflow permissions"
  3. Select "Read and write permissions"
  4. Check "Allow GitHub Actions to create and approve pull requests"
  5. Click "Save"

- [ ] **Commit and push all files**
  ```bash
  git add .
  git commit -m "Add blog scheduling system"
  git push origin main
  ```

---

## 🎨 Phase 4: Test the System (10 minutes)

- [ ] **Open the scheduler**
  - Navigate to `admin/scheduler.html` in your browser
  - You should see the beautiful interface

- [ ] **Create a test post**
  1. Fill in title: "Test Post"
  2. Add some content
  3. Click "Schedule"
  4. Set date for 2 hours from now
  5. Download the .md file

- [ ] **Upload test post**
  1. Save the .md file to `content/posts/drafts/`
  2. Commit and push:
     ```bash
     git add content/posts/drafts/
     git commit -m "Add test scheduled post"
     git push
     ```

- [ ] **Verify GitHub Actions**
  1. Go to your repo → Actions tab
  2. You should see the workflow listed
  3. It will run automatically every hour

- [ ] **Manual test (optional)**
  1. Go to Actions → "Publish Scheduled Posts"
  2. Click "Run workflow"
  3. Watch it run and check for errors

---

## 🎯 Phase 5: Production Workflow (5 minutes)

- [ ] **Adjust schedule timing**
  - Edit `.github/workflows/publish-scheduled-posts.yml`
  - Change cron schedule if desired
  - Default: Every hour at :05 minutes

- [ ] **Customize categories**
  - Edit `admin/scheduler.html`
  - Update the category dropdown with your topics

- [ ] **Update branding**
  - Change colors in scheduler CSS
  - Update header text
  - Add your logo

---

## 🤖 Phase 6: Generate Content with Claude (20 minutes)

- [ ] **Read Claude prompt templates**
  - Open `CLAUDE_PROMPTS.md`
  - Choose a template that fits your needs

- [ ] **Generate your first batch**
  1. Copy a prompt template
  2. Customize for your topic
  3. Ask Claude to generate 5-10 posts
  4. Save each post's content

- [ ] **Schedule your posts**
  1. Open scheduler for each post
  2. Paste content
  3. Set schedule dates (space them out)
  4. Download all .md files

- [ ] **Upload in bulk**
  ```bash
  # Add all posts at once
  git add content/posts/drafts/*.md
  git commit -m "Add scheduled posts for [date range]"
  git push
  ```

---

## ✨ Phase 7: Verify Everything (5 minutes)

- [ ] **Check scheduled posts**
  - Open scheduler → Queue tab
  - Verify all posts show correct dates

- [ ] **Verify file structure**
  ```
  content/
    posts/
      drafts/
        post-1.md ✓
        post-2.md ✓
      published-post.md
  ```

- [ ] **Check GitHub Actions**
  - Actions tab should show workflow
  - Should be scheduled to run hourly

- [ ] **Set calendar reminder**
  - Weekly: Check queue and add more posts
  - Monthly: Review analytics and adjust

---

## 📊 Success Metrics

After 1 week:
- [ ] At least 3 posts auto-published
- [ ] No errors in GitHub Actions
- [ ] Queue has 2+ weeks of content

After 1 month:
- [ ] 12+ posts published
- [ ] Consistent posting schedule
- [ ] Analytics showing traffic growth

---

## 🆘 Common Issues & Quick Fixes

**Problem: Workflow not running**
```bash
# Fix: Check Actions are enabled in Settings
Settings → Actions → General → Allow all actions
```

**Problem: Posts not publishing**
```bash
# Fix: Verify date format is correct
scheduled_date: "2026-02-20T15:00:00Z"  # Must be ISO 8601
```

**Problem: Permission denied**
```bash
# Fix: Update workflow permissions
Settings → Actions → General → Read and write permissions
```

**Problem: Module not found**
```bash
# Fix: Install dependencies
npm install js-yaml gray-matter marked moment-timezone
```

---

## 🎉 You're Done!

**Congratulations!** Your world-class blog scheduling system is now live.

### What's Next?

1. **Create a content calendar** - Plan 2-4 weeks ahead
2. **Batch create posts** - Use Claude to generate 10-20 at once
3. **Monitor performance** - Check which topics perform best
4. **Refine strategy** - Adjust posting times and frequency

### Quick Reference Commands

```bash
# Check scheduled posts locally
npm run test-publish

# Generate blog content
npm run generate

# Install dependencies
npm install

# Start local server
npm run dev
```

---

## 📞 Need Help?

- 📖 Read the [Full Guide](SCHEDULING_GUIDE.md)
- 🤖 Check [Claude Prompts](CLAUDE_PROMPTS.md)
- 🐛 Review GitHub Actions logs
- 💬 Open an issue on GitHub

---

**Pro Tip:** Print this checklist and keep it handy for your first few weeks until the workflow becomes second nature!

---

<div align="center">

**🎯 Goal: Never manually post again!**

Set it up once, enjoy automation forever.

</div>
