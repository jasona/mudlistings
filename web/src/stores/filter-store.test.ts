import { describe, it, expect, beforeEach } from 'vitest';
import { useFilterStore } from './filter-store';

describe('filterStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useFilterStore.getState().resetFilters();
  });

  it('has correct initial state', () => {
    const state = useFilterStore.getState();
    expect(state.query).toBe('');
    expect(state.selectedGenres).toEqual([]);
    expect(state.onlineOnly).toBe(false);
    expect(state.minPlayers).toBeNull();
    expect(state.minRating).toBeNull();
    expect(state.sortBy).toBe('relevance');
    expect(state.page).toBe(1);
    expect(state.pageSize).toBe(20);
  });

  describe('query', () => {
    it('sets query and resets page', () => {
      useFilterStore.getState().setPage(5);
      useFilterStore.getState().setQuery('fantasy mud');

      const state = useFilterStore.getState();
      expect(state.query).toBe('fantasy mud');
      expect(state.page).toBe(1);
    });
  });

  describe('genres', () => {
    it('toggles genre on', () => {
      useFilterStore.getState().toggleGenre('fantasy');

      expect(useFilterStore.getState().selectedGenres).toContain('fantasy');
    });

    it('toggles genre off', () => {
      useFilterStore.getState().toggleGenre('fantasy');
      useFilterStore.getState().toggleGenre('fantasy');

      expect(useFilterStore.getState().selectedGenres).not.toContain('fantasy');
    });

    it('handles multiple genres', () => {
      useFilterStore.getState().toggleGenre('fantasy');
      useFilterStore.getState().toggleGenre('scifi');
      useFilterStore.getState().toggleGenre('roleplay');

      const genres = useFilterStore.getState().selectedGenres;
      expect(genres).toHaveLength(3);
      expect(genres).toContain('fantasy');
      expect(genres).toContain('scifi');
      expect(genres).toContain('roleplay');
    });

    it('sets genres directly', () => {
      useFilterStore.getState().setGenres(['fantasy', 'scifi']);

      expect(useFilterStore.getState().selectedGenres).toEqual(['fantasy', 'scifi']);
    });

    it('clears genres', () => {
      useFilterStore.getState().setGenres(['fantasy', 'scifi']);
      useFilterStore.getState().clearGenres();

      expect(useFilterStore.getState().selectedGenres).toEqual([]);
    });

    it('resets page when genres change', () => {
      useFilterStore.getState().setPage(5);
      useFilterStore.getState().toggleGenre('fantasy');

      expect(useFilterStore.getState().page).toBe(1);
    });
  });

  describe('filters', () => {
    it('sets onlineOnly', () => {
      useFilterStore.getState().setOnlineOnly(true);
      expect(useFilterStore.getState().onlineOnly).toBe(true);
    });

    it('sets minPlayers', () => {
      useFilterStore.getState().setMinPlayers(10);
      expect(useFilterStore.getState().minPlayers).toBe(10);
    });

    it('sets minRating', () => {
      useFilterStore.getState().setMinRating(4);
      expect(useFilterStore.getState().minRating).toBe(4);
    });
  });

  describe('sorting', () => {
    it('sets sortBy', () => {
      useFilterStore.getState().setSortBy('trending');
      expect(useFilterStore.getState().sortBy).toBe('trending');
    });

    it('resets page when sortBy changes', () => {
      useFilterStore.getState().setPage(5);
      useFilterStore.getState().setSortBy('rating');
      expect(useFilterStore.getState().page).toBe(1);
    });
  });

  describe('pagination', () => {
    it('sets page', () => {
      useFilterStore.getState().setPage(3);
      expect(useFilterStore.getState().page).toBe(3);
    });

    it('sets pageSize and resets page', () => {
      useFilterStore.getState().setPage(5);
      useFilterStore.getState().setPageSize(50);

      const state = useFilterStore.getState();
      expect(state.pageSize).toBe(50);
      expect(state.page).toBe(1);
    });
  });

  describe('getSearchParams', () => {
    it('returns correct params with defaults', () => {
      const params = useFilterStore.getState().getSearchParams();

      expect(params).toEqual({
        query: undefined,
        genres: undefined,
        isOnline: undefined,
        minPlayers: undefined,
        minRating: undefined,
        sortBy: 'relevance',
        page: 1,
        pageSize: 20,
      });
    });

    it('returns correct params with values set', () => {
      useFilterStore.getState().setQuery('fantasy');
      useFilterStore.getState().setGenres(['fantasy', 'roleplay']);
      useFilterStore.getState().setOnlineOnly(true);
      useFilterStore.getState().setMinPlayers(5);
      useFilterStore.getState().setSortBy('trending');
      useFilterStore.getState().setPage(2);

      const params = useFilterStore.getState().getSearchParams();

      expect(params).toEqual({
        query: 'fantasy',
        genres: ['fantasy', 'roleplay'],
        isOnline: true,
        minPlayers: 5,
        minRating: undefined,
        sortBy: 'trending',
        page: 2,
        pageSize: 20,
      });
    });
  });

  describe('resetFilters', () => {
    it('resets all filters to initial state', () => {
      // Set various filters
      useFilterStore.getState().setQuery('test');
      useFilterStore.getState().setGenres(['fantasy']);
      useFilterStore.getState().setOnlineOnly(true);
      useFilterStore.getState().setSortBy('trending');
      useFilterStore.getState().setPage(5);

      // Reset
      useFilterStore.getState().resetFilters();

      const state = useFilterStore.getState();
      expect(state.query).toBe('');
      expect(state.selectedGenres).toEqual([]);
      expect(state.onlineOnly).toBe(false);
      expect(state.sortBy).toBe('relevance');
      expect(state.page).toBe(1);
    });
  });
});
