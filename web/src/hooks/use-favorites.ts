import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesApi, activityApi } from '@/lib/api';
import { mudKeys } from './use-muds';

export const favoriteKeys = {
  all: ['favorites'] as const,
  mine: (page?: number) => [...favoriteKeys.all, 'mine', page] as const,
  byUser: (userId: string, page?: number) => [...favoriteKeys.all, 'user', userId, page] as const,
};

export const activityKeys = {
  all: ['activity'] as const,
  global: (page?: number) => [...activityKeys.all, 'global', page] as const,
  personalized: (page?: number) => [...activityKeys.all, 'personalized', page] as const,
};

// Favorites Queries
export function useMyFavorites(page = 1) {
  return useQuery({
    queryKey: favoriteKeys.mine(page),
    queryFn: () => favoritesApi.getMine(page),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useUserFavorites(userId: string, page = 1) {
  return useQuery({
    queryKey: favoriteKeys.byUser(userId, page),
    queryFn: () => favoritesApi.getByUser(userId, page),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Favorites Mutations
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mudId: string) => favoritesApi.toggle(mudId),
    onSuccess: (result, mudId) => {
      // Update the MUD detail cache
      queryClient.setQueryData(mudKeys.detail(mudId), (old: Record<string, unknown> | undefined) => {
        if (!old) return old;
        return { ...old, isFavorited: result.isFavorited };
      });

      // Invalidate favorites lists
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all });

      // Invalidate MUD lists to update isFavorited flags
      queryClient.invalidateQueries({ queryKey: mudKeys.lists() });
    },
  });
}

// Activity Queries
export function useGlobalActivity(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: activityKeys.global(page),
    queryFn: () => activityApi.getGlobal(page, pageSize),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function usePersonalizedActivity(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: activityKeys.personalized(page),
    queryFn: () => activityApi.getPersonalized(page, pageSize),
    staleTime: 30 * 1000, // 30 seconds
  });
}
