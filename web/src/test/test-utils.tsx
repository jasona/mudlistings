import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Create a fresh QueryClient for each test
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Wrapper component for testing hooks
export function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

// Mock user data for testing
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'Player' as const,
  isEmailVerified: true,
  createdAt: '2024-01-01T00:00:00Z',
};

export const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresAt: '2024-12-31T23:59:59Z',
};

export const mockMud = {
  id: 'mud-123',
  name: 'Test MUD',
  slug: 'test-mud',
  description: 'A test MUD for testing',
  host: 'test.mud.com',
  port: 4000,
  isOnline: true,
  currentPlayers: 10,
  isFeatured: false,
  trendingScore: 50,
  averageRating: 4.5,
  reviewCount: 10,
  favoriteCount: 5,
  genres: [{ id: 'genre-1', name: 'Fantasy', slug: 'fantasy' }],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
};

export const mockMudListItem = {
  id: 'mud-123',
  name: 'Test MUD',
  slug: 'test-mud',
  shortDescription: 'A test MUD',
  host: 'test.mud.com',
  port: 4000,
  isOnline: true,
  currentPlayers: 10,
  averageRating: 4.5,
  reviewCount: 10,
  genres: [{ id: 'genre-1', name: 'Fantasy', slug: 'fantasy' }],
  isFavorited: false,
};

export const mockReview = {
  id: 'review-123',
  mudId: 'mud-123',
  userId: 'user-123',
  userDisplayName: 'Test User',
  title: 'Great MUD!',
  body: 'This is a great MUD for testing.',
  rating: 5,
  helpfulCount: 3,
  hasVotedHelpful: false,
  isOwn: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const mockFavorite = {
  id: 'fav-123',
  mudId: 'mud-123',
  mud: mockMudListItem,
  createdAt: '2024-01-01T00:00:00Z',
};

export const mockActivityEvent = {
  id: 'activity-123',
  type: 'NewListing' as const,
  mudId: 'mud-123',
  mudName: 'Test MUD',
  mudSlug: 'test-mud',
  createdAt: '2024-01-01T00:00:00Z',
};

// Helper to create paginated response
export function createPaginatedResponse<T>(items: T[], page = 1, pageSize = 10, totalCount?: number) {
  const total = totalCount ?? items.length;
  return {
    items,
    totalCount: total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// Mock API module
export const mockAuthApi = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
  verifyEmail: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  refreshToken: vi.fn(),
};

export const mockMudsApi = {
  search: vi.fn(),
  getById: vi.fn(),
  getFeatured: vi.fn(),
  getTrending: vi.fn(),
  autocomplete: vi.fn(),
  getStatus: vi.fn(),
  getStatusHistory: vi.fn(),
};

export const mockFavoritesApi = {
  toggle: vi.fn(),
  getMine: vi.fn(),
  getByUser: vi.fn(),
};

export const mockReviewsApi = {
  getByMud: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  markHelpful: vi.fn(),
  reply: vi.fn(),
  report: vi.fn(),
  getByUser: vi.fn(),
};

export const mockActivityApi = {
  getGlobal: vi.fn(),
  getPersonalized: vi.fn(),
};
