---
standards_version: 1.0.0
applied_standards:
  - global/principles.md
  - phases/generate-tasks.md
source_document: tasks/crd-mudlistings-redesign-v1.md
---

# Task List: mudlistings.com Content Redesign

## Relevant Files

- `content/homepage.md` - Homepage copy including hero, sections, and CTAs
- `content/navigation-ui.md` - Navigation labels and UI copy inventory
- `content/genres/` - Directory for genre/category descriptions
- `content/genres/fantasy.md` - Fantasy MUD genre description
- `content/genres/sci-fi.md` - Sci-fi MUD genre description
- `content/genres/horror.md` - Horror MUD genre description
- `content/genres/roleplay.md` - Roleplay MUD genre description
- `content/genres/pvp.md` - PvP MUD genre description
- `content/genres/codebases.md` - Codebase types (DIKU, LPMud, MUSH, MOO)
- `content/what-is-a-mud.md` - Newcomer explainer page
- `content/admin-onboarding.md` - Administrator landing page and flow copy
- `content/about.md` - About mudlistings.com page
- `content/mud-history.md` - History of MUDs page
- `content/community-guidelines.md` - Community guidelines page
- `content/ab-variations.md` - A/B test variations for hero and CTAs
- `content/seo-meta.md` - Meta descriptions and SEO copy

### Notes

- All content files are Markdown format for version control and easy review
- Word counts per CRD: Hero 20-40 words, section descriptions 40-80 words, genre descriptions 50-100 words, explainer 200-400 words
- Follow voice guidelines: nostalgic but forward-looking, welcoming, community-focused

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [ ] 0.0 Create feature branch (traces to: TASKS-12)
  - [ ] 0.1 Create and checkout a new branch `git checkout -b content/mudlistings-redesign`

- [ ] 1.0 Write Homepage Copy (traces to: CRD Section 6, 12)
  - [ ] 1.1 Write hero section copy with primary value proposition (20-40 words) incorporating key message: "MUDs are alive and thriving"
  - [ ] 1.2 Write "Find Your MUD" / "Browse Games" primary CTA button text and supporting microcopy
  - [ ] 1.3 Write "Featured/Trending MUDs" section headline and description (40-80 words)
  - [ ] 1.4 Write "Browse by Genre" section headline and description (40-80 words)
  - [ ] 1.5 Write "New to MUDs?" section copy targeting newcomers with "Learn about MUDs" CTA (40-80 words)
  - [ ] 1.6 Write "Community Highlights" section showcasing proof points (active MUDs count, years serving community)
  - [ ] 1.7 Write homepage meta title (60 chars) and meta description (155 chars) with primary keywords
  - [ ] 1.8 Save all homepage copy to `content/homepage.md`

- [ ] 2.0 Create Navigation & UI Copy Inventory (traces to: CRD Section 6, 12)
  - [ ] 2.1 Define primary navigation labels (Home, Browse, Genres, For Admins, About)
  - [ ] 2.2 Define secondary/footer navigation labels (What is a MUD?, History, Guidelines, Contact)
  - [ ] 2.3 Write button labels for all primary CTAs (Find Your MUD, Browse Games, Connect & Play, List Your MUD)
  - [ ] 2.4 Write search placeholder text and search-related UI copy
  - [ ] 2.5 Write filter sidebar labels (Genre, Codebase, Player Count, Features)
  - [ ] 2.6 Write empty state messages (no search results, no games in category, no reviews yet)
  - [ ] 2.7 Write error messages (connection failed, form validation, submission errors) following VOICE-11 empathetic tone
  - [ ] 2.8 Write loading states and pagination copy ("Load more games", "Showing X of Y")
  - [ ] 2.9 Save all UI copy to `content/navigation-ui.md`

- [ ] 3.0 Write Genre/Category Descriptions (traces to: CRD Section 6, 12)
  - [ ] 3.1 Write Fantasy MUD genre description (50-100 words) with secondary keyword "fantasy MUD"
  - [ ] 3.2 Write Sci-Fi MUD genre description (50-100 words) with secondary keyword "sci-fi MUD"
  - [ ] 3.3 Write Horror MUD genre description (50-100 words) with secondary keyword "horror MUD"
  - [ ] 3.4 Write Roleplay MUD genre description (50-100 words) with secondary keyword "roleplay MUD"
  - [ ] 3.5 Write PvP MUD genre description (50-100 words) with secondary keyword "PvP MUD"
  - [ ] 3.6 Write codebase type descriptions (DIKU, LPMud, MUSH, MOO) explaining differences for newcomers
  - [ ] 3.7 Write meta descriptions for each genre page (155 chars each)
  - [ ] 3.8 Save genre descriptions to `content/genres/` directory

