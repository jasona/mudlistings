---
standards_version: 1.0.0
applied_standards:
  - global/principles.md
  - phases/generate-tasks.md
source_document: tasks/prd-mudlistings-platform-v1.md
---

# Task List: mudlistings.com Platform Implementation

## Relevant Files

### Backend (.NET)

#### Solution & Projects
- `src/MudListings.sln` - Solution file
- `src/MudListings.Domain/MudListings.Domain.csproj` - Domain layer project
- `src/MudListings.Application/MudListings.Application.csproj` - Application layer project
- `src/MudListings.Infrastructure/MudListings.Infrastructure.csproj` - Infrastructure layer project
- `src/MudListings.Api/MudListings.Api.csproj` - API layer project
- `src/MudListings.Tests/MudListings.Tests.csproj` - Test project

#### Domain Layer
- `src/MudListings.Domain/Entities/Mud.cs` - MUD listing entity
- `src/MudListings.Domain/Entities/User.cs` - User entity (extends IdentityUser)
- `src/MudListings.Domain/Entities/Review.cs` - Review entity
- `src/MudListings.Domain/Entities/Favorite.cs` - Favorite entity
- `src/MudListings.Domain/Entities/ActivityEvent.cs` - Activity event entity
- `src/MudListings.Domain/Entities/MudAdmin.cs` - MUD admin claim entity
- `src/MudListings.Domain/Entities/MudStatus.cs` - MSSP status snapshot entity
- `src/MudListings.Domain/Enums/Genre.cs` - Genre enumeration
- `src/MudListings.Domain/Enums/UserRole.cs` - User role enumeration
- `src/MudListings.Domain/Enums/ActivityEventType.cs` - Activity event types
- `src/MudListings.Domain/ValueObjects/ConnectionInfo.cs` - Host/port value object
- `src/MudListings.Domain/ValueObjects/MsspData.cs` - MSSP response value object

#### Application Layer
- `src/MudListings.Application/Interfaces/IMudRepository.cs` - MUD repository interface
- `src/MudListings.Application/Interfaces/IUserRepository.cs` - User repository interface
- `src/MudListings.Application/Interfaces/IReviewRepository.cs` - Review repository interface
- `src/MudListings.Application/Interfaces/IMsspClient.cs` - MSSP client interface
- `src/MudListings.Application/Interfaces/IActivityService.cs` - Activity service interface
- `src/MudListings.Application/Commands/` - Command handlers (CQRS)
- `src/MudListings.Application/Queries/` - Query handlers (CQRS)
- `src/MudListings.Application/DTOs/` - Data transfer objects
- `src/MudListings.Application/Validators/` - FluentValidation validators

#### Infrastructure Layer
- `src/MudListings.Infrastructure/Data/AppDbContext.cs` - EF Core DbContext
- `src/MudListings.Infrastructure/Data/Migrations/` - EF Core migrations
- `src/MudListings.Infrastructure/Repositories/MudRepository.cs` - MUD repository
- `src/MudListings.Infrastructure/Repositories/UserRepository.cs` - User repository
- `src/MudListings.Infrastructure/Repositories/ReviewRepository.cs` - Review repository
- `src/MudListings.Infrastructure/Services/MsspClient.cs` - MSSP telnet client
- `src/MudListings.Infrastructure/Services/MsspPollingService.cs` - Background polling service
- `src/MudListings.Infrastructure/Services/ActivityService.cs` - Activity event service
- `src/MudListings.Infrastructure/Services/EmailService.cs` - Email sending service

#### API Layer
- `src/MudListings.Api/Program.cs` - Application entry point
- `src/MudListings.Api/Controllers/MudsController.cs` - MUD endpoints
- `src/MudListings.Api/Controllers/AuthController.cs` - Authentication endpoints
- `src/MudListings.Api/Controllers/UsersController.cs` - User profile endpoints
- `src/MudListings.Api/Controllers/ReviewsController.cs` - Review endpoints
- `src/MudListings.Api/Controllers/FavoritesController.cs` - Favorites endpoints
- `src/MudListings.Api/Controllers/AdminController.cs` - Site admin endpoints
- `src/MudListings.Api/Controllers/MudAdminController.cs` - MUD admin endpoints
- `src/MudListings.Api/Middleware/ExceptionMiddleware.cs` - Global error handling
- `src/MudListings.Api/appsettings.json` - Configuration

#### Tests
- `src/MudListings.Tests/Domain/` - Domain unit tests
- `src/MudListings.Tests/Application/` - Application layer tests
- `src/MudListings.Tests/Infrastructure/` - Infrastructure tests
- `src/MudListings.Tests/Api/` - API integration tests

### Frontend (React)

#### Configuration
- `web/package.json` - npm dependencies
- `web/tsconfig.json` - TypeScript configuration
- `web/vite.config.ts` - Vite configuration
- `web/tailwind.config.ts` - Tailwind CSS configuration
- `web/postcss.config.js` - PostCSS configuration
- `web/components.json` - shadcn/ui configuration

#### Source Files
- `web/src/main.tsx` - Application entry point
- `web/src/App.tsx` - Root component with routing
- `web/src/index.css` - Global styles and design tokens
- `web/src/lib/api.ts` - API client (axios/ky)
- `web/src/lib/utils.ts` - Utility functions (cn helper)
- `web/src/lib/auth.ts` - Authentication utilities

#### Components (shadcn/ui)
- `web/src/components/ui/button.tsx` - Button component
- `web/src/components/ui/input.tsx` - Input component
- `web/src/components/ui/card.tsx` - Card component
- `web/src/components/ui/dialog.tsx` - Dialog/modal component
- `web/src/components/ui/dropdown-menu.tsx` - Dropdown menu
- `web/src/components/ui/badge.tsx` - Badge/tag component
- `web/src/components/ui/avatar.tsx` - Avatar component
- `web/src/components/ui/skeleton.tsx` - Loading skeleton
- `web/src/components/ui/toast.tsx` - Toast notifications

#### Feature Components
- `web/src/components/features/header.tsx` - Site header/navigation
- `web/src/components/features/footer.tsx` - Site footer
- `web/src/components/features/search-bar.tsx` - Search with autocomplete
- `web/src/components/features/mud-card.tsx` - MUD listing card
- `web/src/components/features/mud-list-item.tsx` - Compact MUD list row
- `web/src/components/features/genre-card.tsx` - Genre category card
- `web/src/components/features/review-card.tsx` - Review display card
- `web/src/components/features/review-form.tsx` - Review submission form
- `web/src/components/features/activity-feed.tsx` - Activity feed component
- `web/src/components/features/filter-sidebar.tsx` - Browse filters
- `web/src/components/features/theme-toggle.tsx` - Dark/light mode toggle
- `web/src/components/features/status-indicator.tsx` - Online/offline indicator

