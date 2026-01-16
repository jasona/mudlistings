---
standards_version: 1.0.0
applied_standards:
  - global/principles.md
  - phases/generate-tasks.md
source_document: tasks/drd-mudlistings-redesign-v1.md
clarifications:
  - MUDs will have images/screenshots (affects card and detail page designs)
  - Player counts are static (no real-time updates needed)
  - No direct connection feature for now (informational only, no "Connect & Play")
---

# Task List: mudlistings.com Design Redesign

## Relevant Files

- `design/README.md` - Figma setup guide with page structure and token definitions
- `design/mudlistings-design-system.fig` - Figma design system file (tokens, components)
- `design/mudlistings-pages.fig` - Figma page designs (all screens)
- `design/tokens/colors.json` - Color token export for development
- `design/tokens/typography.json` - Typography token export
- `design/tokens/spacing.json` - Spacing token export
- `design/icons/genre-fantasy.svg` - Pixel art fantasy genre icon
- `design/icons/genre-scifi.svg` - Pixel art sci-fi genre icon
- `design/icons/genre-horror.svg` - Pixel art horror genre icon
- `design/icons/genre-roleplay.svg` - Pixel art roleplay genre icon
- `design/icons/genre-pvp.svg` - Pixel art PvP genre icon
- `design/icons/genre-social.svg` - Pixel art social genre icon
- `design/icons/ui-icons.svg` - UI icon sprite (search, menu, theme toggle, etc.)
- `design/animation-specs.md` - Animation timing and easing documentation
- `design/assets/` - Exported assets directory (@1x, @2x)

### Notes

- All designs should be created in Figma with Auto Layout for responsive behavior
- Use Figma Variables for design tokens to enable theme switching
- Export icons as SVG for scalability
- Test all color combinations against WCAG 2.1 AA contrast requirements

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Create feature branch (traces to: TASKS-12)
  - [x] 0.1 Create and checkout a new branch `git checkout -b design/mudlistings-redesign`

- [ ] 1.0 Set Up Design System Foundation (traces to: DRD Section 4)
  - [x] 1.1 Create new Figma file for design system with cover page and table of contents (see design/README.md for setup guide)
  - [ ] 1.2 Set up color tokens as Figma Variables for dark mode (bg-void, bg-terminal, bg-surface, bg-hover, bg-active)
  - [ ] 1.3 Set up color tokens for text colors (text-primary, text-secondary, text-muted, text-terminal)
  - [ ] 1.4 Set up color tokens for accent colors (accent-primary, accent-glow, accent-terminal, accent-amber, accent-success, accent-error)
  - [ ] 1.5 Set up color tokens for light mode variant (bg-light-base, bg-light-surface, text-light-primary, text-light-secondary)
  - [ ] 1.6 Create typography styles using Inter font (display, heading-1, heading-2, heading-3, body, body-small, caption)
  - [ ] 1.7 Create typography styles using JetBrains Mono (mono, mono-small) for terminal accents
  - [ ] 1.8 Set up spacing tokens as Figma Variables (space-1 through space-16 per 4px base unit)
  - [ ] 1.9 Document border radius standards (4px, 6px, 8px, 12px)
  - [ ] 1.10 Verify all dark mode text/background combinations meet WCAG 2.1 AA contrast (4.5:1 minimum)
  - [ ] 1.11 Export tokens to JSON format for developer handoff

- [ ] 2.0 Design Core UI Components (traces to: DRD Section 5)
  - [ ] 2.1 Design Primary Button component with all states (default, hover, active, focus, disabled, loading)
  - [ ] 2.2 Design Secondary Button component with all states
  - [ ] 2.3 Design Terminal Button component (retro accent style) with all states
  - [ ] 2.4 Design Search Bar component (48px hero variant, 40px nav variant) with all states
  - [ ] 2.5 Design Text Input component with all states (default, focus, filled, error, disabled)
  - [ ] 2.6 Design Desktop Header/Navigation component (64px height, sticky, backdrop blur)
  - [ ] 2.7 Design Mobile Header component (56px height) with hamburger menu trigger
  - [ ] 2.8 Design Mobile Navigation Overlay (full-screen menu with terminal-style animation notes)
  - [ ] 2.9 Design Dark/Light Mode Toggle component (moon/sun icons)
  - [ ] 2.10 Design Genre Category Card component (160x180px) with pixel art icon placeholder
  - [ ] 2.11 Design Game List Item component (48px row height) with status dot, expand interaction
  - [ ] 2.12 Design Game List Item expanded state showing description and details
  - [ ] 2.13 Design Featured Game Card component (max 800px width) with image placeholder, CRT effect notes
  - [ ] 2.14 Design Status Dot indicators (active-green, low-amber, inactive-gray)
  - [ ] 2.15 Design Tag/Badge component for genre labels
  - [ ] 2.16 Design Footer component with navigation links
  - [ ] 2.17 Create component documentation page with usage guidelines
  - [ ] 2.18 Verify all interactive components have visible focus indicators (ACCESS-5)