- [ ] 4.0 Write "What is a MUD?" Explainer Page (traces to: CRD Section 6, 12)
  - [ ] 4.1 Write page introduction explaining MUDs for complete newcomers (plain language per VOICE-1)
  - [ ] 4.2 Define key MUD terminology (MUD, MUSH, MOO, codebase, telnet, client) per TERMS-4
  - [ ] 4.3 Write "Why play MUDs?" section highlighting unique benefits (community, creativity, depth)
  - [ ] 4.4 Write "How to get started" section with clear next steps and "Browse Games" CTA
  - [ ] 4.5 Ensure total word count is 200-400 words and reading level is Grade 8-10
  - [ ] 4.6 Write meta title and description targeting "what is a MUD" search queries
  - [ ] 4.7 Save to `content/what-is-a-mud.md`

- [ ] 5.0 Write Administrator Onboarding Copy (traces to: CRD Section 6, 12)
  - [ ] 5.1 Write "For Administrators" landing page hero with value proposition for MUD owners
  - [ ] 5.2 Write "Why List Your MUD" section with benefits (reach players, trusted directory, community connection)
  - [ ] 5.3 Write "How It Works" section explaining the listing process (3-4 clear steps)
  - [ ] 5.4 Write listing creation form labels, helper text, and validation messages
  - [ ] 5.5 Write "List Your MUD" primary CTA and supporting microcopy
  - [ ] 5.6 Write dashboard/management UI copy (edit listing, view stats, respond to reviews)
  - [ ] 5.7 Write meta title and description for admin landing page
  - [ ] 5.8 Save to `content/admin-onboarding.md`

- [ ] 6.0 Write About/Community Pages (traces to: CRD Section 6, 12)
  - [ ] 6.1 Write "About mudlistings.com" page (site story, mission, years serving community)
  - [ ] 6.2 Write "History of MUDs" page celebrating 45+ years of MUD culture (nostalgic tone)
  - [ ] 6.3 Write "Community Guidelines" page (respectful listing practices, review guidelines)
  - [ ] 6.4 Write meta titles and descriptions for each about/community page
  - [ ] 6.5 Save to `content/about.md`, `content/mud-history.md`, `content/community-guidelines.md`

- [ ] 7.0 Create A/B Test Variations (traces to: CRD Section 12)
  - [ ] 7.1 Write homepage hero variation A (original from task 1.1)
  - [ ] 7.2 Write homepage hero variation B (alternative angle - focus on returning players)
  - [ ] 7.3 Write homepage hero variation C (alternative angle - focus on community)
  - [ ] 7.4 Write primary CTA variation A: "Find Your MUD"
  - [ ] 7.5 Write primary CTA variation B: "Browse Games" or "Explore Worlds"
  - [ ] 7.6 Document hypothesis for each variation (what we expect to learn)
  - [ ] 7.7 Save to `content/ab-variations.md`

- [ ] 8.0 Review & Quality Assurance (traces to: TASKS-4, CRD Section 10)
  - [ ] 8.1 Review all copy for VOICE-1 compliance (plain language, no unexplained jargon)
  - [ ] 8.2 Review all copy for VOICE-2 compliance (active voice preferred)
  - [ ] 8.3 Review all copy for VOICE-3 compliance (scannable structure, headings, bullets)
  - [ ] 8.4 Verify terminology compliance per TERMS-* (Sign in/out, Create, approved terms)
  - [ ] 8.5 Verify words to avoid are not used (old, retro, dying, niche, click here)
  - [ ] 8.6 Check all link text is descriptive (no "click here" per accessibility requirements)
  - [ ] 8.7 Verify reading level is Grade 8-10 for user-facing content
  - [ ] 8.8 Review SEO copy: verify primary keywords appear in homepage, meta descriptions include required elements
  - [ ] 8.9 Cross-reference all content against CRD key messages and tone guidelines
  - [ ] 8.10 Final review and sign-off

---

## Standards Compliance

- [TASKS-1] ✓ Tasks sized for 0.5-1 day maximum
- [TASKS-2] ✓ Each task has clear deliverable
- [TASKS-3] ✓ Tasks trace to CRD requirements
- [TASKS-4] ✓ Quality review tasks included (8.0)
- [TASKS-6] ✓ Relevant files identified
- [TASKS-10] ✓ Tasks logically grouped under parent tasks
- [TASKS-12] ✓ Feature branch creation included as first task
- [TASKS-13] ✓ Task descriptions start with action verbs