#### Pages
- `web/src/pages/home.tsx` - Homepage
- `web/src/pages/browse.tsx` - Browse/search page
- `web/src/pages/mud-detail.tsx` - MUD detail page
- `web/src/pages/profile.tsx` - User profile page
- `web/src/pages/favorites.tsx` - User favorites page
- `web/src/pages/auth/login.tsx` - Login page
- `web/src/pages/auth/register.tsx` - Registration page
- `web/src/pages/auth/verify-email.tsx` - Email verification page
- `web/src/pages/admin/dashboard.tsx` - MUD admin dashboard
- `web/src/pages/admin/edit-mud.tsx` - MUD editing page
- `web/src/pages/admin/analytics.tsx` - MUD analytics page
- `web/src/pages/site-admin/moderation.tsx` - Moderation queue
- `web/src/pages/site-admin/import.tsx` - Bulk import page
- `web/src/pages/static/about.tsx` - About page
- `web/src/pages/static/what-is-mud.tsx` - What is a MUD page
- `web/src/pages/static/faq.tsx` - FAQ page

#### Hooks & State
- `web/src/hooks/use-auth.ts` - Authentication hook
- `web/src/hooks/use-muds.ts` - MUD data hooks (TanStack Query)
- `web/src/hooks/use-reviews.ts` - Review data hooks
- `web/src/hooks/use-favorites.ts` - Favorites hooks
- `web/src/stores/auth-store.ts` - Auth state (Zustand)
- `web/src/stores/theme-store.ts` - Theme state (Zustand)
- `web/src/stores/filter-store.ts` - Filter state (Zustand)

### Notes

- Backend tests use xUnit with FluentAssertions
- Run backend tests: `dotnet test src/MudListings.Tests/`
- Run frontend tests: `cd web && npm test`
- Frontend uses Vitest for unit testing
- E2E tests use Playwright

---

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

---

## Tasks

### 0.0 Create feature branch
- [x] 0.1 Create and checkout a new branch: `git checkout -b feature/mudlistings-platform`

---

### 1.0 Project scaffolding & infrastructure setup (traces to: FR-1, Section 7.4)

- [ ] 1.1 Create .NET solution and project structure
  - [ ] 1.1.1 Create solution file `MudListings.sln` in `src/` directory
  - [ ] 1.1.2 Create `MudListings.Domain` class library project (.NET 10)
  - [ ] 1.1.3 Create `MudListings.Application` class library project
  - [ ] 1.1.4 Create `MudListings.Infrastructure` class library project
  - [ ] 1.1.5 Create `MudListings.Api` web API project
  - [ ] 1.1.6 Create `MudListings.Tests` xUnit test project
  - [ ] 1.1.7 Configure project references (Domain → Application → Infrastructure → Api)

- [ ] 1.2 Install backend NuGet packages
  - [ ] 1.2.1 Add EF Core 10, Identity, and SQL Server packages to Infrastructure
  - [ ] 1.2.2 Add FluentValidation, MediatR to Application
  - [ ] 1.2.3 Add Serilog, Hangfire, Swagger to Api
  - [ ] 1.2.4 Add xUnit, FluentAssertions, Moq to Tests

- [ ] 1.3 Initialize React frontend with Vite
  - [ ] 1.3.1 Run `npm create vite@latest web -- --template react-ts` in project root
  - [ ] 1.3.2 Install Tailwind CSS v4 and configure `tailwind.config.ts`
  - [ ] 1.3.3 Initialize shadcn/ui with `npx shadcn@latest init`
  - [ ] 1.3.4 Install TanStack Query, Zustand, React Router, Zod, React Hook Form
  - [ ] 1.3.5 Install Lucide React icons

