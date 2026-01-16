---
standards_version: 1.0.0
applied_standards:
  - global/principles.md
  - global/security-privacy.md
  - global/terminology.md
  - domains/code-architecture.md
  - phases/create-prd.md
related_documents:
  - tasks/drd-mudlistings-redesign-v1.md
  - tasks/crd-mudlistings-redesign-v1.md
---

# Product Requirements Document: mudlistings.com Platform

## 1. Introduction/Overview

**Project:** Build the complete data-driven backend and interactive frontend for mudlistings.com—a directory website for Multi-User Dungeon (MUD) games.

**Problem Statement:** MUD games have existed for decades but lack a modern, centralized discovery platform. Existing directories are outdated, provide stale data, and don't offer community features. Players struggle to find active games that match their interests, and MUD administrators have limited ways to promote their worlds.

**Solution:** A full-featured platform that combines:
- Real-time MUD server status via MSSP (Mud Server Status Protocol)
- Modern browsing and discovery experience
- Community features (reviews, favorites, activity feeds)
- Self-service admin tools for MUD owners

**Reference:** Visual design specifications are defined in `tasks/drd-mudlistings-redesign-v1.md`.

## 2. Goals

| ID | Goal | Success Metric |
|----|------|----------------|
| G-1 | Enable players to discover MUDs that match their interests | 70% of users find a game within 3 page views |
| G-2 | Provide accurate, real-time server status information | 95% of active MUDs show correct online status |
| G-3 | Build an engaged community around MUD gaming | 20% of registered users leave at least one review |
| G-4 | Empower MUD admins to manage their own listings | 80% of listing updates made by owners (not site admins) |
| G-5 | Create a sustainable platform with growth potential | 50+ new MUD listings in first 6 months |

## 3. User Stories

### 3.1 Player Stories

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-1 | As a player, I want to browse MUDs by genre so I can find games that match my interests | Genre filter shows accurate counts; clicking filters list correctly |
| US-2 | As a player, I want to see which MUDs are currently online so I don't waste time on dead games | Real-time status indicator visible; updates within 5 minutes |
| US-3 | As a player, I want to search for MUDs by name or keyword so I can find specific games | Search returns relevant results; supports partial matching |
| US-4 | As a player, I want to read reviews from other players so I can make informed decisions | Reviews display with ratings; sorted by helpfulness/date |
| US-5 | As a player, I want to save favorite MUDs so I can quickly access games I'm interested in | Favorites persist across sessions; accessible from profile |
| US-6 | As a player, I want to see connection instructions so I can actually play the game | Connection details (host, port, web client link) clearly displayed |
| US-7 | As a player, I want to create a profile so I can track my activity and connect with the community | Profile shows reviews, favorites, activity; customizable avatar |
| US-8 | As a player, I want to see an activity feed so I can discover trending games and community activity | Feed shows new listings, popular reviews, rising games |

### 3.2 MUD Administrator Stories

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-9 | As a MUD admin, I want to claim and manage my game's listing so I can keep information accurate | Verification flow; edit access granted after verification |
| US-10 | As a MUD admin, I want to update my game's description and details so players have current info | All fields editable; changes reflect immediately |
| US-11 | As a MUD admin, I want to see analytics for my listing so I can understand player interest | View counts, click-throughs, favorite counts visible |
| US-12 | As a MUD admin, I want to respond to reviews so I can engage with the community | Reply functionality on reviews; admin badge visible |
| US-13 | As a MUD admin, I want to mark my MUD as featured so I can increase visibility | Featured request flow; clear pricing/criteria if applicable |

### 3.3 Site Administrator Stories

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-14 | As a site admin, I want to moderate content so the platform remains safe and welcoming | Moderation queue; ability to hide/remove content |
| US-15 | As a site admin, I want to import MUD data so I can seed the platform with existing listings | Bulk import from spreadsheet; validation and error reporting |
| US-16 | As a site admin, I want to manage featured content so I can curate the homepage experience | Feature/unfeature MUDs; set display order |

## 4. Functional Requirements

### 4.1 Data Model & Core Entities

