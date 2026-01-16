import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './home';

// Mock the hooks
vi.mock('@/hooks/use-muds', () => ({
  useFeaturedMuds: vi.fn(() => ({
    data: [
      {
        id: '1',
        name: 'Featured MUD',
        slug: 'featured-mud',
        shortDescription: 'A featured MUD',
        host: 'test.com',
        port: 4000,
        isOnline: true,
        averageRating: 4.5,
        reviewCount: 10,
        genres: [{ id: '1', name: 'Fantasy', slug: 'fantasy' }],
      },
    ],
    isLoading: false,
  })),
  useTrendingMuds: vi.fn(() => ({
    data: [
      {
        id: '2',
        name: 'Trending MUD',
        slug: 'trending-mud',
        shortDescription: 'A trending MUD',
        host: 'test.com',
        port: 4000,
        isOnline: true,
        averageRating: 4.0,
        reviewCount: 5,
        genres: [{ id: '1', name: 'Sci-Fi', slug: 'scifi' }],
      },
    ],
    isLoading: false,
  })),
  useGenres: vi.fn(() => ({
    data: [
      { id: '1', name: 'Fantasy', slug: 'fantasy', mudCount: 10 },
      { id: '2', name: 'Sci-Fi', slug: 'scifi', mudCount: 5 },
    ],
    isLoading: false,
  })),
  useMudAutocomplete: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
}));

vi.mock('@/hooks/use-favorites', () => ({
  useGlobalActivity: vi.fn(() => ({
    data: { items: [] },
    isLoading: false,
  })),
  useToggleFavorite: vi.fn(() => ({
    mutate: vi.fn(),
  })),
}));

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: vi.fn(() => ({
    isAuthenticated: false,
  })),
}));

const renderWithProviders = (component: React.ReactNode) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the hero section', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('Discover')).toBeInTheDocument();
  });

  it('renders the stats section', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('Active MUDs')).toBeInTheDocument();
    expect(screen.getByText('Players Online')).toBeInTheDocument();
    expect(screen.getByText('Reviews')).toBeInTheDocument();
  });

  it('renders featured MUD section', () => {
    renderWithProviders(<HomePage />);
    // Check for the section header - there will be multiple "Featured MUD" texts
    // so we check that at least one exists
    const featuredHeadings = screen.getAllByRole('heading', { name: 'Featured MUD' });
    expect(featuredHeadings.length).toBeGreaterThan(0);
  });

  it('renders browse by genre section', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('Browse by Genre')).toBeInTheDocument();
  });

  it('renders trending MUDs section', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('Trending Now')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('Browse All MUDs')).toBeInTheDocument();
    expect(screen.getByText('What is a MUD?')).toBeInTheDocument();
  });

  it('renders quick links section', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByText('Newest MUDs')).toBeInTheDocument();
    expect(screen.getByText('Online Now')).toBeInTheDocument();
    expect(screen.getByText('Top Rated')).toBeInTheDocument();
  });
});
