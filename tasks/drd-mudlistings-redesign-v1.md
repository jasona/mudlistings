---
standards_version: 1.0.0
applied_standards:
  - global/principles.md
  - global/accessibility.md
  - domains/design-ui.md
  - phases/create-drd.md
related_documents:
  - tasks/crd-mudlistings-redesign-v1.md
---

# Design Requirements Document: mudlistings.com Website Redesign

## 1. Introduction/Overview

**Project:** Visual redesign of mudlistings.com - a directory website for Multi-User Dungeon (MUD) games.

**Design Objective:** Create an immersive, atmospheric dark-mode experience that celebrates MUD culture through subtle retro touches and terminal-inspired animations, while maintaining modern usability standards inspired by Product Hunt and Dribbble.

**Design Challenge:** Balance nostalgia with accessibility—the design should feel like coming home for veterans while remaining welcoming and navigable for newcomers who've never experienced text-based gaming.

## 2. Goals

1. **Create atmosphere** - Design an immersive experience that evokes the magic of text-based worlds through visual and interactive elements
2. **Improve discoverability** - Make finding MUDs intuitive through featured content, clear categorization, and effective search
3. **Modernize perception** - Position MUDs as a living, vibrant gaming community through contemporary design patterns
4. **Ensure accessibility** - Meet WCAG 2.1 AA standards while maintaining the atmospheric aesthetic
5. **Support dual audiences** - Serve both players discovering games and administrators listing their MUDs

## 3. User Context

### Players (Discovery Mode)
- **Goal:** Find a MUD that matches their interests
- **Context:** Browsing on desktop (primary) or mobile, often in evening/night hours
- **Behavior:** Scan featured games, filter by genre, read descriptions, check player counts
- **Needs:** Quick evaluation of game fit, easy connection instructions

### Administrators (Listing Mode)
- **Goal:** Promote their MUD to potential players
- **Context:** Desktop-focused, detailed form completion
- **Behavior:** Create/edit listings, monitor engagement, respond to community
- **Needs:** Clear listing process, visibility into performance

### Newcomers (Learning Mode)
- **Goal:** Understand what MUDs are and if they're interested
- **Context:** Arrived via search, curious but unfamiliar
- **Behavior:** Read explainer content, browse casually, need reassurance
- **Needs:** Jargon-free explanations, low-commitment exploration path

## 4. Visual Requirements

### 4.1 Color Palette

#### Dark Mode (Default)

| Token | Hex | Use |
|-------|-----|-----|
| `bg-void` | #0D0D0F | Deep page background (near-black with subtle blue) |
| `bg-terminal` | #12141A | Card/panel backgrounds |
| `bg-surface` | #1A1D24 | Elevated surfaces, modals |
| `bg-hover` | #232830 | Hover states |
| `bg-active` | #2A303A | Active/selected states |

| Token | Hex | Use |
|-------|-----|-----|
| `text-primary` | #E8E8ED | Primary text, headings |
| `text-secondary` | #9CA3B0 | Secondary text, descriptions |
| `text-muted` | #6B7280 | Timestamps, metadata |
| `text-terminal` | #4ADE80 | Terminal-style accents, active indicators |

| Token | Hex | Use |
|-------|-----|-----|
| `accent-primary` | #6366F1 | Primary actions, links (indigo) |
| `accent-glow` | #818CF8 | Hover glow, focus rings |
| `accent-terminal` | #4ADE80 | Terminal green accents |
| `accent-amber` | #FBBF24 | Featured/promoted indicators |
| `accent-success` | #22C55E | Success states |
| `accent-error` | #EF4444 | Error states |

#### Light Mode (Toggle Option)

| Token | Hex | Use |
|-------|-----|-----|
| `bg-light-base` | #F8FAFC | Page background |
| `bg-light-surface` | #FFFFFF | Cards, panels |
| `bg-light-hover` | #F1F5F9 | Hover states |
| `text-light-primary` | #1E293B | Primary text |
| `text-light-secondary` | #64748B | Secondary text |

### 4.2 Typography

#### Font Stack
```css
/* Primary: Modern system fonts */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Terminal Accent: Monospace for retro touches */
font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
```

#### Type Scale

