import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createWrapper, mockMud, mockMudListItem } from '@/test/test-utils';

// Mock the API module
vi.mock('@/lib/api', () => ({
  mudsApi: {
    search: vi.fn(),
    getById: vi.fn(),
    getFeatured: vi.fn(),
    getTrending: vi.fn(),
    autocomplete: vi.fn(),
    getStatus: vi.fn(),
    getStatusHistory: vi.fn(),
  },
  genresApi: {
    getAll: vi.fn(),
  },
  mudAdminApi: {
    getManagedMuds: vi.fn(),
    getAnalytics: vi.fn(),
    getAdmins: vi.fn(),
    updateMud: vi.fn(),
    initiateClaim: vi.fn(),
    verifyClaim: vi.fn(),
    inviteAdmin: vi.fn(),
    removeAdmin: vi.fn(),
    transferOwnership: vi.fn(),
  },
}));

import { mudsApi, genresApi, mudAdminApi } from '@/lib/api';
import {
  useMudSearch,
  useMud,
  useFeaturedMuds,
  useTrendingMuds,
  useMudAutocomplete,
  useMudStatus,
  useMudStatusHistory,
  useGenres,
  useManagedMuds,
  useMudAnalytics,
  useMudAdmins,
  useUpdateMud,
  useInitiateClaim,
  useVerifyClaim,
  mudKeys,
  genreKeys,
} from './use-muds';