- [ ] 1.4 Extract design from Figma prototype (source: https://alert-crush-71468698.figma.site)
  - [ ] 1.4.1 Review Figma prototype and document all page layouts (homepage, browse, detail, auth, admin)
  - [ ] 1.4.2 Extract color palette from Figma (primary, secondary, accent, semantic, neutral colors)
  - [ ] 1.4.3 Extract typography specs from Figma (font families, sizes, weights, line heights)
  - [ ] 1.4.4 Extract spacing and layout grid specifications from Figma
  - [ ] 1.4.5 Document component designs from Figma (cards, buttons, inputs, navigation, modals)
  - [ ] 1.4.6 Capture any animations, transitions, or micro-interactions defined in prototype
  - [ ] 1.4.7 Export design assets (icons, images, illustrations) from Figma if available
  - [ ] 1.4.8 Create design tokens document mapping Figma specs to implementation values

- [ ] 1.5 Configure design tokens from Figma/DRD
  - [ ] 1.5.1 Map Figma color palette to Tailwind CSS custom properties in `tailwind.config.ts`
  - [ ] 1.5.2 Configure typography from Figma specs in Tailwind
  - [ ] 1.5.3 Set up spacing scale per Figma/DRD specifications
  - [ ] 1.5.4 Configure dark/light mode CSS variables in `index.css` per Figma

- [ ] 1.6 Set up development environment
  - [ ] 1.6.1 Configure `appsettings.Development.json` with local connection string
  - [ ] 1.6.2 Set up Serilog console logging for development
  - [ ] 1.6.3 Configure CORS for local React dev server (localhost:5173)
  - [ ] 1.6.4 Add `.env` to `.gitignore`, create `.env.example`

---

### 2.0 Domain layer & database (traces to: FR-1 to FR-6)

- [ ] 2.1 Create domain entities
  - [ ] 2.1.1 Create `Mud` entity with all fields (name, description, host, port, website, established date, etc.)
  - [ ] 2.1.2 Create `Genre` enum with values: Fantasy, SciFi, Horror, Roleplay, PvP, Social, Educational, Historical, Superhero, Custom
  - [ ] 2.1.3 Create `MudGenre` join entity for many-to-many relationship
  - [ ] 2.1.4 Create `User` entity extending IdentityUser (display name, avatar, role, profile settings)
  - [ ] 2.1.5 Create `UserRole` enum: Anonymous, Player, MudAdmin, SiteAdmin
  - [ ] 2.1.6 Create `Review` entity (mud reference, user reference, rating 1-5, title, body, timestamps)
  - [ ] 2.1.7 Create `ReviewHelpful` entity for helpful votes
  - [ ] 2.1.8 Create `ReviewReply` entity for admin replies
  - [ ] 2.1.9 Create `Favorite` entity (user-mud relationship)
  - [ ] 2.1.10 Create `ActivityEvent` entity (type, user, mud, timestamp, metadata JSON)
  - [ ] 2.1.11 Create `ActivityEventType` enum: NewListing, NewReview, StatusChange, Featured
  - [ ] 2.1.12 Create `MudAdmin` entity for ownership claims (user, mud, verified, verification code)
  - [ ] 2.1.13 Create `MudStatus` entity for MSSP snapshots (mud, player count, uptime, timestamp)

- [ ] 2.2 Create value objects
  - [ ] 2.2.1 Create `ConnectionInfo` value object (host, port, web client URL)
  - [ ] 2.2.2 Create `MsspData` value object (players, uptime, game name, protocols)
  - [ ] 2.2.3 Create `Rating` value object (average, count) with calculation logic

- [ ] 2.3 Configure EF Core DbContext
  - [ ] 2.3.1 Create `AppDbContext` in Infrastructure with DbSets for all entities
  - [ ] 2.3.2 Configure entity relationships (one-to-many, many-to-many)
  - [ ] 2.3.3 Configure value object mappings (owned types)
  - [ ] 2.3.4 Add indexes for search optimization (name, genre, status)
  - [ ] 2.3.5 Configure soft delete for Mud and Review entities
  - [ ] 2.3.6 Add audit fields (CreatedAt, UpdatedAt) to base entity

- [ ] 2.4 Create and apply migrations
  - [ ] 2.4.1 Generate initial migration: `dotnet ef migrations add InitialCreate`
  - [ ] 2.4.2 Review migration SQL for correctness
  - [ ] 2.4.3 Apply migration to development database: `dotnet ef database update`
  - [ ] 2.4.4 Seed Genre lookup data

- [ ] 2.5 Write domain layer tests
  - [ ] 2.5.1 Write unit tests for `Rating` value object calculations
  - [ ] 2.5.2 Write unit tests for entity validation logic
  - [ ] 2.5.3 Write unit tests for `MsspData` parsing

---

### 3.0 Authentication & user management (traces to: FR-20 to FR-26)

- [ ] 3.1 Configure ASP.NET Identity
  - [ ] 3.1.1 Add Identity services to DI container in `Program.cs`
  - [ ] 3.1.2 Configure password requirements and lockout settings
  - [ ] 3.1.3 Configure JWT token generation settings
  - [ ] 3.1.4 Create `JwtSettings` options class

- [ ] 3.2 Implement email/password registration (FR-20)
  - [ ] 3.2.1 Create `RegisterCommand` with validation (email, password, display name)
  - [ ] 3.2.2 Create `RegisterCommandHandler` using Identity UserManager
  - [ ] 3.2.3 Create `POST /api/auth/register` endpoint
  - [ ] 3.2.4 Generate email verification token on registration
  - [ ] 3.2.5 Write integration tests for registration flow

- [ ] 3.3 Implement email verification (FR-22)
  - [ ] 3.3.1 Create `IEmailService` interface in Application layer
  - [ ] 3.3.2 Implement `EmailService` using SMTP or SendGrid
  - [ ] 3.3.3 Create email verification template
  - [ ] 3.3.4 Create `POST /api/auth/verify-email` endpoint
  - [ ] 3.3.5 Block reviews/claims until email verified

- [ ] 3.4 Implement login and JWT tokens
  - [ ] 3.4.1 Create `LoginCommand` with validation
  - [ ] 3.4.2 Create `LoginCommandHandler` returning JWT + refresh token
  - [ ] 3.4.3 Create `POST /api/auth/login` endpoint
  - [ ] 3.4.4 Create `POST /api/auth/refresh` endpoint for token refresh
  - [ ] 3.4.5 Write integration tests for login flow

- [ ] 3.5 Implement password reset (FR-23)
  - [ ] 3.5.1 Create `ForgotPasswordCommand` and handler
  - [ ] 3.5.2 Create `ResetPasswordCommand` and handler
  - [ ] 3.5.3 Create `POST /api/auth/forgot-password` endpoint
  - [ ] 3.5.4 Create `POST /api/auth/reset-password` endpoint
  - [ ] 3.5.5 Create password reset email template

- [ ] 3.6 Implement OAuth providers (FR-21)
  - [ ] 3.6.1 Configure Google OAuth in `Program.cs`
  - [ ] 3.6.2 Configure Discord OAuth in `Program.cs`
  - [ ] 3.6.3 Create `POST /api/auth/external/{provider}` endpoint
  - [ ] 3.6.4 Handle account linking for existing emails
  - [ ] 3.6.5 Write integration tests for OAuth flow

- [ ] 3.7 Implement role-based access control (FR-26)
  - [ ] 3.7.1 Create authorization policies: RequirePlayer, RequireMudAdmin, RequireSiteAdmin
  - [ ] 3.7.2 Add `[Authorize]` attributes to protected endpoints
  - [ ] 3.7.3 Create role management endpoints for site admins
  - [ ] 3.7.4 Write tests for authorization policies

- [ ] 3.8 Implement user profile endpoints (FR-24, FR-25)
  - [ ] 3.8.1 Create `GET /api/users/{id}` endpoint (public profile)
  - [ ] 3.8.2 Create `GET /api/users/me` endpoint (current user)
  - [ ] 3.8.3 Create `PUT /api/users/me` endpoint (update profile)
  - [ ] 3.8.4 Create `PUT /api/users/me/avatar` endpoint (upload avatar)
  - [ ] 3.8.5 Implement profile visibility setting (public/private)
  - [ ] 3.8.6 Write integration tests for profile endpoints

---

### 4.0 MUD listings core API (traces to: FR-1, FR-14 to FR-17)

- [ ] 4.1 Create repository interfaces and implementations
  - [ ] 4.1.1 Create `IMudRepository` interface with CRUD + search methods
  - [ ] 4.1.2 Implement `MudRepository` with EF Core
  - [ ] 4.1.3 Implement full-text search using SQL CONTAINS or LIKE
  - [ ] 4.1.4 Implement filtering by genre, status, player count, date range
  - [ ] 4.1.5 Implement sorting by player count, rating, newest, alphabetical, trending
  - [ ] 4.1.6 Implement pagination with cursor-based or offset pagination

- [ ] 4.2 Create MUD query handlers
  - [ ] 4.2.1 Create `GetMudByIdQuery` and handler
  - [ ] 4.2.2 Create `GetMudBySlugQuery` and handler
  - [ ] 4.2.3 Create `SearchMudsQuery` with filters/sorting and handler
  - [ ] 4.2.4 Create `GetFeaturedMudsQuery` and handler
  - [ ] 4.2.5 Create `GetTrendingMudsQuery` and handler (FR-19)
  - [ ] 4.2.6 Create `GetMudsByGenreQuery` and handler
  - [ ] 4.2.7 Create `GetAutocompleteQuery` and handler (FR-18)

- [ ] 4.3 Create MUD DTOs
  - [ ] 4.3.1 Create `MudListDto` (summary for list views)
  - [ ] 4.3.2 Create `MudDetailDto` (full details for detail page)
  - [ ] 4.3.3 Create `MudSearchResultDto` with pagination metadata
  - [ ] 4.3.4 Create `GenreDto` with MUD counts

- [ ] 4.4 Implement MUD API endpoints
  - [ ] 4.4.1 Create `GET /api/muds` endpoint with search, filter, sort, pagination
  - [ ] 4.4.2 Create `GET /api/muds/{idOrSlug}` endpoint
  - [ ] 4.4.3 Create `GET /api/muds/featured` endpoint
  - [ ] 4.4.4 Create `GET /api/muds/trending` endpoint
  - [ ] 4.4.5 Create `GET /api/genres` endpoint with counts
  - [ ] 4.4.6 Create `GET /api/muds/autocomplete?q={query}` endpoint
  - [ ] 4.4.7 Verify search returns within 500ms (FR-17)

- [ ] 4.5 Write MUD API tests
  - [ ] 4.5.1 Write unit tests for search query handlers
  - [ ] 4.5.2 Write unit tests for filtering logic
  - [ ] 4.5.3 Write integration tests for all MUD endpoints
  - [ ] 4.5.4 Write performance test for 500ms search requirement

---

### 5.0 MSSP integration service (traces to: FR-7 to FR-13)

- [ ] 5.1 Research and implement MSSP protocol
  - [ ] 5.1.1 Study MSSP protocol specification (http://tintin.mudhalla.net/protocols/mssp/)
  - [ ] 5.1.2 Create `IMsspClient` interface with `GetStatusAsync(host, port)` method
  - [ ] 5.1.3 Implement `MsspClient` using `TcpClient` for telnet connections
  - [ ] 5.1.4 Implement MSSP request sequence (IAC DO MSSP)
  - [ ] 5.1.5 Parse MSSP response into `MsspData` value object
  - [ ] 5.1.6 Handle connection timeouts (10 second default)
  - [ ] 5.1.7 Implement TCP fallback for non-MSSP servers (FR-13)

- [ ] 5.2 Implement background polling service (FR-11)
  - [ ] 5.2.1 Create `MsspPollingService` as hosted background service
  - [ ] 5.2.2 Configure polling interval (default 5 minutes) from appsettings
  - [ ] 5.2.3 Implement concurrent polling with configurable limit (e.g., 10 concurrent)
  - [ ] 5.2.4 Implement retry logic with exponential backoff
  - [ ] 5.2.5 Mark MUD offline after 3 consecutive failures (FR-10)
  - [ ] 5.2.6 Log polling results with Serilog

- [ ] 5.3 Store and expose status data
  - [ ] 5.3.1 Update `Mud.CurrentStatus` after each successful poll
  - [ ] 5.3.2 Store `MudStatus` snapshots for historical data (FR-12)
  - [ ] 5.3.3 Create `GET /api/muds/{id}/status` endpoint for current status
  - [ ] 5.3.4 Create `GET /api/muds/{id}/status/history` endpoint for trends
  - [ ] 5.3.5 Add status fields to MUD DTOs (playerCount, isOnline, lastChecked)

- [ ] 5.4 Write MSSP tests
  - [ ] 5.4.1 Write unit tests for MSSP response parsing
  - [ ] 5.4.2 Write integration tests with mock TCP server
  - [ ] 5.4.3 Write tests for offline detection logic
  - [ ] 5.4.4 Write tests for polling service scheduling

---

### 6.0 Reviews & ratings API (traces to: FR-27 to FR-32)

- [ ] 6.1 Create review repository and handlers
  - [ ] 6.1.1 Create `IReviewRepository` interface
  - [ ] 6.1.2 Implement `ReviewRepository` with EF Core
  - [ ] 6.1.3 Create `CreateReviewCommand` and handler (FR-27)
  - [ ] 6.1.4 Create `UpdateReviewCommand` and handler
  - [ ] 6.1.5 Create `DeleteReviewCommand` and handler
  - [ ] 6.1.6 Enforce one review per user per MUD (FR-28)

- [ ] 6.2 Implement aggregate ratings (FR-29)
  - [ ] 6.2.1 Create method to calculate average rating for a MUD
  - [ ] 6.2.2 Update MUD aggregate rating on review create/update/delete
  - [ ] 6.2.3 Include rating data in MUD DTOs

- [ ] 6.3 Implement helpful votes (FR-30)
  - [ ] 6.3.1 Create `MarkReviewHelpfulCommand` and handler
  - [ ] 6.3.2 Prevent users from voting on their own reviews
  - [ ] 6.3.3 Track helpful count on reviews
  - [ ] 6.3.4 Add sorting by helpfulness to review queries

- [ ] 6.4 Implement admin replies (FR-31)
  - [ ] 6.4.1 Create `ReplyToReviewCommand` and handler
  - [ ] 6.4.2 Verify user is admin of the MUD being reviewed
  - [ ] 6.4.3 Include admin badge indicator in response

- [ ] 6.5 Implement review reporting (FR-32)
  - [ ] 6.5.1 Create `ReportReviewCommand` and handler
  - [ ] 6.5.2 Create `ReviewReport` entity (review, reporter, reason, status)
  - [ ] 6.5.3 Add reported reviews to moderation queue

- [ ] 6.6 Implement review API endpoints
  - [ ] 6.6.1 Create `GET /api/muds/{mudId}/reviews` endpoint (paginated)
  - [ ] 6.6.2 Create `POST /api/muds/{mudId}/reviews` endpoint
  - [ ] 6.6.3 Create `PUT /api/reviews/{id}` endpoint
  - [ ] 6.6.4 Create `DELETE /api/reviews/{id}` endpoint
  - [ ] 6.6.5 Create `POST /api/reviews/{id}/helpful` endpoint
  - [ ] 6.6.6 Create `POST /api/reviews/{id}/reply` endpoint
  - [ ] 6.6.7 Create `POST /api/reviews/{id}/report` endpoint
  - [ ] 6.6.8 Create `GET /api/users/{userId}/reviews` endpoint

- [ ] 6.7 Write review tests
  - [ ] 6.7.1 Write unit tests for rating calculations
  - [ ] 6.7.2 Write unit tests for one-review-per-user validation
  - [ ] 6.7.3 Write integration tests for review CRUD
  - [ ] 6.7.4 Write integration tests for helpful voting

---

### 7.0 Favorites & activity feed API (traces to: FR-33 to FR-37)

- [ ] 7.1 Implement favorites (FR-33, FR-34)
  - [ ] 7.1.1 Create `IFavoriteRepository` interface
  - [ ] 7.1.2 Implement `FavoriteRepository` with EF Core
  - [ ] 7.1.3 Create `AddFavoriteCommand` and handler
  - [ ] 7.1.4 Create `RemoveFavoriteCommand` and handler
  - [ ] 7.1.5 Create `GetUserFavoritesQuery` and handler
  - [ ] 7.1.6 Create `CheckIsFavoriteQuery` for quick checks

- [ ] 7.2 Implement favorites API endpoints
  - [ ] 7.2.1 Create `POST /api/muds/{mudId}/favorite` endpoint (toggle)
  - [ ] 7.2.2 Create `GET /api/users/me/favorites` endpoint
  - [ ] 7.2.3 Create `GET /api/users/{userId}/favorites` endpoint (if public)
  - [ ] 7.2.4 Include `isFavorited` flag in MUD DTOs for authenticated users

- [ ] 7.3 Implement activity event service (FR-35)
  - [ ] 7.3.1 Create `IActivityService` interface
  - [ ] 7.3.2 Implement `ActivityService` to create events
  - [ ] 7.3.3 Trigger events on: new listing, new review, status change, featured
  - [ ] 7.3.4 Store metadata as JSON for flexible event details

- [ ] 7.4 Implement activity feed queries (FR-36, FR-37)
  - [ ] 7.4.1 Create `GetGlobalActivityFeedQuery` and handler
  - [ ] 7.4.2 Create `GetPersonalizedActivityFeedQuery` and handler
  - [ ] 7.4.3 Personalized feed shows activity for favorited MUDs

- [ ] 7.5 Implement activity feed API endpoints
  - [ ] 7.5.1 Create `GET /api/activity` endpoint (global feed)
  - [ ] 7.5.2 Create `GET /api/activity/personalized` endpoint (authenticated)
  - [ ] 7.5.3 Implement pagination for activity feeds

- [ ] 7.6 Implement trending algorithm (FR-19)
  - [ ] 7.6.1 Define trending score formula (views + favorites + reviews weighted by recency)
  - [ ] 7.6.2 Create background job to calculate trending scores periodically
  - [ ] 7.6.3 Store trending score on MUD entity for fast queries

- [ ] 7.7 Write favorites and activity tests
  - [ ] 7.7.1 Write unit tests for activity service
  - [ ] 7.7.2 Write unit tests for trending calculation
  - [ ] 7.7.3 Write integration tests for favorites endpoints
  - [ ] 7.7.4 Write integration tests for activity feed endpoints

---

### 8.0 MUD admin features API (traces to: FR-38 to FR-43)

- [ ] 8.1 Implement ownership claim verification (FR-38, FR-39)
  - [ ] 8.1.1 Create `ClaimMudCommand` with verification method choice
  - [ ] 8.1.2 Generate unique verification code for each claim request
  - [ ] 8.1.3 Implement MSSP verification: check for code in MSSP response
  - [ ] 8.1.4 Implement website meta tag verification: check for meta tag on MUD website
  - [ ] 8.1.5 Create `VerifyClaimCommand` and handler to complete verification
  - [ ] 8.1.6 Grant MudAdmin role for the specific MUD on successful verification

- [ ] 8.2 Implement MUD admin management endpoints
  - [ ] 8.2.1 Create `POST /api/muds/{mudId}/claim` endpoint (initiate claim)
  - [ ] 8.2.2 Create `POST /api/muds/{mudId}/claim/verify` endpoint (complete claim)
  - [ ] 8.2.3 Create `GET /api/users/me/muds` endpoint (list managed MUDs)

- [ ] 8.3 Implement MUD editing for admins (FR-40)
  - [ ] 8.3.1 Create `UpdateMudCommand` and handler (all fields editable)
  - [ ] 8.3.2 Create `PUT /api/muds/{mudId}` endpoint with MudAdmin authorization
  - [ ] 8.3.3 Validate MUD admin ownership before allowing edits
  - [ ] 8.3.4 Log all edit actions for audit

- [ ] 8.4 Implement analytics dashboard (FR-41)
  - [ ] 8.4.1 Track page views per MUD (use middleware or service)
  - [ ] 8.4.2 Track unique visitors (by IP hash or user ID)
  - [ ] 8.4.3 Track click-throughs (website link, connect button)
  - [ ] 8.4.4 Create `GetMudAnalyticsQuery` and handler
  - [ ] 8.4.5 Create `GET /api/muds/{mudId}/analytics` endpoint

- [ ] 8.5 Implement ownership transfer (FR-42)
  - [ ] 8.5.1 Create `TransferOwnershipCommand` and handler
  - [ ] 8.5.2 Require confirmation from both parties (or email verification)
  - [ ] 8.5.3 Create `POST /api/muds/{mudId}/transfer` endpoint

- [ ] 8.6 Implement multiple admins per MUD (FR-43)
  - [ ] 8.6.1 Create `InviteAdminCommand` and handler
  - [ ] 8.6.2 Create `RemoveAdminCommand` and handler
  - [ ] 8.6.3 Create `GET /api/muds/{mudId}/admins` endpoint
  - [ ] 8.6.4 Create `POST /api/muds/{mudId}/admins/invite` endpoint
  - [ ] 8.6.5 Create `DELETE /api/muds/{mudId}/admins/{userId}` endpoint

- [ ] 8.7 Write MUD admin tests
  - [ ] 8.7.1 Write unit tests for verification code generation
  - [ ] 8.7.2 Write integration tests for claim flow
  - [ ] 8.7.3 Write integration tests for MUD editing authorization
  - [ ] 8.7.4 Write integration tests for analytics endpoint

---

### 9.0 Site administration API (traces to: FR-44 to FR-49)

- [ ] 9.1 Implement moderation queue (FR-44, FR-45)
  - [ ] 9.1.1 Create `GetModerationQueueQuery` for reported content
  - [ ] 9.1.2 Create `ModerateContentCommand` (approve, hide, delete)
  - [ ] 9.1.3 Create `GET /api/admin/moderation` endpoint
  - [ ] 9.1.4 Create `POST /api/admin/moderation/{type}/{id}` endpoint
  - [ ] 9.1.5 Add SiteAdmin authorization to all admin endpoints

- [ ] 9.2 Implement bulk import (FR-46, FR-47)
  - [ ] 9.2.1 Create `ImportMudsCommand` accepting CSV/Excel data
  - [ ] 9.2.2 Implement CSV parsing with column mapping
  - [ ] 9.2.3 Implement Excel parsing (EPPlus or ClosedXML)
  - [ ] 9.2.4 Validate each row and collect errors without failing
  - [ ] 9.2.5 Return import report (success count, error details)
  - [ ] 9.2.6 Create `POST /api/admin/import` endpoint (multipart form)

- [ ] 9.3 Implement featured content management (FR-48)
  - [ ] 9.3.1 Add `IsFeatured` and `FeaturedOrder` fields to MUD entity
  - [ ] 9.3.2 Create `SetFeaturedCommand` and handler
  - [ ] 9.3.3 Create `POST /api/admin/muds/{mudId}/feature` endpoint
  - [ ] 9.3.4 Create `DELETE /api/admin/muds/{mudId}/feature` endpoint
  - [ ] 9.3.5 Create `PUT /api/admin/featured/order` endpoint (reorder)

- [ ] 9.4 Implement audit logging (FR-49)
  - [ ] 9.4.1 Create `AuditLog` entity (action, user, target, timestamp, details)
  - [ ] 9.4.2 Create `IAuditService` interface
  - [ ] 9.4.3 Implement `AuditService` to log all admin actions
  - [ ] 9.4.4 Create `GET /api/admin/audit` endpoint (paginated, filterable)

- [ ] 9.5 Implement additional site admin features
  - [ ] 9.5.1 Create `GET /api/admin/stats` endpoint (dashboard overview)
  - [ ] 9.5.2 Create `GET /api/admin/users` endpoint (user management)
  - [ ] 9.5.3 Create `PUT /api/admin/users/{id}/role` endpoint (change role)
  - [ ] 9.5.4 Create `POST /api/admin/muds` endpoint (manual MUD creation)

- [ ] 9.6 Write site admin tests
  - [ ] 9.6.1 Write unit tests for import validation logic
  - [ ] 9.6.2 Write integration tests for moderation endpoints
  - [ ] 9.6.3 Write integration tests for import endpoint
  - [ ] 9.6.4 Write integration tests for featured management

---

### 10.0 Frontend foundation (traces to: Section 7.1 Frontend)

- [ ] 10.1 Set up core shadcn/ui components
  - [ ] 10.1.1 Add Button component with Primary, Secondary, Terminal variants per DRD
  - [ ] 10.1.2 Add Input component with focus states per DRD
  - [ ] 10.1.3 Add Card component for MUD cards
  - [ ] 10.1.4 Add Dialog component for modals
  - [ ] 10.1.5 Add DropdownMenu component for menus
  - [ ] 10.1.6 Add Badge component for genre tags
  - [ ] 10.1.7 Add Avatar component for user avatars
  - [ ] 10.1.8 Add Skeleton component for loading states
  - [ ] 10.1.9 Add Toast component for notifications
  - [ ] 10.1.10 Customize all components to match DRD color tokens

- [ ] 10.2 Create API client and hooks
  - [ ] 10.2.1 Create `api.ts` with axios/ky instance and interceptors
  - [ ] 10.2.2 Configure request/response interceptors for auth tokens
  - [ ] 10.2.3 Configure TanStack Query client with defaults
  - [ ] 10.2.4 Create `use-muds.ts` hook with queries (list, detail, search)
  - [ ] 10.2.5 Create `use-reviews.ts` hook with queries and mutations
  - [ ] 10.2.6 Create `use-favorites.ts` hook with queries and mutations
  - [ ] 10.2.7 Create `use-auth.ts` hook for authentication state

- [ ] 10.3 Create Zustand stores
  - [ ] 10.3.1 Create `auth-store.ts` (user, tokens, login/logout actions)
  - [ ] 10.3.2 Create `theme-store.ts` (dark/light mode, persistence)
  - [ ] 10.3.3 Create `filter-store.ts` (search filters, sorting state)

- [ ] 10.4 Set up routing
  - [ ] 10.4.1 Install and configure React Router
  - [ ] 10.4.2 Create route definitions for all pages
  - [ ] 10.4.3 Create `ProtectedRoute` component for authenticated routes
  - [ ] 10.4.4 Create `AdminRoute` component for admin-only routes
  - [ ] 10.4.5 Implement route-based code splitting (lazy loading)

- [ ] 10.5 Create layout components
  - [ ] 10.5.1 Create `Header` component with navigation per DRD Section 5.7
  - [ ] 10.5.2 Create mobile hamburger menu with slide-out navigation
  - [ ] 10.5.3 Create `Footer` component
  - [ ] 10.5.4 Create `ThemeToggle` component per DRD Section 5.8
  - [ ] 10.5.5 Create `Layout` wrapper component with header/footer
  - [ ] 10.5.6 Implement sticky header with backdrop blur

- [ ] 10.6 Create shared feature components
  - [ ] 10.6.1 Create `SearchBar` component with autocomplete per DRD Section 5.5
  - [ ] 10.6.2 Create `StatusIndicator` component (online/offline dot with glow)
  - [ ] 10.6.3 Create `GenreTag` component for genre badges
  - [ ] 10.6.4 Create `StarRating` component for ratings display
  - [ ] 10.6.5 Create `Pagination` component
  - [ ] 10.6.6 Create `EmptyState` component per DRD Section 6.4

- [ ] 10.7 Implement animations and effects
  - [ ] 10.7.1 Create typing animation effect for hero headline per DRD 6.1
  - [ ] 10.7.2 Create terminal cursor blink animation
  - [ ] 10.7.3 Create card hover effects (lift, glow)
  - [ ] 10.7.4 Create page transition animations
  - [ ] 10.7.5 Implement `prefers-reduced-motion` media query support

- [ ] 10.8 Write frontend foundation tests
  - [ ] 10.8.1 Set up Vitest for React component testing
  - [ ] 10.8.2 Write tests for API client interceptors
  - [ ] 10.8.3 Write tests for Zustand stores
  - [ ] 10.8.4 Write tests for utility functions

---

### 11.0 Frontend: Core pages (traces to: FR-50 to FR-52)

- [ ] 11.1 Build Homepage (FR-50)
  - [ ] 11.1.1 Create `HomePage` component with sections
  - [ ] 11.1.2 Build Hero section with typing animation, search bar, CTAs per DRD 5.1
  - [ ] 11.1.3 Build Featured MUD section with featured card component per DRD 5.2
  - [ ] 11.1.4 Build Genre cards grid per DRD 5.4
  - [ ] 11.1.5 Build Trending MUDs section
  - [ ] 11.1.6 Build Recent Activity section with activity feed
  - [ ] 11.1.7 Connect to API hooks for data fetching
  - [ ] 11.1.8 Implement loading skeletons for all sections
  - [ ] 11.1.9 Implement responsive layout per DRD breakpoints

- [ ] 11.2 Build Browse/Search page (FR-51)
  - [ ] 11.2.1 Create `BrowsePage` component
  - [ ] 11.2.2 Build filter sidebar with genre, status, player count, date filters
  - [ ] 11.2.3 Build mobile filter drawer (sheet component)
  - [ ] 11.2.4 Build MUD list with `MudListItem` component per DRD 5.3
  - [ ] 11.2.5 Implement search input with URL sync
  - [ ] 11.2.6 Implement sorting dropdown
  - [ ] 11.2.7 Implement pagination
  - [ ] 11.2.8 Show "No results" empty state per DRD 6.4
  - [ ] 11.2.9 Implement URL-based filter state (shareable URLs)

- [ ] 11.3 Build MUD Detail page (FR-52)
  - [ ] 11.3.1 Create `MudDetailPage` component
  - [ ] 11.3.2 Build header section with name, genres, status, rating
  - [ ] 11.3.3 Build connection info section (host, port, web client link)
  - [ ] 11.3.4 Build description section with full text
  - [ ] 11.3.5 Build stats section (players online, established date, etc.)
  - [ ] 11.3.6 Build reviews section with review list
  - [ ] 11.3.7 Build "Write a Review" form (for authenticated users)
  - [ ] 11.3.8 Build "Related MUDs" section
  - [ ] 11.3.9 Implement favorite toggle button
  - [ ] 11.3.10 Show admin badge and claim CTA for unclaimed MUDs

- [ ] 11.4 Build MUD card components
  - [ ] 11.4.1 Create `FeaturedMudCard` component per DRD 5.2 (large spotlight)
  - [ ] 11.4.2 Create `MudCard` component (medium card for grids)
  - [ ] 11.4.3 Create `MudListItem` component per DRD 5.3 (compact row)
  - [ ] 11.4.4 Create `GenreCard` component per DRD 5.4

- [ ] 11.5 Write core page tests
  - [ ] 11.5.1 Write component tests for HomePage sections
  - [ ] 11.5.2 Write component tests for BrowsePage filters
  - [ ] 11.5.3 Write component tests for MudDetailPage
  - [ ] 11.5.4 Write E2E tests for homepage to detail navigation

---

### 12.0 Frontend: User & admin pages (traces to: FR-53 to FR-55)

- [ ] 12.1 Build Authentication pages
  - [ ] 12.1.1 Create `LoginPage` with email/password form
  - [ ] 12.1.2 Add OAuth login buttons (Google, Discord)
  - [ ] 12.1.3 Create `RegisterPage` with registration form
  - [ ] 12.1.4 Create `VerifyEmailPage` for email confirmation
  - [ ] 12.1.5 Create `ForgotPasswordPage` with email input
  - [ ] 12.1.6 Create `ResetPasswordPage` with new password form
  - [ ] 12.1.7 Implement form validation with Zod + React Hook Form
  - [ ] 12.1.8 Handle auth errors with toast notifications

- [ ] 12.2 Build User Profile pages (FR-53)
  - [ ] 12.2.1 Create `ProfilePage` component (public view)
  - [ ] 12.2.2 Display user info (avatar, display name, join date)
  - [ ] 12.2.3 Display user's reviews list
  - [ ] 12.2.4 Display user's favorites (if public)
  - [ ] 12.2.5 Create `EditProfilePage` for current user
  - [ ] 12.2.6 Implement avatar upload with preview

- [ ] 12.3 Build Favorites page (FR-34)
  - [ ] 12.3.1 Create `FavoritesPage` component
  - [ ] 12.3.2 Display grid of favorited MUDs
  - [ ] 12.3.3 Implement remove from favorites action
  - [ ] 12.3.4 Show empty state when no favorites

- [ ] 12.4 Build MUD Admin Dashboard (FR-54)
  - [ ] 12.4.1 Create `AdminDashboardPage` listing managed MUDs
  - [ ] 12.4.2 Create `EditMudPage` with full edit form
  - [ ] 12.4.3 Create `MudAnalyticsPage` with charts/stats
  - [ ] 12.4.4 Create `ClaimMudPage` with verification instructions
  - [ ] 12.4.5 Build admin-specific navigation/sidebar

- [ ] 12.5 Build Site Admin pages
  - [ ] 12.5.1 Create `ModerationPage` with content queue
  - [ ] 12.5.2 Create `ImportPage` with file upload and mapping UI
  - [ ] 12.5.3 Create `FeaturedManagementPage` with drag-and-drop ordering
  - [ ] 12.5.4 Create `UserManagementPage` with role editing
  - [ ] 12.5.5 Create `AuditLogPage` with filterable log table

- [ ] 12.6 Build Static pages (FR-55)
  - [ ] 12.6.1 Create `AboutPage` with site information
  - [ ] 12.6.2 Create `WhatIsMudPage` with educational content
  - [ ] 12.6.3 Create `FaqPage` with collapsible Q&A
  - [ ] 12.6.4 Create `TermsPage` with terms of service
  - [ ] 12.6.5 Create `PrivacyPage` with privacy policy

- [ ] 12.7 Write user/admin page tests
  - [ ] 12.7.1 Write component tests for auth forms
  - [ ] 12.7.2 Write component tests for profile page
  - [ ] 12.7.3 Write E2E tests for login/register flow
  - [ ] 12.7.4 Write E2E tests for MUD admin edit flow

---

### 13.0 Testing & quality assurance (traces to: TASKS-4, CODE-6)

- [ ] 13.1 Complete backend unit test coverage
  - [ ] 13.1.1 Ensure all command handlers have unit tests
  - [ ] 13.1.2 Ensure all query handlers have unit tests
  - [ ] 13.1.3 Ensure all validators have unit tests
  - [ ] 13.1.4 Achieve minimum 80% code coverage on Application layer

- [ ] 13.2 Complete backend integration tests
  - [ ] 13.2.1 Create test database fixture with seed data
  - [ ] 13.2.2 Write integration tests for all API endpoints
  - [ ] 13.2.3 Test authentication and authorization flows
  - [ ] 13.2.4 Test MSSP polling with mock server

- [ ] 13.3 Complete frontend unit tests
  - [ ] 13.3.1 Write tests for all custom hooks
  - [ ] 13.3.2 Write tests for all Zustand stores
  - [ ] 13.3.3 Write tests for utility functions
  - [ ] 13.3.4 Write component tests for complex components

- [ ] 13.4 Implement E2E tests with Playwright
  - [ ] 13.4.1 Set up Playwright configuration
  - [ ] 13.4.2 Write E2E test: User registration and login
  - [ ] 13.4.3 Write E2E test: Browse and filter MUDs
  - [ ] 13.4.4 Write E2E test: View MUD detail and submit review
  - [ ] 13.4.5 Write E2E test: Add/remove favorites
  - [ ] 13.4.6 Write E2E test: MUD admin claim and edit flow
  - [ ] 13.4.7 Write E2E test: Site admin moderation flow

- [ ] 13.5 Performance testing
  - [ ] 13.5.1 Test search endpoint meets 500ms requirement
  - [ ] 13.5.2 Run Lighthouse audit on all pages (target 90+ scores)
  - [ ] 13.5.3 Test page load times under simulated slow network
  - [ ] 13.5.4 Load test MSSP polling service with many concurrent MUDs

- [ ] 13.6 Accessibility testing
  - [ ] 13.6.1 Run axe accessibility audit on all pages
  - [ ] 13.6.2 Test keyboard navigation through entire app
  - [ ] 13.6.3 Test with screen reader (VoiceOver/NVDA)
  - [ ] 13.6.4 Verify color contrast meets WCAG 2.1 AA

- [ ] 13.7 Security testing
  - [ ] 13.7.1 Test for SQL injection vulnerabilities
  - [ ] 13.7.2 Test for XSS vulnerabilities
  - [ ] 13.7.3 Test authentication token security
  - [ ] 13.7.4 Verify no secrets in codebase or logs

---

### 14.0 Documentation & deployment prep (traces to: TASKS-4)

- [ ] 14.1 API documentation
  - [ ] 14.1.1 Configure Swagger/OpenAPI with descriptions
  - [ ] 14.1.2 Add XML documentation comments to all controllers
  - [ ] 14.1.3 Document all request/response models
  - [ ] 14.1.4 Add authentication documentation to Swagger

- [ ] 14.2 Developer documentation
  - [ ] 14.2.1 Update root README.md with project overview
  - [ ] 14.2.2 Document local development setup steps
  - [ ] 14.2.3 Document environment variables and configuration
  - [ ] 14.2.4 Document database migration process
  - [ ] 14.2.5 Document testing procedures

- [ ] 14.3 Deployment configuration
  - [ ] 14.3.1 Create production `appsettings.Production.json` template
  - [ ] 14.3.2 Create Dockerfile for API
  - [ ] 14.3.3 Create Dockerfile for frontend (nginx)
  - [ ] 14.3.4 Create docker-compose.yml for local full-stack testing
  - [ ] 14.3.5 Configure health check endpoints

- [ ] 14.4 CI/CD setup
  - [ ] 14.4.1 Create GitHub Actions workflow for backend tests
  - [ ] 14.4.2 Create GitHub Actions workflow for frontend tests
  - [ ] 14.4.3 Create GitHub Actions workflow for E2E tests
  - [ ] 14.4.4 Create deployment workflow (staging/production)

- [ ] 14.5 Final review
  - [ ] 14.5.1 Code review of entire codebase
  - [ ] 14.5.2 Review and resolve all TODO comments
  - [ ] 14.5.3 Update task list with completion status
  - [ ] 14.5.4 Create release notes for v1.0

---

## Summary

| Task Group | Sub-tasks | Priority |
|------------|-----------|----------|
| 0.0 Feature branch | 1 | Must |
| 1.0 Project scaffolding | 27 | Must |
| 2.0 Domain & database | 24 | Must |
| 3.0 Authentication | 32 | Must |
| 4.0 MUD listings API | 22 | Must |
| 5.0 MSSP integration | 17 | Must |
| 6.0 Reviews API | 25 | Must |
| 7.0 Favorites & activity | 22 | Should |
| 8.0 MUD admin features | 24 | Must |
| 9.0 Site administration | 20 | Must |
| 10.0 Frontend foundation | 35 | Must |
| 11.0 Frontend core pages | 28 | Must |
| 12.0 Frontend user/admin | 27 | Must |
| 13.0 Testing & QA | 24 | Must |
| 14.0 Documentation | 18 | Must |

**Total: ~346 sub-tasks**

---

## Dependencies

- Task 1.5 depends on 1.4 (Figma design extraction before token configuration)
- Task 2.0 depends on 1.0 (project structure needed first)
- Task 3.0 depends on 2.0 (database needed for Identity)
- Tasks 4.0-9.0 depend on 2.0 and 3.0 (core entities and auth)
- Task 5.0 (MSSP) can run in parallel with 4.0, 6.0-9.0
- Task 10.0 depends on 1.0 (frontend scaffolding in 1.3) and 1.4 (Figma design)
- Tasks 11.0-12.0 depend on 10.0 (foundation components needed)
- Task 13.0 should run continuously alongside development
- Task 14.0 should begin after 13.0 testing is substantially complete
