# MUDListings

A modern platform for discovering, reviewing, and managing MUD (Multi-User Dungeon) game listings. Built with .NET 10 and React 19.

## What is a MUD?

MUDs (Multi-User Dungeons) are text-based multiplayer online games that predate modern MMORPGs. Players connect via telnet or specialized clients to explore virtual worlds, complete quests, and interact with other players—all through text commands and descriptions.

## Features

### For Players
- **Browse & Search** - Discover MUDs with powerful filtering by genre, play style, and status
- **Real-time Status** - See which MUDs are online and current player counts
- **Reviews & Ratings** - Read community reviews and share your experiences
- **Favorites** - Save MUDs to your personal collection
- **Activity Feed** - Stay updated on new listings, reviews, and trending games

### For MUD Administrators
- **Claim Your MUD** - Verify ownership and manage your listing
- **Rich Profiles** - Add descriptions, screenshots, features, and connection details
- **Analytics** - Track views, favorites, and player trends
- **Review Responses** - Engage with player feedback

### For Site Admins
- **Content Moderation** - Review queue for flagged content
- **Featured Management** - Curate highlighted MUDs
- **Bulk Import** - Import MUD listings from JSON/CSV
- **Audit Logging** - Track all administrative actions

## Tech Stack

### Backend
- **.NET 10** with ASP.NET Core Web API
- **Clean Architecture** - Domain, Application, Infrastructure, API layers
- **Entity Framework Core** with PostgreSQL
- **MediatR** for CQRS pattern
- **JWT Authentication** with refresh tokens

### Frontend
- **React 19** with TypeScript
- **Vite 7** for fast builds
- **Tailwind CSS v4** with CSS variables
- **shadcn/ui** components (New York style)
- **TanStack Query** for server state
- **Zustand** for client state
- **React Router v7** with lazy loading

### Infrastructure
- **Docker** with multi-stage builds
- **nginx** for production serving
- **GitHub Actions** CI/CD pipeline

## Project Structure

```
mudlistings/
├── src/
│   ├── MudListings.Api/           # ASP.NET Core Web API
│   ├── MudListings.Application/   # CQRS commands, queries, DTOs
│   ├── MudListings.Domain/        # Entities and domain logic
│   ├── MudListings.Infrastructure/# EF Core, repositories, services
│   └── MudListings.Tests/         # Unit tests
├── web/                           # React frontend
│   ├── src/
│   │   ├── components/            # UI components
│   │   ├── hooks/                 # TanStack Query hooks
│   │   ├── pages/                 # Route pages
│   │   ├── stores/                # Zustand stores
│   │   └── types/                 # TypeScript types
│   ├── Dockerfile
│   └── nginx.conf
└── .github/workflows/             # CI/CD pipelines
```

## Getting Started

### Prerequisites
- .NET 10 SDK
- Node.js 20+
- PostgreSQL 15+
- Docker (optional)

### Backend Setup

```bash
# Navigate to API project
cd src/MudListings.Api

# Update connection string in appsettings.Development.json

# Run migrations
dotnet ef database update

# Start the API
dotnet run
```

The API will be available at `https://localhost:5001`

### Frontend Setup

```bash
# Navigate to web directory
cd web

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=https://localhost:5001/api" > .env.local

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Docker

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## Development

### Running Tests

```bash
# Backend tests
cd src/MudListings.Tests
dotnet test

# Frontend tests
cd web
npm test

# Frontend tests with coverage
npm run test:coverage
```

### Code Quality

```bash
# Frontend linting
cd web
npm run lint

# Frontend type checking
npx tsc --noEmit
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/refresh` - Refresh tokens
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### MUDs
- `GET /api/muds` - Search/list MUDs
- `GET /api/muds/{slug}` - Get MUD details
- `GET /api/muds/featured` - Featured MUDs
- `GET /api/muds/trending` - Trending MUDs
- `GET /api/muds/{id}/status` - Current status

### Reviews
- `GET /api/muds/{id}/reviews` - Get reviews
- `POST /api/muds/{id}/reviews` - Create review
- `PUT /api/reviews/{id}` - Update review
- `DELETE /api/reviews/{id}` - Delete review

### Favorites
- `POST /api/muds/{id}/favorite` - Toggle favorite
- `GET /api/users/me/favorites` - Get my favorites

## Design

The UI follows a Linear-inspired aesthetic:
- Dark mode as primary theme
- Muted colors with subtle gradients
- Generous whitespace
- Keyboard-first interactions (Cmd+K command palette)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary. All rights reserved.

## Acknowledgments

- The MUD community for keeping text-based gaming alive
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Linear](https://linear.app/) for design inspiration
