import { create } from 'zustand';
import type { MudSortBy } from '@/types';

interface FilterState {
  // Search
  query: string;
  setQuery: (query: string) => void;

  // Genre filters
  selectedGenres: string[];
  toggleGenre: (genreSlug: string) => void;
  setGenres: (genres: string[]) => void;
  clearGenres: () => void;

  // Status filter
  onlineOnly: boolean;
  setOnlineOnly: (onlineOnly: boolean) => void;

  // Player count filter
  minPlayers: number | null;
  setMinPlayers: (minPlayers: number | null) => void;

  // Rating filter
  minRating: number | null;
  setMinRating: (minRating: number | null) => void;

  // Sorting
  sortBy: MudSortBy;
  setSortBy: (sortBy: MudSortBy) => void;

  // Pagination
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  // Reset all filters
  resetFilters: () => void;

  // Get params for API call
  getSearchParams: () => {
    query?: string;
    genres?: string[];
    isOnline?: boolean;
    minPlayers?: number;
    minRating?: number;
    sortBy: MudSortBy;
    page: number;
    pageSize: number;
  };
}

const initialState = {
  query: '',
  selectedGenres: [],
  onlineOnly: false,
  minPlayers: null,
  minRating: null,
  sortBy: 'relevance' as MudSortBy,
  page: 1,
  pageSize: 20,
};

export const useFilterStore = create<FilterState>((set, get) => ({
  ...initialState,

  setQuery: (query) => set({ query, page: 1 }), // Reset to page 1 on search

  toggleGenre: (genreSlug) =>
    set((state) => ({
      selectedGenres: state.selectedGenres.includes(genreSlug)
        ? state.selectedGenres.filter((g) => g !== genreSlug)
        : [...state.selectedGenres, genreSlug],
      page: 1, // Reset to page 1 on filter change
    })),

  setGenres: (genres) => set({ selectedGenres: genres, page: 1 }),

  clearGenres: () => set({ selectedGenres: [], page: 1 }),

  setOnlineOnly: (onlineOnly) => set({ onlineOnly, page: 1 }),

  setMinPlayers: (minPlayers) => set({ minPlayers, page: 1 }),

  setMinRating: (minRating) => set({ minRating, page: 1 }),

  setSortBy: (sortBy) => set({ sortBy, page: 1 }),

  setPage: (page) => set({ page }),

  setPageSize: (pageSize) => set({ pageSize, page: 1 }),

  resetFilters: () => set(initialState),

  getSearchParams: () => {
    const state = get();
    return {
      query: state.query || undefined,
      genres: state.selectedGenres.length > 0 ? state.selectedGenres : undefined,
      isOnline: state.onlineOnly || undefined,
      minPlayers: state.minPlayers ?? undefined,
      minRating: state.minRating ?? undefined,
      sortBy: state.sortBy,
      page: state.page,
      pageSize: state.pageSize,
    };
  },
}));

// Selectors
export const selectQuery = (state: FilterState) => state.query;
export const selectSelectedGenres = (state: FilterState) => state.selectedGenres;
export const selectOnlineOnly = (state: FilterState) => state.onlineOnly;
export const selectSortBy = (state: FilterState) => state.sortBy;
export const selectPage = (state: FilterState) => state.page;
export const selectHasActiveFilters = (state: FilterState) =>
  state.query !== '' ||
  state.selectedGenres.length > 0 ||
  state.onlineOnly ||
  state.minPlayers !== null ||
  state.minRating !== null;