| ID | Requirement | Priority | Traces To |
|----|-------------|----------|-----------|
| FR-1 | The system shall store MUD listings with: name, description, genres (multiple), codebase, host, port, website URL, established date, and custom fields | Must Have | US-1, US-3, US-6 |
| FR-2 | The system shall store user accounts with: email, display name, avatar, role (player/admin/site-admin), and profile settings | Must Have | US-7, US-9 |
| FR-3 | The system shall store reviews with: MUD reference, user reference, rating (1-5), title, body, and timestamps | Must Have | US-4 |
| FR-4 | The system shall store favorites as a many-to-many relationship between users and MUDs | Must Have | US-5 |
| FR-5 | The system shall store activity events with: event type, user reference, MUD reference, timestamp, and metadata | Should Have | US-8 |
| FR-6 | The system shall support multiple genres per MUD from a predefined taxonomy: Fantasy, Sci-Fi, Horror, Roleplay, PvP, Social, Educational, Historical, Superhero, Custom | Must Have | US-1 |

### 4.2 MSSP Integration (Real-Time Status)

| ID | Requirement | Priority | Traces To |
|----|-------------|----------|-----------|
| FR-7 | The system shall poll MUD servers via MSSP (Mud Server Status Protocol) to retrieve real-time status | Must Have | US-2, G-2 |
| FR-8 | The system shall retrieve and store MSSP data including: player count, uptime, game name verification, and supported protocols | Must Have | US-2 |
| FR-9 | The system shall poll each active MUD at a configurable interval (default: 5 minutes) | Must Have | US-2 |
| FR-10 | The system shall mark MUDs as "offline" if MSSP polling fails for 3 consecutive attempts | Must Have | US-2 |
| FR-11 | The system shall provide a background service that manages MSSP polling with configurable concurrency limits | Must Have | G-2 |
| FR-12 | The system shall store historical status data (hourly snapshots) for trend analysis | Should Have | US-11 |
| FR-13 | The system shall fall back to basic TCP connection check if MSSP is not supported | Should Have | US-2 |

### 4.3 Search & Discovery

| ID | Requirement | Priority | Traces To |
|----|-------------|----------|-----------|
| FR-14 | The system shall provide full-text search across MUD names, descriptions, and tags | Must Have | US-3 |
| FR-15 | The system shall support filtering by: genre, online status, player count range, established date range, and codebase | Must Have | US-1 |
| FR-16 | The system shall support sorting by: player count, rating, newest, alphabetical, and trending | Must Have | US-1 |
| FR-17 | The system shall return search results within 500ms for queries under 100 characters | Must Have | G-1 |
| FR-18 | The system shall provide autocomplete suggestions as users type in the search box | Should Have | US-3 |
| FR-19 | The system shall track and display "trending" MUDs based on recent views, favorites, and reviews | Should Have | US-8 |

### 4.4 User Authentication & Profiles

| ID | Requirement | Priority | Traces To |
|----|-------------|----------|-----------|
| FR-20 | The system shall support user registration via email/password | Must Have | US-7 |
| FR-21 | The system shall support OAuth sign-in via Google and Discord | Should Have | US-7 |
| FR-22 | The system shall require email verification before allowing reviews or listing claims | Must Have | SEC-4 |
| FR-23 | The system shall provide password reset functionality via email token | Must Have | US-7 |
| FR-24 | The system shall display user profiles with: display name, avatar, join date, reviews written, favorites, and activity | Must Have | US-7 |
| FR-25 | The system shall allow users to set profile visibility (public/private) | Should Have | US-7 |
| FR-26 | The system shall implement role-based access control with roles: Anonymous, Player, MUD Admin, Site Admin | Must Have | US-9, US-14 |

### 4.5 Reviews & Ratings

| ID | Requirement | Priority | Traces To |
|----|-------------|----------|-----------|
| FR-27 | The system shall allow authenticated users to submit reviews with a 1-5 star rating, title (optional), and body text | Must Have | US-4 |
| FR-28 | The system shall limit users to one review per MUD (with ability to edit) | Must Have | US-4 |
| FR-29 | The system shall calculate and display aggregate ratings (average, count) for each MUD | Must Have | US-4 |
| FR-30 | The system shall allow users to mark reviews as "helpful" | Should Have | US-4 |
| FR-31 | The system shall allow MUD admins to reply to reviews on their claimed listings | Should Have | US-12 |
| FR-32 | The system shall support reporting reviews for moderation | Must Have | US-14 |

