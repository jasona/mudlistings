# mudlistings.com Design System

This directory contains design assets, tokens, and documentation for the mudlistings.com redesign.

## Figma File Setup

### File: `mudlistings-design-system.fig`

Create a new Figma file with the following page structure:

#### Page 1: Cover
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    🎮 mudlistings.com                           │
│                      Design System                              │
│                                                                 │
│                       Version 1.0.0                             │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Status: In Progress                                            │
│  Last Updated: [Date]                                           │
│  Owner: [Your Name]                                             │
│                                                                 │
│  Source: tasks/drd-mudlistings-redesign-v1.md                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Page 2: Table of Contents
```
📑 Table of Contents

1. Foundations
   ├── 1.1 Color Tokens (Dark Mode)
   ├── 1.2 Color Tokens (Light Mode)
   ├── 1.3 Typography
   ├── 1.4 Spacing & Grid
   └── 1.5 Border Radius & Shadows

2. Components
   ├── 2.1 Buttons
   ├── 2.2 Inputs & Forms
   ├── 2.3 Search Bar
   ├── 2.4 Navigation
   ├── 2.5 Cards (Genre, Game, Featured)
   ├── 2.6 List Items
   ├── 2.7 Tags & Badges
   ├── 2.8 Status Indicators
   └── 2.9 Footer

3. Icons
   ├── 3.1 Genre Icons (Pixel Art)
   └── 3.2 UI Icons

4. Patterns
   ├── 4.1 Empty States
   ├── 4.2 Loading States
   └── 4.3 Error States

5. Documentation
   └── 5.1 Component Usage Guidelines
```

#### Page 3: Color Tokens - Dark Mode
Set up as Figma Variables (Collections > Create new collection: "Colors")

**Backgrounds:**
| Variable Name | Hex | Description |
|---------------|-----|-------------|
| `bg/void` | #0D0D0F | Page background |
| `bg/terminal` | #12141A | Card/panel backgrounds |
| `bg/surface` | #1A1D24 | Elevated surfaces |
| `bg/hover` | #232830 | Hover states |
| `bg/active` | #2A303A | Active/selected |

**Text:**
| Variable Name | Hex | Description |
|---------------|-----|-------------|
| `text/primary` | #E8E8ED | Primary text |
| `text/secondary` | #9CA3B0 | Secondary text |
| `text/muted` | #6B7280 | Timestamps, metadata |
| `text/terminal` | #4ADE80 | Terminal green accent |

**Accents:**
| Variable Name | Hex | Description |
|---------------|-----|-------------|
| `accent/primary` | #6366F1 | Primary actions (indigo) |
| `accent/glow` | #818CF8 | Hover glow, focus |
| `accent/terminal` | #4ADE80 | Terminal green |
| `accent/amber` | #FBBF24 | Featured indicator |
| `accent/success` | #22C55E | Success states |
| `accent/error` | #EF4444 | Error states |

**Borders:**
| Variable Name | Hex | Description |
|---------------|-----|-------------|
| `border/subtle` | #27272A | Subtle separators |
| `border/default` | #3F3F46 | Default borders |
| `border/focus` | #6366F1 | Focus rings |

#### Page 4: Color Tokens - Light Mode
Create a mode in the Variables collection called "Light"

| Variable Name | Light Mode Hex |
|---------------|----------------|
| `bg/void` | #F8FAFC |
| `bg/terminal` | #FFFFFF |
| `bg/surface` | #FFFFFF |
| `bg/hover` | #F1F5F9 |
| `bg/active` | #E2E8F0 |
| `text/primary` | #1E293B |
| `text/secondary` | #64748B |
| `text/muted` | #94A3B8 |

#### Page 5: Typography
Create Text Styles:

| Style Name | Font | Size | Weight | Line Height |
|------------|------|------|--------|-------------|
| `display` | Inter | 48px | 700 | 1.1 |
| `heading-1` | Inter | 32px | 600 | 1.2 |
| `heading-2` | Inter | 24px | 600 | 1.3 |
| `heading-3` | Inter | 18px | 600 | 1.4 |
| `body` | Inter | 16px | 400 | 1.6 |
| `body-small` | Inter | 14px | 400 | 1.5 |
| `caption` | Inter | 12px | 500 | 1.4 |
| `mono` | JetBrains Mono | 14px | 400 | 1.5 |
| `mono-small` | JetBrains Mono | 12px | 400 | 1.4 |

#### Page 6: Spacing & Grid
Create Number Variables collection "Spacing":

| Variable Name | Value | Use |
|---------------|-------|-----|
| `space/1` | 4px | Tight inline |
| `space/2` | 8px | Icon gaps |
| `space/3` | 12px | Input padding |
| `space/4` | 16px | Card padding |
| `space/5` | 20px | Component gaps |
| `space/6` | 24px | Section padding |
| `space/8` | 32px | Large gaps |
| `space/12` | 48px | Section breaks |
| `space/16` | 64px | Hero padding |

**Border Radius:**
| Variable Name | Value |
|---------------|-------|
| `radius/sm` | 4px |
| `radius/md` | 6px |
| `radius/lg` | 8px |
| `radius/xl` | 12px |

## Directory Structure

```
design/
├── README.md                    # This file
├── tokens/
│   ├── colors.json              # Color token export
│   ├── typography.json          # Typography token export
│   └── spacing.json             # Spacing token export
├── icons/
│   ├── genre-fantasy.svg        # Pixel art genre icons
│   ├── genre-scifi.svg
│   ├── genre-horror.svg
│   ├── genre-roleplay.svg
│   ├── genre-pvp.svg
│   ├── genre-social.svg
│   └── ui-icons.svg             # UI icon sprite
├── assets/                      # Exported assets (@1x, @2x)
└── animation-specs.md           # Animation documentation
```

## Figma Plugins Recommended

- **Tokens Studio** - For design token management and export
- **Contrast** - For WCAG contrast checking
- **Stark** - Accessibility testing
- **Export Styles to JSON** - Token export

## Checklist

After creating the Figma file:
- [ ] Cover page created
- [ ] Table of contents page created
- [ ] Color variables set up (Dark mode)
- [ ] Color variables set up (Light mode)
- [ ] Typography styles created
- [ ] Spacing variables created
- [ ] Border radius variables created
