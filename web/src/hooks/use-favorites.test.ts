import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createWrapper, mockFavorite, mockActivityEvent, createPaginatedResponse } from '@/test/test-utils';

// Mock the API module
vi.mock('@/lib/api', () => ({
  favoritesApi: {
    toggle: vi.fn(),
    getMine: vi.fn(),
    getByUser: vi.fn(),
  },
  activityApi: {
    getGlobal: vi.fn(),
    getPersonalized: vi.fn(),
  },
}));

import { favoritesApi, activityApi } from '@/lib/api';
import {
  useMyFavorites,
  useUserFavorites,
  useToggleFavorite,
  useGlobalActivity,
  usePersonalizedActivity,
  favoriteKeys,
  activityKeys,
} from './use-favorites';

describe('use-favorites hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('favoriteKeys', () => {
    it('should generate correct query keys', () => {
      expect(favoriteKeys.all).toEqual(['favorites']);
      expect(favoriteKeys.mine(1)).toEqual(['favorites', 'mine', 1]);
      expect(favoriteKeys.byUser('user-123', 2)).toEqual(['favorites', 'user', 'user-123', 2]);
    });
  });

  describe('activityKeys', () => {
    it('should generate correct query keys', () => {
      expect(activityKeys.all).toEqual(['activity']);
      expect(activityKeys.global(1)).toEqual(['activity', 'global', 1]);
      expect(activityKeys.personalized(1)).toEqual(['activity', 'personalized', 1]);
    });
  });

  describe('useMyFavorites', () => {
    it('should fetch current user favorites', async () => {
      const mockResponse = createPaginatedResponse([mockFavorite], 1, 10, 1);
      vi.mocked(favoritesApi.getMine).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useMyFavorites(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(favoritesApi.getMine).toHaveBeenCalledWith(1);
    });

    it('should use default page 1', async () => {
      vi.mocked(favoritesApi.getMine).mockResolvedValue(createPaginatedResponse([], 1, 10, 0));

      renderHook(() => useMyFavorites(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(favoritesApi.getMine).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('useUserFavorites', () => {
    it('should fetch user favorites when userId provided', async () => {
      const mockResponse = createPaginatedResponse([mockFavorite], 1, 10, 1);
      vi.mocked(favoritesApi.getByUser).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUserFavorites('user-123', 1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(favoritesApi.getByUser).toHaveBeenCalledWith('user-123', 1);
    });

    it('should not fetch when userId is empty', async () => {
      const { result } = renderHook(() => useUserFavorites('', 1), {
        wrapper: createWrapper(),
      });

      // Query should not be enabled
      expect(result.current.fetchStatus).toBe('idle');
      expect(favoritesApi.getByUser).not.toHaveBeenCalled();
    });
  });

  describe('useToggleFavorite', () => {
    it('should toggle favorite successfully', async () => {
      vi.mocked(favoritesApi.toggle).mockResolvedValue({ isFavorited: true });

      const { result } = renderHook(() => useToggleFavorite(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('mud-123');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(favoritesApi.toggle).toHaveBeenCalledWith('mud-123');
      expect(result.current.data).toEqual({ isFavorited: true });
    });

    it('should handle toggle to unfavorite', async () => {
      vi.mocked(favoritesApi.toggle).mockResolvedValue({ isFavorited: false });

      const { result } = renderHook(() => useToggleFavorite(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('mud-123');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual({ isFavorited: false });
    });
  });

  describe('useGlobalActivity', () => {
    it('should fetch global activity', async () => {
      const mockResponse = createPaginatedResponse([mockActivityEvent], 1, 20, 1);
      vi.mocked(activityApi.getGlobal).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useGlobalActivity(1, 20), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(activityApi.getGlobal).toHaveBeenCalledWith(1, 20);
    });

    it('should use default values', async () => {
      vi.mocked(activityApi.getGlobal).mockResolvedValue(createPaginatedResponse([], 1, 20, 0));

      renderHook(() => useGlobalActivity(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(activityApi.getGlobal).toHaveBeenCalledWith(1, 20);
      });
    });
  });

  describe('usePersonalizedActivity', () => {
    it('should fetch personalized activity', async () => {
      const mockResponse = createPaginatedResponse([mockActivityEvent], 1, 20, 1);
      vi.mocked(activityApi.getPersonalized).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePersonalizedActivity(1, 20), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(activityApi.getPersonalized).toHaveBeenCalledWith(1, 20);
    });
  });
});