### 4.6 Favorites & Activity Feed

| ID | Requirement | Priority | Traces To |
|----|-------------|----------|-----------|
| FR-33 | The system shall allow authenticated users to add/remove MUDs from their favorites | Must Have | US-5 |
| FR-34 | The system shall display a user's favorites list on their profile and a dedicated page | Must Have | US-5 |
| FR-35 | The system shall generate activity events for: new listings, new reviews, MUD status changes, featured updates | Should Have | US-8 |
| FR-36 | The system shall display a personalized activity feed on the homepage for authenticated users | Should Have | US-8 |
| FR-37 | The system shall display a global activity feed showing recent platform activity | Should Have | US-8 |

### 4.7 MUD Admin Features

| ID | Requirement | Priority | Traces To |
|----|-------------|----------|-----------|
| FR-38 | The system shall allow users to claim ownership of a MUD listing via verification | Must Have | US-9 |
| FR-39 | The system shall verify MUD ownership by checking for a verification code in the MUD's MSSP response or website meta tag | Must Have | US-9 |
| FR-40 | The system shall allow verified MUD admins to edit all listing fields for their claimed MUDs | Must Have | US-10 |
| FR-41 | The system shall provide MUD admins with an analytics dashboard showing: views, unique visitors, favorites, and click-throughs | Should Have | US-11 |
| FR-42 | The system shall allow MUD admins to transfer ownership to another verified user | Should Have | US-9 |
| FR-43 | The system shall support multiple admins per MUD listing | Should Have | US-9 |

### 4.8 Site Administration

| ID | Requirement | Priority | Traces To |
|----|-------------|----------|-----------|
| FR-44 | The system shall provide a moderation queue for reported content (reviews, listings) | Must Have | US-14 |
| FR-45 | The system shall allow site admins to hide, edit, or delete any content | Must Have | US-14 |
| FR-46 | The system shall support bulk import of MUD listings from CSV/Excel format | Must Have | US-15 |
| FR-47 | The system shall validate imported data and report errors without failing the entire import | Must Have | US-15 |
| FR-48 | The system shall allow site admins to feature/unfeature MUDs and set homepage display order | Must Have | US-16 |
| FR-49 | The system shall provide audit logging for all administrative actions | Should Have | SEC-11 |

### 4.9 Pages & Navigation

| ID | Requirement | Priority | Traces To |
|----|-------------|----------|-----------|
| FR-50 | The system shall render a homepage with: hero search, featured MUDs, genre cards, recent activity, and trending games | Must Have | G-1 |
| FR-51 | The system shall render a browse page with: search, filters, sorting, and paginated results list | Must Have | US-1, US-3 |
| FR-52 | The system shall render a MUD detail page with: full description, connection info, status, reviews, and related MUDs | Must Have | US-6 |
| FR-53 | The system shall render user profile pages with: public info, reviews, favorites (if public) | Must Have | US-7 |
| FR-54 | The system shall render an admin dashboard for MUD owners to manage their listings | Must Have | US-10 |
| FR-55 | The system shall render static pages: About, What is a MUD?, FAQ, Terms, Privacy | Must Have | G-1 |
| FR-56 | The system shall support dark mode (default) and light mode with user preference persistence | Must Have | DRD |

## 5. Non-Goals (Out of Scope)

The following are explicitly **not** included in this release:

| Item | Rationale |
|------|-----------|
| In-browser MUD client | Complex feature; users will use external clients or linked web clients |
| Real-time chat or forums | Focus on discovery first; community features can be added later |
| MUD hosting services | Platform is directory-only; not a hosting provider |
| Payment processing | No paid features in initial release; featured listings are manually curated |
| Native mobile apps | Responsive web design covers mobile use cases |
| API for third-party developers | Can be added later once platform is stable |
| Internationalization (i18n) | English-only for initial release |
| Advanced analytics (heatmaps, etc.) | Basic analytics sufficient for MVP |