| Token | Size | Weight | Line Height | Font | Use |
|-------|------|--------|-------------|------|-----|
| `display` | 48px | 700 | 1.1 | Inter | Hero headlines |
| `heading-1` | 32px | 600 | 1.2 | Inter | Page titles |
| `heading-2` | 24px | 600 | 1.3 | Inter | Section headers |
| `heading-3` | 18px | 600 | 1.4 | Inter | Card titles |
| `body` | 16px | 400 | 1.6 | Inter | Primary content |
| `body-small` | 14px | 400 | 1.5 | Inter | Secondary content |
| `caption` | 12px | 500 | 1.4 | Inter | Labels, metadata |
| `mono` | 14px | 400 | 1.5 | JetBrains Mono | Terminal text, game stats |
| `mono-small` | 12px | 400 | 1.4 | JetBrains Mono | Code, connection strings |

### 4.3 Imagery & Iconography

#### Icon Style
- **Primary icons:** Outline style, 1.5px stroke, rounded caps
- **Retro accent icons:** Pixel art style (16x16 or 24x24 grid) for genre categories
- **Status indicators:** Filled circles with glow effect

#### Pixel Art Icons (Genre Categories)
Create custom pixel art icons for:
- Fantasy (sword/shield)
- Sci-Fi (spaceship/planet)
- Horror (skull/ghost)
- Roleplay (theater masks)
- PvP (crossed swords)
- Social (chat bubble)

#### Decorative Elements
- Subtle scan line overlay (5% opacity) on hero sections
- CRT screen curvature effect on featured game cards (subtle, CSS-only)
- Terminal cursor blink animation for interactive elements
- Subtle noise texture on backgrounds (2-3% opacity)

### 4.4 Spacing System

Base unit: 4px

| Token | Value | Use |
|-------|-------|-----|
| `space-1` | 4px | Tight inline spacing |
| `space-2` | 8px | Icon gaps, compact groups |
| `space-3` | 12px | Input padding, list item gaps |
| `space-4` | 16px | Card padding (internal) |
| `space-5` | 20px | Component gaps |
| `space-6` | 24px | Section padding |
| `space-8` | 32px | Large section gaps |
| `space-12` | 48px | Major section breaks |
| `space-16` | 64px | Hero section padding |

### 4.5 Layout Grid

#### Desktop (>1024px)
- Max content width: 1280px
- Sidebar: 240px (collapsible)
- Main content: Fluid
- Gutter: 24px
- Columns: 12-column grid

#### Tablet (768px - 1024px)
- Max content width: 100%
- Sidebar: Hidden (hamburger menu)
- Gutter: 16px
- Columns: 8-column grid

#### Mobile (<768px)
- Max content width: 100%
- Gutter: 16px
- Columns: 4-column grid
- Full-bleed hero sections

## 5. Component Specifications

### 5.1 Featured Hero Section

```
┌─────────────────────────────────────────────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
│  ▓                                                           ▓  │
│  ▓   > MUDs are alive and thriving_                         ▓  │
│  ▓                                                           ▓  │
│  ▓   Find your next adventure in hundreds of active worlds   ▓  │
│  ▓                                                           ▓  │
│  ▓   [  🔍 Search MUDs...                              ]     ▓  │
│  ▓                                                           ▓  │
│  ▓   [ Find Your MUD ]  [ Browse by Genre ]                  ▓  │
│  ▓                                                           ▓  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │
└─────────────────────────────────────────────────────────────────┘

- Full-width, min-height 400px (desktop), 300px (mobile)
- Subtle gradient: bg-void → bg-terminal (diagonal)
- Scan line overlay at 3% opacity
- Headline uses typing animation effect
- Terminal cursor blink after headline
- Search bar: 600px max-width, centered
```

### 5.2 Featured Game Card (Hero Spotlight)

```
┌──────────────────────────────────────────────────────────────┐
│  ┌─────────┐                                                 │
│  │  ⚔️     │  FEATURED                                       │
│  │ [pixel] │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  │  art    │  Legends of the Realm                           │
│  │ (genre) │  A rich fantasy world with 20+ years of lore    │
│  └─────────┘                                                 │
│                                                              │
│  ● 127 players online    ⏱ Est. 1998    🏷 Fantasy, RP      │
│                                                              │
│  [ Connect & Play ]                               ★ 4.8/5    │
└──────────────────────────────────────────────────────────────┘

- Width: 100% of content area (max 800px)
- Background: bg-terminal with subtle CRT curve effect
- Border: 1px border-subtle with accent-amber glow (featured indicator)
- Pixel art icon: 64x64
- Player count: accent-terminal (green) with pulse animation
- Hover: Lift effect (translateY -2px), increased glow
```

### 5.3 Game List Item (Compact)