- [ ] 3.0 Create Pixel Art Icon Set (traces to: DRD Section 4.3)
  - [ ] 3.1 Design Fantasy genre icon (sword/shield) in 16x16 pixel grid, export at 48x48 and 64x64
  - [ ] 3.2 Design Sci-Fi genre icon (spaceship/planet) in 16x16 pixel grid
  - [ ] 3.3 Design Horror genre icon (skull/ghost) in 16x16 pixel grid
  - [ ] 3.4 Design Roleplay genre icon (theater masks) in 16x16 pixel grid
  - [ ] 3.5 Design PvP genre icon (crossed swords) in 16x16 pixel grid
  - [ ] 3.6 Design Social genre icon (chat bubble) in 16x16 pixel grid
  - [ ] 3.7 Create UI icon set (search, menu, close, chevron, external link, star, users, calendar)
  - [ ] 3.8 Ensure all icons work on both dark and light backgrounds
  - [ ] 3.9 Export all icons as optimized SVG (max 5KB each)
  - [ ] 3.10 Add descriptive alt text recommendations for each icon (ACCESS-3)

- [ ] 4.0 Design Homepage (traces to: DRD Section 5.1-5.5, 11)
  - [ ] 4.1 Design Hero Section - Desktop (full-width, 400px min-height, gradient background, scanline overlay)
  - [ ] 4.2 Add typing effect headline annotation with cursor blink notes
  - [ ] 4.3 Design Hero Section - Search bar centered (600px max-width)
  - [ ] 4.4 Design Hero Section - Primary and secondary CTA buttons
  - [ ] 4.5 Design Featured Game Section with spotlight card (including game screenshot/image)
  - [ ] 4.6 Design "Browse by Genre" section with genre category card grid (6 cards)
  - [ ] 4.7 Design "New to MUDs?" section targeting newcomers with CTA
  - [ ] 4.8 Design Community Stats section (total MUDs, years active, players - static counts)
  - [ ] 4.9 Design Game List section with compact list items (10-15 sample rows)
  - [ ] 4.10 Design Footer with navigation and theme toggle
  - [ ] 4.11 Create Tablet breakpoint (768-1024px) - adjust hero height, 2-column genre grid
  - [ ] 4.12 Create Mobile breakpoint (<768px) - single column, stacked sections, reduced hero
  - [ ] 4.13 Design Light Mode variant for homepage
  - [ ] 4.14 Add reduced-motion variant notes (static headline, no parallax)

- [ ] 5.0 Design Browse/Search Page (traces to: DRD Section 5.3, 5.5, 6.4)
  - [ ] 5.1 Design page header with search bar and breadcrumb navigation
  - [ ] 5.2 Design Filter Sidebar (desktop) with genre, codebase, player count, features filters
  - [ ] 5.3 Design Filter as horizontal pills (mobile/tablet)
  - [ ] 5.4 Design Search Results area with game list items
  - [ ] 5.5 Design results count and sort dropdown ("Showing X MUDs, Sort by: Most Active")
  - [ ] 5.6 Design Pagination / "Load More" component
  - [ ] 5.7 Design Empty State - No search results (terminal-style message, clear filters CTA)
  - [ ] 5.8 Design Empty State - No games in category
  - [ ] 5.9 Design Loading State (terminal-style progress bar)
  - [ ] 5.10 Create Tablet breakpoint - filters collapse to horizontal
  - [ ] 5.11 Create Mobile breakpoint - filters in modal/drawer
  - [ ] 5.12 Design Light Mode variant

- [ ] 6.0 Design Game Detail Page (traces to: DRD Section 11)
  - [ ] 6.1 Design page header with game title, genre tags, status indicator
  - [ ] 6.2 Design hero/header area with game screenshot/image (if available)
  - [ ] 6.3 Design game description section with formatted text
  - [ ] 6.4 Design Quick Stats panel (player count static, established date, codebase, genre)
  - [ ] 6.5 Design Features/Tags section showing game characteristics
  - [ ] 6.6 Design "How to Connect" section with connection info (telnet address, website link)
  - [ ] 6.7 Design Reviews section placeholder (rating display, review list structure)
  - [ ] 6.8 Design "No Reviews Yet" empty state with CTA
  - [ ] 6.9 Design Related Games section with compact cards
  - [ ] 6.10 Design Admin actions area (for game owners - edit listing link)
  - [ ] 6.11 Create Tablet breakpoint
  - [ ] 6.12 Create Mobile breakpoint - stacked layout, sticky CTA bar
  - [ ] 6.13 Design Light Mode variant

