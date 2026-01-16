import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import BrowsePage from './browse';

// Mock all dependencies
vi.mock('@/hooks/use-muds', () => ({
  useMudSearch: vi.fn(() => ({
    data: {
      items: [
        {
          id: '1',
          name: 'Test MUD 1',
          slug: 'test-mud-1',
          shortDescription: 'A test MUD',
          host: 'test.com',
          port: 4000,
          isOnline: true,
          averageRating: 4.5,
          reviewCount: 10,
          genres: [{ id: '1', name: 'Fantasy', slug: 'fantasy' }],
        },
      ],
      totalCount: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    },
    isLoading: false,
    isError: false,
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
  useToggleFavorite: vi.fn(() => ({
    mutate: vi.fn(),
  })),
}));

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: vi.fn(() => ({
    isAuthenticated: false,
  })),
}));

// Mock the filter store with a simpler implementation
const mockFilterState = {
  query: '',
  setQuery: vi.fn(),
  selectedGenres: [] as string[],
  toggleGenre: vi.fn(),
  clearGenres: vi.fn(),
  onlineOnly: false,
  setOnlineOnly: vi.fn(),
  minRating: null,
  setMinRating: vi.fn(),
  minPlayers: null,
  setMinPlayers: vi.fn(),
  sortBy: 'relevance' as const,
  setSortBy: vi.fn(),
  page: 1,
  setPage: vi.fn(),
  pageSize: 20,
  setPageSize: vi.fn(),
  resetFilters: vi.fn(),
  getSearchParams: vi.fn(() => ({
    sortBy: 'relevance' as const,
    page: 1,
    pageSize: 20,
  })),
};

vi.mock('@/stores/filter-store', () => ({
  useFilterStore: vi.fn((selector) => {
    if (typeof selector === 'function') {
      return selector(mockFilterState);
    }
    return mockFilterState;
  }),
  selectHasActiveFilters: () => false,
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
      <MemoryRouter>{component}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('BrowsePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title', () => {
    renderWithProviders(<BrowsePage />);
    expect(screen.getByRole('heading', { name: 'Browse MUDs' })).toBeInTheDocument();
  });

  it('renders the search bar', () => {
    renderWithProviders(<BrowsePage />);
    expect(
      screen.getByPlaceholderText('Search MUDs by name, description, or keyword...')
    ).toBeInTheDocument();
  });

  it('renders MUD cards', () => {
    renderWithProviders(<BrowsePage />);
    expect(screen.getByText('Test MUD 1')).toBeInTheDocument();
  });

  it('renders view mode toggle buttons', () => {
    renderWithProviders(<BrowsePage />);
    expect(screen.getByLabelText('Grid view')).toBeInTheDocument();
    expect(screen.getByLabelText('List view')).toBeInTheDocument();
  });

  it('renders filters section', () => {
    renderWithProviders(<BrowsePage />);
    // Check that filters section exists
    expect(screen.getAllByText('Filters').length).toBeGreaterThan(0);
  });
});