```
┌──────────────────────────────────────────────────────────────┐
│  ● Realm of Shadows          Horror, PvP     ▸ 45 online    │
├──────────────────────────────────────────────────────────────┤
│  ● Crystal Kingdoms          Fantasy, RP     ▸ 89 online    │
├──────────────────────────────────────────────────────────────┤
│  ○ Starship Nexus            Sci-Fi          ▸ 12 online    │
└──────────────────────────────────────────────────────────────┘

- Row height: 48px
- Status dot: accent-terminal (green) = active, text-muted (gray) = low activity
- Genre tags: mono-small, text-secondary
- Player count: mono font, right-aligned
- Hover: bg-hover, cursor pointer
- Click: Expand to show description + connect button
```

### 5.4 Genre Category Cards

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│     ⚔️          │  │     🚀          │  │     💀          │
│   [pixel]       │  │   [pixel]       │  │   [pixel]       │
│                 │  │                 │  │                 │
│   Fantasy       │  │   Sci-Fi        │  │   Horror        │
│   142 worlds    │  │   67 worlds     │  │   38 worlds     │
└─────────────────┘  └─────────────────┘  └─────────────────┘

- Size: 160px x 180px (desktop), fluid on mobile
- Background: bg-terminal
- Pixel art icon: 48x48, centered
- Border: 1px border-subtle
- Hover: border-accent-primary, subtle glow, icon bounce
- Border-radius: 12px
```

### 5.5 Search Bar

```
┌─────────────────────────────────────────────────────────────┐
│  🔍  Search for MUDs, genres, or features...          ⌘ K  │
└─────────────────────────────────────────────────────────────┘

- Height: 48px (hero), 40px (nav)
- Background: bg-surface
- Border: 1px border-subtle
- Focus: border-accent-primary, glow effect
- Placeholder: text-muted, typing animation on hero version
- Keyboard shortcut hint: mono-small, right-aligned
- Border-radius: 8px
```

### 5.6 Buttons

#### Primary Button
```css
background: accent-primary;
color: white;
padding: 12px 24px;
border-radius: 8px;
font-weight: 600;
/* Glow effect */
box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);

/* Hover */
background: accent-glow;
box-shadow: 0 0 30px rgba(99, 102, 241, 0.5);
transform: translateY(-1px);
```

#### Secondary Button
```css
background: transparent;
color: text-secondary;
border: 1px solid border-default;
padding: 12px 24px;
border-radius: 8px;

/* Hover */
background: bg-hover;
color: text-primary;
border-color: border-focus;
```

#### Terminal Button (Retro Accent)
```css
background: transparent;
color: accent-terminal;
border: 1px solid accent-terminal;
font-family: 'JetBrains Mono';
padding: 12px 24px;
border-radius: 4px;

/* Hover */
background: rgba(74, 222, 128, 0.1);
box-shadow: 0 0 15px rgba(74, 222, 128, 0.3);
/* Cursor blink animation */
```

### 5.7 Navigation

#### Header (Desktop)
```
┌─────────────────────────────────────────────────────────────────┐
│  🎮 mudlistings    Browse  Genres  For Admins  About     🌙 ☰  │
└─────────────────────────────────────────────────────────────────┘

- Height: 64px
- Background: bg-void with backdrop-blur
- Logo: Text + pixel art icon
- Nav items: text-secondary, hover → text-primary
- Active: text-primary + underline accent-primary
- Theme toggle: Moon/sun icon
- Position: Sticky top
```

#### Mobile Navigation
```
┌─────────────────────────────────────────────────────────────────┐
│  🎮 mudlistings                                    🔍    ☰     │
└─────────────────────────────────────────────────────────────────┘

- Height: 56px
- Hamburger opens full-screen overlay menu
- Menu: Terminal-style typing animation for items
```

### 5.8 Dark/Light Mode Toggle

```
┌───────────────────┐
│  🌙 ←──●──→ ☀️   │
└───────────────────┘

- Toggle switch with moon/sun icons
- Smooth transition (300ms) between modes
- Persist preference in localStorage
- Default: Dark mode
```

## 6. Interaction & Behavior

### 6.1 Animations

#### Typing Effect (Headlines)
```javascript
// Used for: Hero headline, welcome messages
duration: 50ms per character
cursor: Blinking block cursor (accent-terminal)
delay: 500ms before starting
easing: Linear (typewriter feel)
```

#### Terminal Cursor Blink
```css
animation: blink 1s step-end infinite;
@keyframes blink {
  50% { opacity: 0; }
}
```

#### Page Transitions
```javascript
// Fade + slight upward movement
duration: 300ms
easing: ease-out
transform: translateY(10px) → translateY(0)
opacity: 0 → 1
```

#### Card Hover
```css
transition: all 200ms ease-out;
/* Hover state */
transform: translateY(-2px);
box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
```

#### Loading States
```
> Loading worlds...█
> ████████████░░░░░░░░ 60%

