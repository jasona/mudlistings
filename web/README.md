# MUDListings Web Client

A modern, responsive web application for discovering and managing MUD (Multi-User Dungeon) game listings. Built with React 19, TypeScript, and Tailwind CSS v4.

## Features

- **Browse & Search**: Discover MUDs with powerful filtering and search capabilities
- **MUD Details**: View comprehensive information about each MUD including player counts, reviews, and connection details
- **User Accounts**: Register, login, and manage your profile
- **Favorites**: Save MUDs to your personal favorites list
- **Reviews**: Read and write reviews for MUDs you've played
- **MUD Administration**: Claim ownership and manage your MUD listings
- **Site Administration**: Content moderation, user management, and analytics (admin only)

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4 with CSS variables
- **UI Components**: shadcn/ui (New York style)
- **State Management**: Zustand for client state, TanStack Query for server state
- **Routing**: React Router v7 with lazy loading
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Prerequisites

- Node.js 18.0 or higher
- npm 9.0 or higher

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/mudlistings.git
cd mudlistings/web

# Install dependencies
npm install
```

### Environment Setup

Create a `.env.local` file in the project root:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Optional: Analytics
VITE_GA_TRACKING_ID=
```

### Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:5173
```

### Building for Production

```bash
# Type check and build
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Linting

```bash
# Lint all files
npm run lint
```

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── features/        # Feature-specific components
│   ├── layout/          # Layout components (header, footer, etc.)
│   └── ui/              # Base UI components (shadcn/ui)
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and API client
├── pages/               # Page components (routes)
│   ├── admin/           # MUD admin pages
│   ├── auth/            # Authentication pages
│   └── site-admin/      # Site admin pages
├── stores/              # Zustand stores
├── test/                # Test utilities and setup
└── types/               # TypeScript type definitions
```

## Key Design Decisions

### State Management

- **Server State**: TanStack Query handles all API data fetching, caching, and synchronization
- **Client State**: Zustand stores manage auth state and UI filters
- **Form State**: React Hook Form with Zod schemas for validation

### Routing

Routes are code-split using React.lazy() for optimal bundle sizes. Each route only loads when visited.

### Styling

Tailwind CSS v4 with a custom design token system based on CSS variables. The design follows a Linear-inspired aesthetic with:
- Dark mode as primary theme
- Muted colors with subtle gradients
- Generous whitespace
- Keyboard-first interactions

### Component Architecture

Components follow a consistent pattern:
- Props interfaces defined in the same file
- Co-located test files
- Composition over inheritance
- shadcn/ui as the foundation

## API Integration

The app expects a REST API at the configured `VITE_API_URL`. Key endpoints:

- `POST /auth/login` - User authentication
- `GET /muds` - Search/list MUDs
- `GET /muds/:slug` - Get MUD details
- `GET /muds/featured` - Featured MUDs
- `POST /muds/:id/reviews` - Create review
- `POST /muds/:id/favorite` - Toggle favorite

See the API documentation for complete endpoint details.

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Write/update tests as needed
4. Ensure all tests pass: `npm test`
5. Ensure build succeeds: `npm run build`
6. Submit a pull request

## License

Private - All rights reserved.
