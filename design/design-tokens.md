# Design Tokens - MudListings.com

> Extracted from Figma prototype screenshots

## Color Palette

### Background Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#0a0a0f` | Page background (very dark navy) |
| `--background-secondary` | `#0d0d14` | Slightly elevated surfaces |
| `--card` | `#141420` | Card backgrounds |
| `--card-hover` | `#1a1a2e` | Card hover state |
| `--popover` | `#141420` | Dropdowns, modals |
| `--input` | `#1a1a2e` | Input field backgrounds |

### Primary Colors (Purple/Indigo)
| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#6366f1` | Primary buttons, links, accents (Indigo-500) |
| `--primary-hover` | `#4f46e5` | Primary hover state (Indigo-600) |
| `--primary-foreground` | `#ffffff` | Text on primary |

### Text Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--foreground` | `#ffffff` | Primary text |
| `--muted-foreground` | `#71717a` | Secondary/muted text (Zinc-500) |
| `--muted` | `#27272a` | Muted backgrounds |

### Semantic Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--success` | `#22c55e` | Online status, success states (Green-500) |
| `--warning` | `#f97316` | Trending badges, warnings (Orange-500) |
| `--destructive` | `#ef4444` | Error, delete actions (Red-500) |
| `--info` | `#3b82f6` | Information (Blue-500) |

### Accent Colors (for genres/categories)
| Token | Value | Usage |
|-------|-------|-------|
| `--accent-purple` | `#a855f7` | Purple accent (Purple-500) |
| `--accent-blue` | `#3b82f6` | Blue accent (Blue-500) |
| `--accent-cyan` | `#06b6d4` | Cyan accent (Cyan-500) |
| `--accent-green` | `#22c55e` | Green accent (Green-500) |
| `--accent-orange` | `#f97316` | Orange accent (Orange-500) |
| `--accent-red` | `#ef4444` | Red accent (Red-500) |
| `--accent-yellow` | `#fbbf24` | Star ratings (Amber-400) |

### Border Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--border` | `rgba(255, 255, 255, 0.1)` | Subtle borders |
| `--border-hover` | `rgba(255, 255, 255, 0.2)` | Borders on hover |
| `--ring` | `#6366f1` | Focus rings |

## Typography

### Font Families
| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | `"Inter", ui-sans-serif, system-ui, sans-serif` | Body text |
| `--font-mono` | `"JetBrains Mono", ui-monospace, monospace` | Code, terminal |

### Font Sizes
| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 12px | 16px | Small labels, badges |
| `text-sm` | 14px | 20px | Body small, secondary text |
| `text-base` | 16px | 24px | Body text |
| `text-lg` | 18px | 28px | Body large |
| `text-xl` | 20px | 28px | Card titles |
| `text-2xl` | 24px | 32px | Section headings |
| `text-3xl` | 30px | 36px | Page headings |
| `text-4xl` | 36px | 40px | Hero subtitle |
| `text-5xl` | 48px | 48px | Hero title |

### Font Weights
| Token | Value | Usage |
|-------|-------|-------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Emphasis, labels |
| `font-semibold` | 600 | Subheadings, buttons |
| `font-bold` | 700 | Headings |

## Spacing

Based on 4px grid system:
| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight spacing |
| `space-2` | 8px | Icon gaps |
| `space-3` | 12px | Small gaps |
| `space-4` | 16px | Default spacing |
| `space-5` | 20px | Medium spacing |
| `space-6` | 24px | Card padding |
| `space-8` | 32px | Section gaps |
| `space-10` | 40px | Large gaps |
| `space-12` | 48px | Section spacing |
| `space-16` | 64px | Page sections |
| `space-20` | 80px | Hero spacing |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Small elements, badges |
| `--radius-md` | 6px | Buttons, inputs |
| `--radius-lg` | 8px | Cards |
| `--radius-xl` | 12px | Large cards, modals |
| `--radius-2xl` | 16px | Hero elements |
| `--radius-full` | 9999px | Pills, avatars, status dots |

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.5)` | Subtle elevation |
| `--shadow-md` | `0 4px 6px rgba(0, 0, 0, 0.4)` | Cards |
| `--shadow-lg` | `0 10px 15px rgba(0, 0, 0, 0.3)` | Modals, dropdowns |
| `--shadow-glow` | `0 0 20px rgba(99, 102, 241, 0.3)` | Primary glow effect |

## Gradients

| Name | Value | Usage |
|------|-------|-------|
| Hero text | `linear-gradient(to right, #ffffff, #06b6d4)` | "Adventure Awaits" gradient |
| Background accent | `radial-gradient(ellipse at top, #1e1b4b 0%, transparent 50%)` | Subtle purple glow |

## Component Specifications

### Buttons
- **Primary**: `bg-primary text-white rounded-md px-4 py-2 font-medium`
- **Secondary**: `bg-transparent border border-border text-white rounded-md px-4 py-2`
- **Ghost**: `bg-transparent text-muted-foreground hover:text-white`

### Cards (MUD Card)
- Background: `--card`
- Border: `1px solid var(--border)`
- Border radius: `--radius-lg`
- Padding: `space-4` to `space-6`
- Hover: slight lift, border brightens

### Badges/Tags
- Small rounded pills
- Genre colors vary (see accent colors)
- Trending badge: orange background
- Status badge: green for online

### Input Fields
- Background: `--input`
- Border: `1px solid var(--border)`
- Border radius: `--radius-md`
- Leading icon in muted color
- Focus: ring with `--ring` color

### Navigation
- Header: sticky, dark background with slight transparency
- Logo on left
- Nav links centered
- Search bar and auth on right
- Height: ~64px

### Star Ratings
- Color: `--accent-yellow` (#fbbf24)
- 5-star display
- Can show partial stars

### Status Indicator
- Online: Green dot (#22c55e) with subtle pulse animation
- Offline: Gray dot

## Page Layouts

### Homepage
1. **Hero Section**: Full-width, gradient background accent, centered content
   - Large headline with gradient text
   - Search bar prominent
   - Stats badges below
2. **Genre Cards**: 6-column grid of icon cards
3. **Featured MUDs**: Horizontal scroll or grid of MUD cards
4. **Staffing Opportunities**: Card grid
5. **Footer**: Dark, multi-column links

### Browse Page
- Filter bar with active filter chips
- Grid layout (4 columns on desktop)
- MUD cards with consistent sizing
- Pagination at bottom

### MUD Detail Page
- Two-column layout on desktop
- Left: Main content (description, highlights, tags)
- Right: Sidebar (connection details, stats, report)
- Breadcrumb navigation

### Auth Pages (Login/Register)
- Centered card on dark background
- Logo above card
- Form with icon-prefixed inputs
- Social auth buttons
- Link to alternate action

## Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Wide screens |

## Animations

| Name | Duration | Easing | Usage |
|------|----------|--------|-------|
| Fade in | 200ms | ease-out | Page transitions |
| Card hover | 150ms | ease-out | Lift effect |
| Status pulse | 2s | ease-in-out | Online indicator |
| Button press | 100ms | ease-in | Click feedback |