- Terminal-style progress bar
- Text updates with typing effect
- Pulsing glow on active elements
```

#### Scroll Animations
- Fade-in-up for content sections (staggered, 100ms delay between items)
- Parallax on hero section (subtle, 0.5 speed)
- Number count-up for stats (players online, total MUDs)

### 6.2 Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| <768px | Single column, stacked cards, hamburger nav, full-width hero |
| 768-1024px | Two-column game grid, compact featured card |
| >1024px | Featured hero + list layout, sidebar filters, full nav |

### 6.3 State Specifications

#### Button States
| State | Visual |
|-------|--------|
| Default | As specified above |
| Hover | Increased glow, slight lift |
| Active/Pressed | Darker background, no lift |
| Focus | Focus ring (2px accent-glow), visible outline |
| Disabled | 50% opacity, no interactions |
| Loading | Pulsing glow, spinner icon |

#### Input States
| State | Visual |
|-------|--------|
| Default | bg-surface, border-subtle |
| Focus | border-accent-primary, glow |
| Filled | text-primary |
| Error | border-error, error message below |
| Disabled | bg-hover, text-muted, no interaction |

#### Game Listing States
| State | Visual |
|-------|--------|
| Active (high players) | Green status dot, accent-terminal |
| Active (low players) | Yellow status dot, accent-amber |
| Inactive | Gray status dot, text-muted |
| Featured | Amber border glow |
| Hovered | bg-hover, lift effect |
| Expanded | Shows full description, connect button |

### 6.4 Empty States

#### No Search Results
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        > No worlds found_                       │
│                                                                 │
│           We couldn't find any MUDs matching your search.       │
│                                                                 │
│                 [ Clear Filters ]  [ Browse All ]               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

- Centered content
- Terminal-style message
- Helpful action buttons
```

#### No Reviews Yet
```
> Be the first to share your experience_
[ Write a Review ]
```

## 7. Accessibility Requirements

### 7.1 Color Contrast (ACCESS-1)
- All text meets 4.5:1 contrast ratio minimum
- Large text (24px+) meets 3:1 minimum
- Interactive elements have clear visual distinction

| Element | Foreground | Background | Ratio |
|---------|------------|------------|-------|
| Body text | #E8E8ED | #0D0D0F | 15.5:1 ✓ |
| Secondary text | #9CA3B0 | #0D0D0F | 7.2:1 ✓ |
| Terminal accent | #4ADE80 | #0D0D0F | 10.8:1 ✓ |
| Muted text | #6B7280 | #0D0D0F | 4.6:1 ✓ |

### 7.2 Keyboard Navigation (ACCESS-2)
- All interactive elements reachable via Tab
- Logical tab order following visual layout
- Arrow key navigation within game lists
- Escape closes modals and overlays
- Enter activates focused elements

### 7.3 Focus Indicators (ACCESS-5)
```css
/* Visible focus ring on all interactive elements */
:focus-visible {
  outline: 2px solid accent-glow;
  outline-offset: 2px;
}
```

### 7.4 Screen Reader Considerations (ACCESS-3, ACCESS-6)
- Semantic HTML: `<nav>`, `<main>`, `<article>`, `<section>`
- ARIA labels for icon-only buttons
- Alt text for all meaningful images
- Pixel art icons have descriptive alt text
- Announce dynamic content changes (search results, loading states)