## 6. Design Considerations

### 6.1 Visual Design
All visual design specifications are defined in `tasks/drd-mudlistings-redesign-v1.md`, including:
- Color palette (dark/light modes)
- Typography (Inter + JetBrains Mono)
- Component specifications
- Animation and interaction patterns
- Accessibility requirements (WCAG 2.1 AA)

### 6.2 Key UI Components
| Component | Reference |
|-----------|-----------|
| Featured Hero Section | DRD Section 5.1 |
| Featured Game Card | DRD Section 5.2 |
| Game List Item | DRD Section 5.3 |
| Genre Category Cards | DRD Section 5.4 |
| Search Bar | DRD Section 5.5 |
| Buttons (Primary, Secondary, Terminal) | DRD Section 5.6 |
| Navigation (Desktop, Mobile) | DRD Section 5.7 |
| Dark/Light Mode Toggle | DRD Section 5.8 |

### 6.3 Responsive Breakpoints
| Breakpoint | Layout |
|------------|--------|
| <768px | Mobile: single column, hamburger nav |
| 768-1024px | Tablet: two-column grid |
| >1024px | Desktop: full layout with sidebar filters |

## 7. Technical Considerations

### 7.1 Technology Stack

#### Backend
| Layer | Technology |
|-------|------------|
| Runtime | .NET 10 |
| Framework | ASP.NET Core MVC / Web API |
| Database | SQL Server or PostgreSQL |
| ORM | Entity Framework Core 10 |
| Authentication | ASP.NET Identity + OAuth (Google, Discord) |
| Background Jobs | Hangfire or hosted BackgroundService |
| Search | Full-text search (SQL) or Meilisearch for scale |
| Caching | Redis or IMemoryCache |
| API Documentation | Swagger / OpenAPI |

#### Frontend
| Layer | Technology |
|-------|------------|
| Framework | React 19 (with TypeScript) |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| Component Library | shadcn/ui (built on Radix UI primitives) |
| State Management | TanStack Query (server state) + Zustand (client state) |
| Routing | React Router or TanStack Router |
| Form Handling | React Hook Form + Zod validation |
| Icons | Lucide React (matches shadcn/ui) |

#### Architecture Notes
- **Separation of concerns:** ASP.NET Core serves as the API backend; React SPA handles all UI rendering
- **API-first design:** All data flows through REST endpoints; enables future mobile app or third-party integrations
- **shadcn/ui approach:** Components are copied into the project (not a dependency), allowing full customization to match DRD specifications
- **Tailwind + DRD tokens:** CSS custom properties from the DRD will be mapped to Tailwind's theme configuration

### 7.2 MSSP Implementation
```
MSSP (Mud Server Status Protocol) works as follows:
1. Connect to MUD server via telnet (host:port)
2. Send MSSP request sequence
3. Parse response containing: PLAYERS, UPTIME, NAME, etc.
4. Store results and update MUD status

Reference: http://tintin.mudhalla.net/protocols/mssp/
```

### 7.3 Architecture Patterns
Per CODE standards:
- Clean Architecture (Domain/Application/Infrastructure/Presentation)
- Repository pattern for data access
- CQRS-lite for separating read/write operations
- Result pattern for error handling (not exceptions)
- Async all the way

### 7.4 Project Structure

```
mudlistings/
├── src/
│   ├── MudListings.Domain/           # Entities, value objects, domain logic
│   ├── MudListings.Application/      # Use cases, commands, queries, interfaces
│   ├── MudListings.Infrastructure/   # EF Core, MSSP client, external services
│   ├── MudListings.Api/              # ASP.NET Core API, controllers, middleware
│   └── MudListings.Tests/            # Unit and integration tests
│
├── web/                              # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui components
│   │   │   └── features/             # Feature-specific components
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── lib/                      # Utilities, API client
│   │   ├── pages/                    # Page components
│   │   ├── stores/                   # Zustand stores
│   │   └── styles/                   # Tailwind config, global styles
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
├── design/                           # Design tokens, assets (from DRD)
├── tasks/                            # PRD, DRD, CRD, task files
└── README.md
```

