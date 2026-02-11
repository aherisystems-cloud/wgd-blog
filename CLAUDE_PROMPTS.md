# 🤖 Claude Post Generation Templates

Use these prompts with Claude to generate high-quality blog posts in bulk.

## 📝 Basic Post Generation

```
I need 5 blog posts for my home decor blog "Wow Glam Decor". 

Topic: [Standing Desks / Storage Solutions / Lighting / etc.]
Target Audience: People living in small apartments who want stylish, functional decor
Tone: Friendly, expert, helpful but not salesy
SEO Focus: High

For each post, please provide:
1. Engaging title (60-70 characters)
2. SEO-optimized description (150-160 characters)
3. 5-7 relevant tags
4. Full article in Markdown (1200-1500 words)
5. Include specific product recommendations with affiliate potential

Format each post as a complete markdown file with frontmatter.
```

## 🎯 Category-Specific Templates

### Furniture Posts

```
Generate 3 blog posts about [FURNITURE TYPE] for small spaces.

Each post should:
- Include "Best [X] for Small Apartments" or similar title
- Feature 5-7 specific product recommendations
- Include dimensions and space-saving features
- Address common pain points
- Provide styling tips
- Include a FAQ section
- Be 1200-1500 words

Category: Furniture
Author: Rita N. (Furniture Expert)
```

### DIY & Tutorial Posts

```
Create 5 DIY tutorial posts for home decor projects.

Requirements:
- Difficulty: Easy to Medium
- Budget: Under $100
- Time: 2-4 hours
- Include materials list
- Step-by-step instructions with markdown headings
- Safety tips
- Variations/alternatives
- Final styling suggestions

Category: DIY
Author: Sarah M. (DIY Enthusiast)
```

### Trend & Guide Posts

```
Write 4 comprehensive guides about [TOPIC] trends in 2026.

Each should include:
- Current trends analysis
- Expert predictions
- Product recommendations
- Color palettes
- Style combinations
- Budget-friendly options
- Shopping tips

Category: Decor
Author: Emily K. (Design Consultant)
```

## 📋 Bulk Generation Workflow

### Step 1: Generate Content

Use Claude to create 10+ posts at once:

```
Generate 10 blog posts on the following topics:
1. Best standing desks for small apartments
2. Compact storage solutions for bedrooms
3. LED lighting ideas for home offices
4. Minimalist furniture under $500
5. DIY headboard tutorials
6. Small kitchen organization hacks
7. Outdoor furniture for balconies
8. Sustainable decor materials
9. Color schemes for small spaces
10. Multi-functional furniture pieces

For each post:
- Title (SEO optimized)
- Slug (URL friendly)
- Description (150-160 chars)
- 5-7 tags
- Full markdown content (1200+ words)
- Author info
- Category
```

### Step 2: Extract to Scheduler

For each post Claude generates:
1. Copy the title → Paste in scheduler
2. Copy the content → Paste in scheduler
3. Add tags, category, SEO info
4. Set schedule date
5. Download .md file

### Step 3: Batch Upload

```bash
# In your local repo
cd content/posts/drafts

# Add all downloaded posts
git add *.md

# Commit with descriptive message
git commit -m "Add 10 scheduled posts for Feb-March 2026"

# Push to trigger workflow
git push origin main
```

## 🎨 Advanced Prompt Engineering

### For Better Product Recommendations

```
For each product recommendation, include:
- Specific brand and model name
- Key features (3-5 bullet points)
- Dimensions
- Price range
- Why it's good for small spaces
- Potential drawbacks
- Alternative options

Make recommendations feel natural within the content, not like a list.
```

### For Better SEO

```
Optimize for these SEO factors:
- Include target keyword in title, first paragraph, and H2s
- Use related keywords naturally
- Add internal linking opportunities (mention other posts we could link)
- Include FAQ schema-ready questions
- Write meta description with CTA
- Suggest image alt text
```

### For Engagement

```
Make the content engaging by:
- Starting with a relatable problem/question
- Using conversational tone with "you" language
- Including personal anecdotes or examples
- Breaking up text with subheadings every 200-300 words
- Adding callout boxes or tips
- Ending with actionable next steps
```

## 📅 Scheduling Strategy

### Weekly Schedule Template

```
Monday 9:00 AM    - Product Review (Furniture)
Tuesday 2:00 PM   - How-To Guide (DIY)
Wednesday 9:00 AM - Trend Article (Decor)
Thursday 2:00 PM  - Product Round-up (Storage)
Friday 9:00 AM    - Tips & Tricks (Organization)
```

### Monthly Calendar

```
Week 1: Product focus (reviews, comparisons)
Week 2: Tutorials & DIY
Week 3: Trend analysis & guides
Week 4: Seasonal content
```

## 🔥 Claude Prompt for Complete Post

**Copy this exact prompt:**

```markdown
Write a complete blog post for Wow Glam Decor with the following specifications:

TOPIC: [Your topic here]

REQUIREMENTS:
- Title: Engaging, SEO-optimized (60-70 chars)
- Word count: 1200-1500 words
- Tone: Friendly expert, helpful, conversational
- Target: People in small apartments wanting stylish solutions
- Include: 5-7 specific product recommendations
- Structure: Introduction, 3-4 main sections, conclusion
- SEO: Natural keyword integration
- Format: Markdown with H2/H3 headings

OUTPUT AS:
Provide ONLY the markdown content with proper frontmatter in YAML format:
- title
- slug (URL-friendly)
- category (Furniture/Decor/DIY/Storage/Lighting)
- tags (array of 5-7 items)
- author (name and role)
- seo.title
- seo.description

Make it ready to paste directly into the scheduler.
```

## 💡 Pro Tips

1. **Generate in batches of 5-10** posts for efficiency
2. **Vary the topics** to cover different categories
3. **Schedule strategically** - space out similar topics
4. **Review before scheduling** - always do a quick check
5. **Update seasonally** - adjust topics for seasons/holidays

## 🎯 Example Output Format

Ask Claude to output like this:

````markdown
---
title: "10 Best Standing Desks for Small Apartments in 2026"
slug: "best-standing-desks-small-apartments"
category: "Furniture"
tags:
  - standing desk
  - home office
  - small spaces
  - ergonomic furniture
  - work from home
author:
  name: "Rita N."
  role: "Furniture Expert"
seo:
  title: "Best Standing Desks for Small Apartments 2026 | Space-Saving Reviews"
  description: "Discover the top 10 compact standing desks perfect for small apartments. Expert reviews, space-saving features, and buying guide included."
---

## Why Standing Desks Are Perfect for Small Apartments

Living in a small apartment doesn't mean you have to sacrifice your health...

[Full content continues...]
````

---

## 📊 Tracking Your Content

Create a simple spreadsheet:
```
| Post Title | Category | Scheduled Date | Status | Performance |
|------------|----------|----------------|--------|-------------|
| Post 1     | Furniture| 2026-02-15     | Live   | -           |
```

This helps you:
- Balance content types
- Avoid topic repetition
- Track what works
- Plan future content

---

**Ready to start?** Pick a template above and start generating world-class content with Claude! 🚀