describe('use-muds hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('mudKeys', () => {
    it('should generate correct query keys', () => {
      expect(mudKeys.all).toEqual(['muds']);
      expect(mudKeys.lists()).toEqual(['muds', 'list']);
      expect(mudKeys.list({ query: 'test' })).toEqual(['muds', 'list', { query: 'test' }]);
      expect(mudKeys.detail('mud-123')).toEqual(['muds', 'detail', 'mud-123']);
      expect(mudKeys.featured()).toEqual(['muds', 'featured']);
      expect(mudKeys.trending()).toEqual(['muds', 'trending']);
      expect(mudKeys.autocomplete('test')).toEqual(['muds', 'autocomplete', 'test']);
    });
  });

  describe('genreKeys', () => {
    it('should generate correct query keys', () => {
      expect(genreKeys.all).toEqual(['genres']);
    });
  });

  describe('useMudSearch', () => {
    it('should search MUDs with parameters', async () => {
      const mockResponse = {
        items: [mockMudListItem],
        totalCount: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };
      vi.mocked(mudsApi.search).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useMudSearch({ query: 'test' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(mudsApi.search).toHaveBeenCalledWith({ query: 'test' });
    });

    it('should search with multiple parameters', async () => {
      vi.mocked(mudsApi.search).mockResolvedValue({
        items: [],
        totalCount: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      });

      renderHook(
        () =>
          useMudSearch({
            query: 'fantasy',
            isOnline: true,
            minRating: 4,
            sortBy: 'rating',
          }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(mudsApi.search).toHaveBeenCalledWith({
          query: 'fantasy',
          isOnline: true,
          minRating: 4,
          sortBy: 'rating',
        });
      });
    });
  });

  describe('useMud', () => {
    it('should fetch MUD by slug', async () => {
      vi.mocked(mudsApi.getById).mockResolvedValue(mockMud);

      const { result } = renderHook(() => useMud('test-mud'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockMud);
      expect(mudsApi.getById).toHaveBeenCalledWith('test-mud');
    });

    it('should not fetch when disabled', async () => {
      const { result } = renderHook(() => useMud('test-mud', false), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(mudsApi.getById).not.toHaveBeenCalled();
    });

    it('should not fetch when slug is empty', async () => {
      const { result } = renderHook(() => useMud(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(mudsApi.getById).not.toHaveBeenCalled();
    });
  });

  describe('useFeaturedMuds', () => {
    it('should fetch featured MUDs', async () => {
      vi.mocked(mudsApi.getFeatured).mockResolvedValue([mockMudListItem]);

      const { result } = renderHook(() => useFeaturedMuds(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([mockMudListItem]);
      expect(mudsApi.getFeatured).toHaveBeenCalled();
    });
  });

  describe('useTrendingMuds', () => {
    it('should fetch trending MUDs', async () => {
      vi.mocked(mudsApi.getTrending).mockResolvedValue([mockMudListItem]);

      const { result } = renderHook(() => useTrendingMuds(5), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([mockMudListItem]);
      expect(mudsApi.getTrending).toHaveBeenCalledWith(5);
    });
  });

  describe('useMudAutocomplete', () => {
    it('should fetch autocomplete results', async () => {
      const mockResults = [{ id: 'mud-123', name: 'Test MUD', slug: 'test-mud' }];
      vi.mocked(mudsApi.autocomplete).mockResolvedValue(mockResults);

      const { result } = renderHook(() => useMudAutocomplete('test'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResults);
      expect(mudsApi.autocomplete).toHaveBeenCalledWith('test');
    });

    it('should not fetch with query less than 2 characters', async () => {
      const { result } = renderHook(() => useMudAutocomplete('t'), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(mudsApi.autocomplete).not.toHaveBeenCalled();
    });
  });

  describe('useMudStatus', () => {
    it('should fetch MUD status', async () => {
      const mockStatus = { isOnline: true, players: 10, lastChecked: '2024-01-15T00:00:00Z' };
      vi.mocked(mudsApi.getStatus).mockResolvedValue(mockStatus);

      const { result } = renderHook(() => useMudStatus('mud-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockStatus);
      expect(mudsApi.getStatus).toHaveBeenCalledWith('mud-123');
    });
  });

  describe('useMudStatusHistory', () => {
    it('should fetch MUD status history', async () => {
      const mockHistory = [
        { timestamp: '2024-01-15T00:00:00Z', players: 10, isOnline: true },
        { timestamp: '2024-01-14T00:00:00Z', players: 8, isOnline: true },
      ];
      vi.mocked(mudsApi.getStatusHistory).mockResolvedValue(mockHistory);

      const { result } = renderHook(() => useMudStatusHistory('mud-123', 7), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockHistory);
      expect(mudsApi.getStatusHistory).toHaveBeenCalledWith('mud-123', 7);
    });
  });

  describe('useGenres', () => {
    it('should fetch all genres', async () => {
      const mockGenres = [
        { id: 'genre-1', name: 'Fantasy', slug: 'fantasy' },
        { id: 'genre-2', name: 'Sci-Fi', slug: 'sci-fi' },
      ];
      vi.mocked(genresApi.getAll).mockResolvedValue(mockGenres);

      const { result } = renderHook(() => useGenres(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockGenres);
      expect(genresApi.getAll).toHaveBeenCalled();
    });
  });

  describe('useManagedMuds', () => {
    it('should fetch managed MUDs', async () => {
      vi.mocked(mudAdminApi.getManagedMuds).mockResolvedValue([mockMudListItem]);

      const { result } = renderHook(() => useManagedMuds(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([mockMudListItem]);
    });
  });

  describe('useMudAnalytics', () => {
    it('should fetch MUD analytics', async () => {
      const mockAnalytics = {
        mudId: 'mud-123',
        totalViews: 1000,
        uniqueVisitors: 500,
        clickThroughs: 200,
        favoriteCount: 50,
        reviewCount: 25,
        averageRating: 4.5,
        periodStart: '2024-01-01',
        periodEnd: '2024-01-31',
      };
      vi.mocked(mudAdminApi.getAnalytics).mockResolvedValue(mockAnalytics);

      const { result } = renderHook(() => useMudAnalytics('mud-123', 30), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockAnalytics);
      expect(mudAdminApi.getAnalytics).toHaveBeenCalledWith('mud-123', 30);
    });
  });

  describe('useMudAdmins', () => {
    it('should fetch MUD admins', async () => {
      const mockAdmins = [{ userId: 'user-123', displayName: 'Admin User', role: 'Owner' }];
      vi.mocked(mudAdminApi.getAdmins).mockResolvedValue(mockAdmins);

      const { result } = renderHook(() => useMudAdmins('mud-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockAdmins);
    });
  });

  describe('useUpdateMud', () => {
    it('should update MUD successfully', async () => {
      vi.mocked(mudAdminApi.updateMud).mockResolvedValue(mockMud);

      const { result } = renderHook(() => useUpdateMud(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ mudId: 'mud-123', data: { name: 'Updated Name' } });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mudAdminApi.updateMud).toHaveBeenCalledWith('mud-123', { name: 'Updated Name' });
    });
  });

  describe('useInitiateClaim', () => {
    it('should initiate claim with MSSP method', async () => {
      vi.mocked(mudAdminApi.initiateClaim).mockResolvedValue({
        verificationCode: 'ABC123',
        instructions: 'Add to MSSP',
      });

      const { result } = renderHook(() => useInitiateClaim(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ mudId: 'mud-123', method: 'mssp' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mudAdminApi.initiateClaim).toHaveBeenCalledWith('mud-123', 'mssp');
      expect(result.current.data).toEqual({
        verificationCode: 'ABC123',
        instructions: 'Add to MSSP',
      });
    });
  });

  describe('useVerifyClaim', () => {
    it('should verify claim successfully', async () => {
      vi.mocked(mudAdminApi.verifyClaim).mockResolvedValue({
        success: true,
        message: 'Claim verified',
      });

      const { result } = renderHook(() => useVerifyClaim(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('mud-123');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mudAdminApi.verifyClaim).toHaveBeenCalledWith('mud-123');
      expect(result.current.data).toEqual({ success: true, message: 'Claim verified' });
    });
  });
});
