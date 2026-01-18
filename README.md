# MUDListings

A modern platform for discovering, reviewing, and managing MUD (Multi-User Dungeon) game listings. Built with Next.js 15 and PostgreSQL.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

## What is a MUD?

MUDs (Multi-User Dungeons) are text-based multiplayer online games that predate modern MMORPGs. Players connect via telnet or specialized clients to explore virtual worlds, complete quests, and interact with other players—all through text commands and descriptions.

## Features

### For Players
- **Browse & Search** - Discover MUDs with powerful filtering by genre, play style, and status
- **Real-time Status** - See which MUDs are online via MSSP (MUD Server Status Protocol)
- **Reviews & Ratings** - Read community reviews and share your experiences
- **Favorites** - Save MUDs to your personal collection
- **Activity Feed** - Stay updated on new listings, reviews, and trending games

### For MUD Administrators
- **Claim Your MUD** - Verify ownership via MSSP, website meta tag, or manual approval
- **Rich Profiles** - Add descriptions, connection details, Discord links, and more
- **Analytics** - Track views, favorites, and review trends
- **Review Responses** - Engage with player feedback

### For Site Admins
- **Content Moderation** - Review queue for flagged content
- **Featured Management** - Curate highlighted MUDs
- **User Management** - Manage roles and permissions
- **Audit Logging** - Track all administrative actions

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript 5.7](https://www.typescriptlang.org/)
- **UI**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix primitives)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js v5](https://authjs.dev/) (credentials + OAuth)
- **Deployment**: [Railway](https://railway.app/) (recommended)

## Project Structure

```
mudlistings/
├── app/                          # Next.js application
│   ├── app/                      # App Router pages
│   │   ├── (auth)/               # Auth pages (login, register)
│   │   ├── admin/                # Site admin pages
│   │   ├── manage/               # MUD admin pages
│   │   ├── muds/                 # MUD listing & detail
│   │   ├── profile/              # User profile
│   │   └── api/auth/             # NextAuth API route
│   ├── actions/                  # Server Actions
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── mud/                  # MUD-related components
│   │   ├── review/               # Review components
│   │   └── layout/               # Layout components
│   ├── data/                     # Data access functions
│   ├── lib/                      # Utilities (auth, prisma, utils)
│   ├── jobs/                     # Background job scripts
│   └── prisma/                   # Database schema & migrations
└── docs/                         # Documentation
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (or use Railway/Neon/Supabase)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mudlistings.git
cd mudlistings/app

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Update .env with your database URL and secrets
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mudlistings"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"  # Generate with: openssl rand -base64 32

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""
```

### Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed sample data (optional)
npm run db:seed
```

### Development

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## Background Jobs

MUDListings includes background jobs for server status polling and trending score calculation. Run these via cron in production:

```bash
# Poll MUD server status (every 5 minutes)
npm run job:mssp

# Update trending scores (every hour)
npm run job:trending

# Clean up old data (daily)
npm run job:cleanup
```

### Railway Cron Configuration

In Railway, configure these as scheduled tasks:
- `npx tsx jobs/mssp-poll.ts` - Every 5 minutes
- `npx tsx jobs/trending-update.ts` - Every hour
- `npx tsx jobs/cleanup.ts` - Daily

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed sample data

npm run job:mssp     # Poll MUD server status
npm run job:trending # Update trending scores
npm run job:cleanup  # Clean up old data
```

## Deployment

### Railway (Recommended)

1. Create a new Railway project
2. Add a PostgreSQL database
3. Connect your GitHub repository
4. Set environment variables
5. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Vercel
- Netlify
- Docker
- Self-hosted

## Design

The UI follows a Linear-inspired aesthetic:
- Dark mode as primary theme
- Muted colors with subtle gradients
- Generous whitespace
- Clean, minimal interface

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test additions or changes
- `chore:` - Build process or auxiliary tool changes

## License

This project is proprietary. All rights reserved.

## Acknowledgments

- The MUD community for keeping text-based gaming alive
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Linear](https://linear.app/) for design inspiration
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