### 7.5 Motion Preferences (ACCESS-13)
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  /* Disable typing effect, use static text */
  /* Disable parallax */
  /* Keep essential feedback (focus rings) */
}
```

### 7.6 Touch Targets (DRD-5)
- Minimum touch target: 44x44px on mobile
- Adequate spacing between interactive elements (minimum 8px)

## 8. Non-Goals (Out of Scope)

This DRD does **not** cover:
- Content/copywriting (see CRD)
- Backend/API design
- Admin dashboard design (separate DRD recommended)
- Email templates
- Native mobile app design
- Marketing landing pages (beyond main site)
- Blog/editorial design

## 9. Brand & Style References

### Design Inspiration
| Reference | What to Take |
|-----------|--------------|
| Product Hunt | Card layout, upvote patterns, clean typography |
| Dribbble | Visual browsing, creator spotlights, category navigation |
| Linear.app | Dark mode execution, keyboard shortcuts, command palette |
| Warp Terminal | Terminal aesthetics, glow effects, modern + retro blend |
| itch.io | Indie game discovery, genre browsing, creator focus |

### Mood Board Elements
- Deep space backgrounds with subtle star field
- Terminal green accents on dark backgrounds
- Pixel art icons for genre categories
- CRT screen effects (subtle, not overwhelming)
- Glowing UI elements suggesting active systems
- Modern typography with monospace accents

## 10. Technical Constraints

### Browser Support
- Chrome 90+, Firefox 90+, Safari 14+, Edge 90+
- CSS Grid and Flexbox required
- CSS custom properties (variables) for theming
- Backdrop-filter for glassmorphism effects (graceful degradation)

### Performance Requirements
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3s
- Animations: 60fps minimum

### Asset Constraints
- Pixel art icons: SVG or optimized PNG (max 5KB each)
- No heavy image backgrounds (use CSS gradients)
- Font loading: System fonts first, Inter/JetBrains Mono progressive

### CSS Architecture
- CSS custom properties for all tokens
- Prefer CSS over JavaScript for animations
- Mobile-first responsive approach

## 11. Deliverables

| Deliverable | Format | Description |
|-------------|--------|-------------|
| Design System | Figma | Tokens, components, patterns |
| Homepage Design | Figma | Desktop, tablet, mobile |
| Browse/Search Page | Figma | List view, filters, empty states |
| Game Detail Page | Figma | All states, review section |
| Admin Landing Page | Figma | Value prop, signup flow |
| About Pages | Figma | What is a MUD, History, About |
| Component Library | Figma | All UI components with states |
| Icon Set | SVG | Pixel art genre icons, UI icons |
| Animation Specs | Documentation | Timing, easing, code examples |
| Asset Export | PNG/SVG | All required assets, @1x and @2x |

### Variations Required
- Light mode variants for all pages
- Reduced motion variants
- Mobile breakpoint for all pages

## 12. Success Criteria

| Criteria | Target | Measurement |
|----------|--------|-------------|
| WCAG 2.1 AA Compliance | Pass | Automated + manual audit |
| Lighthouse Accessibility | 95+ | Lighthouse audit |
| User comprehension | 90%+ | Can identify how to find a game |
| Visual appeal rating | 4/5+ | User survey |
| Theme toggle works | 100% | QA testing |
| Reduced motion works | 100% | QA testing |
| Cross-browser consistency | Match designs | Visual QA |

## 13. Open Questions

1. **Game screenshots/images:** Will MUDs have associated images, or is it text-only with genre icons?
2. **Real-time player counts:** Are player counts live, or periodic snapshots? Affects animation choices.
3. **Review system design:** Is this in scope? Needs separate component specifications.
4. **Notification system:** Any alerts, updates, or activity feeds to design?
5. **Onboarding flow:** Should there be a first-time user experience or tutorial?
6. **Connection method:** How do users actually connect? Inline terminal? External client links?

---

## Standards Compliance

### Applied Rules
- [PRIN-1] ✓ User-first design prioritizing discovery and accessibility
- [PRIN-4] ✓ Design system ensures maintainability
- [ACCESS-1] ✓ Color contrast requirements specified and verified
- [ACCESS-2] ✓ Keyboard navigation specified
- [ACCESS-5] ✓ Focus indicators defined
- [ACCESS-13] ✓ Reduced motion alternative specified
- [DESIGN-1] ✓ Dark mode as primary experience
- [DESIGN-2] ✓ Subtle gradients and textures specified
- [DESIGN-3] ✓ Muted color palette with accent colors
- [DESIGN-4] ✓ Generous spacing system defined
- [DESIGN-5] ✓ System font stack specified
- [DESIGN-8] ✓ Instant feedback animations specified
- [DRD-1] ✓ All standard sections included
- [DRD-3] ✓ Accessibility requirements detailed
- [DRD-4] ✓ Breakpoints defined for mobile, tablet, desktop
- [DRD-6] ✓ Design tokens used throughout
- [DRD-10] ✓ All states specified (default, hover, focus, disabled, error)

### Deviations
| Rule | Deviation | Rationale |
|------|-----------|-----------|
| DESIGN-9 | Command palette not required | Directory site doesn't need power-user shortcuts like a productivity app |
| DESIGN-10 | No command palette | Same as above |
| DESIGN-15 | No persistent sidebar | Mobile-first directory benefits from full-width content over sidebar navigation |
