import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mudsApi, genresApi, mudAdminApi } from '@/lib/api';
import type { MudSearchParams, Mud } from '@/types';

export const mudKeys = {
  all: ['muds'] as const,
  lists: () => [...mudKeys.all, 'list'] as const,
  list: (params: MudSearchParams) => [...mudKeys.lists(), params] as const,
  details: () => [...mudKeys.all, 'detail'] as const,
  detail: (idOrSlug: string) => [...mudKeys.details(), idOrSlug] as const,
  featured: () => [...mudKeys.all, 'featured'] as const,
  trending: () => [...mudKeys.all, 'trending'] as const,
  autocomplete: (query: string) => [...mudKeys.all, 'autocomplete', query] as const,
  status: (id: string) => [...mudKeys.all, 'status', id] as const,
  statusHistory: (id: string) => [...mudKeys.all, 'statusHistory', id] as const,
  managed: () => [...mudKeys.all, 'managed'] as const,
  analytics: (id: string) => [...mudKeys.all, 'analytics', id] as const,
  admins: (id: string) => [...mudKeys.all, 'admins', id] as const,
};

export const genreKeys = {
  all: ['genres'] as const,
};

// MUD Queries
export function useMudSearch(params: MudSearchParams) {
  return useQuery({
    queryKey: mudKeys.list(params),
    queryFn: () => mudsApi.search(params),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useMud(idOrSlug: string, enabled = true) {
  return useQuery({
    queryKey: mudKeys.detail(idOrSlug),
    queryFn: () => mudsApi.getById(idOrSlug),
    enabled: enabled && !!idOrSlug,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useFeaturedMuds() {
  return useQuery({
    queryKey: mudKeys.featured(),
    queryFn: () => mudsApi.getFeatured(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTrendingMuds(limit?: number) {
  return useQuery({
    queryKey: mudKeys.trending(),
    queryFn: () => mudsApi.getTrending(limit),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useMudAutocomplete(query: string) {
  return useQuery({
    queryKey: mudKeys.autocomplete(query),
    queryFn: () => mudsApi.autocomplete(query),
    enabled: query.length >= 2,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useMudStatus(mudId: string) {
  return useQuery({
    queryKey: mudKeys.status(mudId),
    queryFn: () => mudsApi.getStatus(mudId),
    enabled: !!mudId,
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useMudStatusHistory(mudId: string, days = 7) {
  return useQuery({
    queryKey: mudKeys.statusHistory(mudId),
    queryFn: () => mudsApi.getStatusHistory(mudId, days),
    enabled: !!mudId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Genre Queries
export function useGenres() {
  return useQuery({
    queryKey: genreKeys.all,
    queryFn: () => genresApi.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// MUD Admin Queries
export function useManagedMuds() {
  return useQuery({
    queryKey: mudKeys.managed(),
    queryFn: () => mudAdminApi.getManagedMuds(),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useMudAnalytics(mudId: string, days = 30) {
  return useQuery({
    queryKey: mudKeys.analytics(mudId),
    queryFn: () => mudAdminApi.getAnalytics(mudId, days),
    enabled: !!mudId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMudAdmins(mudId: string) {
  return useQuery({
    queryKey: mudKeys.admins(mudId),
    queryFn: () => mudAdminApi.getAdmins(mudId),
    enabled: !!mudId,
    staleTime: 60 * 1000, // 1 minute
  });
}

// MUD Admin Mutations
export function useUpdateMud() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mudId, data }: { mudId: string; data: Partial<Mud> }) =>
      mudAdminApi.updateMud(mudId, data),
    onSuccess: (updatedMud) => {
      queryClient.setQueryData(mudKeys.detail(updatedMud.id), updatedMud);
      queryClient.setQueryData(mudKeys.detail(updatedMud.slug), updatedMud);
      queryClient.invalidateQueries({ queryKey: mudKeys.lists() });
    },
  });
}

export function useInitiateClaim() {
  return useMutation({
    mutationFn: ({ mudId, method }: { mudId: string; method: 'mssp' | 'metatag' }) =>
      mudAdminApi.initiateClaim(mudId, method),
  });
}

export function useVerifyClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mudId: string) => mudAdminApi.verifyClaim(mudId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mudKeys.managed() });
    },
  });
}

export function useInviteAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mudId, email, role }: { mudId: string; email: string; role: string }) =>
      mudAdminApi.inviteAdmin(mudId, email, role),
    onSuccess: (_, { mudId }) => {
      queryClient.invalidateQueries({ queryKey: mudKeys.admins(mudId) });
    },
  });
}

export function useRemoveAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mudId, userId }: { mudId: string; userId: string }) =>
      mudAdminApi.removeAdmin(mudId, userId),
    onSuccess: (_, { mudId }) => {
      queryClient.invalidateQueries({ queryKey: mudKeys.admins(mudId) });
    },
  });
}

export function useTransferOwnership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mudId, newOwnerId }: { mudId: string; newOwnerId: string }) =>
      mudAdminApi.transferOwnership(mudId, newOwnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mudKeys.managed() });
    },
  });
}