### 7.6 Data Import
The existing spreadsheet data will need mapping to the new schema. Required fields:
- MUD name (required)
- Host and port (required for MSSP)
- Description
- Genre(s)
- Website URL
- Codebase
- Established date

### 7.7 Dependencies

#### Backend (.NET)
| Dependency | Purpose |
|------------|---------|
| ASP.NET Identity | User authentication |
| Entity Framework Core 10 | ORM/data access |
| Hangfire | Background job processing |
| Serilog | Structured logging |
| FluentValidation | Input validation |
| System.Net.Sockets | MSSP telnet connections |

#### Frontend (npm)
| Dependency | Purpose |
|------------|---------|
| react, react-dom | UI framework |
| typescript | Type safety |
| tailwindcss | Utility-first CSS |
| @radix-ui/* | Accessible UI primitives (via shadcn/ui) |
| @tanstack/react-query | Server state management |
| zustand | Client state management |
| react-hook-form | Form handling |
| zod | Schema validation |
| lucide-react | Icons |
| clsx, tailwind-merge | Conditional class utilities (shadcn/ui pattern) |
| axios or ky | HTTP client |

## 8. Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Page load time | <2s (LCP) | Lighthouse, RUM |
| MSSP polling accuracy | 95%+ correct status | Compare manual checks vs. system |
| Search relevance | 80%+ first-page results relevant | User surveys, click-through rate |
| User registration rate | 10% of visitors register | Analytics |
| Review submission rate | 20% of registered users | Database query |
| MUD admin adoption | 50% of listings claimed | Database query |
| Uptime | 99.5% | Monitoring |

## 9. Open Questions

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| OQ-1 | What is the format/schema of the existing spreadsheet data? | Affects import implementation | Pending |
| OQ-2 | Should there be rate limiting on MSSP polling per MUD request? | Performance, server load | Pending |
| OQ-3 | What OAuth providers are highest priority (Google, Discord, GitHub)? | Authentication implementation | Answered: Google + Discord |
| OQ-4 | Is there a preferred hosting environment (Azure, AWS, self-hosted)? | Infrastructure decisions | Pending |
| OQ-5 | Should reviews require moderation before publishing? | User experience vs. safety | Pending |
| OQ-6 | What defines "trending"? (time window, weights for views/favorites/reviews) | Algorithm design | Pending |
| OQ-7 | Are there existing MUD admin contacts to notify about claiming listings? | Launch communication | Pending |

## 10. Assumptions

| ID | Assumption | If Wrong, Then... |
|----|------------|-------------------|
| A-1 | Most MUDs support MSSP or basic telnet connection | Need alternative status checking method |
| A-2 | The existing spreadsheet has host/port for most MUDs | Need manual data collection |
| A-3 | Users will authenticate primarily for reviews/favorites | May need to reconsider anonymous features |
| A-4 | Dark mode is preferred by target audience | May need to change default theme |
| A-5 | English is sufficient for initial launch | May lose international audience |

---

## Standards Compliance

### Applied Standards
| Standard | Status | Notes |
|----------|--------|-------|
| PRIN-1 (User-First) | Compliant | Discovery and community features prioritize user value |
| PRIN-2 (Quality Over Speed) | Compliant | Full feature set with proper architecture |
| PRIN-5 (Incremental Delivery) | Compliant | Can phase implementation via task breakdown |
| SEC-1 (No Secrets in Code) | Required | API keys, connection strings via config |
| SEC-2 (PII Protection) | Required | No PII in logs; email hashing for analytics |
| SEC-3 (Input Validation) | Required | FluentValidation on all inputs |
| SEC-4 (Authentication Required) | Required | Protected endpoints for user data |
| SEC-6 (HTTPS) | Required | All traffic over HTTPS |
| CODE-1 through CODE-9 | Required | .NET conventions, async, testing |
| PRD-1 through PRD-7 | Compliant | All standard sections included |

### Deviations
| Rule | Deviation | Rationale |
|------|-----------|-----------|
| None | - | - |