- [ ] 7.0 Design Admin Landing Page (traces to: DRD Section 11)
  - [ ] 7.1 Design hero section with value proposition for MUD administrators
  - [ ] 7.2 Design "Why List Your MUD" benefits section (3-4 benefit cards)
  - [ ] 7.3 Design "How It Works" section (3-4 step process with icons)
  - [ ] 7.4 Design "List Your MUD" primary CTA section
  - [ ] 7.5 Design social proof section (testimonials placeholder, stats)
  - [ ] 7.6 Design Listing Form preview/teaser showing what admins will fill out
  - [ ] 7.7 Create Tablet breakpoint
  - [ ] 7.8 Create Mobile breakpoint
  - [ ] 7.9 Design Light Mode variant

- [ ] 8.0 Design About/Community Pages (traces to: DRD Section 11)
  - [ ] 8.1 Design "What is a MUD?" page with illustrated explainer sections
  - [ ] 8.2 Design terminology glossary component (expandable definitions)
  - [ ] 8.3 Design "History of MUDs" page with timeline component (nostalgic styling)
  - [ ] 8.4 Design "About mudlistings.com" page with mission statement, team info placeholder
  - [ ] 8.5 Design "Community Guidelines" page with clear rule formatting
  - [ ] 8.6 Create consistent page template for all About pages
  - [ ] 8.7 Create Mobile breakpoints for all About pages
  - [ ] 8.8 Design Light Mode variants

- [ ] 9.0 Create Animation & Interaction Specs (traces to: DRD Section 6.1)
  - [ ] 9.1 Document typing effect animation (50ms per character, 500ms delay, cursor blink)
  - [ ] 9.2 Document terminal cursor blink animation (1s step-end infinite)
  - [ ] 9.3 Document page transition animations (300ms ease-out, fade + translateY)
  - [ ] 9.4 Document card hover animations (200ms ease-out, translateY -2px, shadow increase)
  - [ ] 9.5 Document button hover animations (glow increase, slight lift)
  - [ ] 9.6 Document loading state animations (terminal progress bar, pulsing glow)
  - [ ] 9.7 Document scroll animations (fade-in-up, 100ms stagger)
  - [ ] 9.8 Document reduced-motion alternatives for all animations (ACCESS-13)
  - [ ] 9.9 Provide CSS/code examples for key animations
  - [ ] 9.10 Save animation specs to `design/animation-specs.md`

- [ ] 10.0 Quality Assurance & Asset Export (traces to: DRD Section 7, 11, 12)
  - [ ] 10.1 Run accessibility audit on all page designs (contrast, focus states, touch targets)
  - [ ] 10.2 Verify all text meets 4.5:1 contrast ratio (use Figma plugin or manual check)
  - [ ] 10.3 Verify all interactive elements have 44x44px minimum touch targets on mobile
  - [ ] 10.4 Verify all pages have consistent component usage
  - [ ] 10.5 Review all states are designed (default, hover, focus, disabled, error, loading, empty)
  - [ ] 10.6 Ensure light mode variants are complete and consistent
  - [ ] 10.7 Ensure reduced-motion variants are documented
  - [ ] 10.8 Export all pixel art icons as SVG to `design/icons/`
  - [ ] 10.9 Export UI icons as SVG sprite to `design/icons/ui-icons.svg`
  - [ ] 10.10 Export color, typography, spacing tokens to JSON in `design/tokens/`
  - [ ] 10.11 Export key assets at @1x and @2x to `design/assets/`
  - [ ] 10.12 Create design handoff documentation with developer notes
  - [ ] 10.13 Final review and stakeholder sign-off

---

## Standards Compliance

- [TASKS-1] ✓ Tasks sized for 0.5-1 day maximum
- [TASKS-2] ✓ Each task has clear deliverable
- [TASKS-3] ✓ Tasks trace to DRD requirements
- [TASKS-4] ✓ Quality review tasks included (10.0)
- [TASKS-6] ✓ Relevant files identified
- [TASKS-10] ✓ Tasks logically grouped under parent tasks
- [TASKS-11] ✓ Progressive complexity (foundation → components → pages → polish)
- [TASKS-12] ✓ Feature branch creation included as first task
- [TASKS-13] ✓ Task descriptions start with action verbs
