import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mudAdminApi } from '@/lib/api';
import type { Mud } from '@/types';

export const adminKeys = {
  all: ['admin'] as const,
  managedMuds: () => [...adminKeys.all, 'managed-muds'] as const,
  analytics: (mudId: string) => [...adminKeys.all, 'analytics', mudId] as const,
  admins: (mudId: string) => [...adminKeys.all, 'admins', mudId] as const,
};

export function useManagedMuds() {
  return useQuery({
    queryKey: adminKeys.managedMuds(),
    queryFn: () => mudAdminApi.getManagedMuds(),
  });
}

export function useMudAnalytics(mudId: string, days?: number) {
  return useQuery({
    queryKey: [...adminKeys.analytics(mudId), days],
    queryFn: () => mudAdminApi.getAnalytics(mudId, days),
    enabled: Boolean(mudId),
  });
}

export function useMudAdmins(mudId: string) {
  return useQuery({
    queryKey: adminKeys.admins(mudId),
    queryFn: () => mudAdminApi.getAdmins(mudId),
    enabled: Boolean(mudId),
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
      queryClient.invalidateQueries({ queryKey: adminKeys.managedMuds() });
    },
  });
}

export function useUpdateMud() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mudId, data }: { mudId: string; data: Partial<Mud> }) =>
      mudAdminApi.updateMud(mudId, data),
    onSuccess: (_, { mudId }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.managedMuds() });
      queryClient.invalidateQueries({ queryKey: ['muds', mudId] });
    },
  });
}

export function useInviteAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mudId, email, role }: { mudId: string; email: string; role: string }) =>
      mudAdminApi.inviteAdmin(mudId, email, role),
    onSuccess: (_, { mudId }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.admins(mudId) });
    },
  });
}

export function useRemoveAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mudId, userId }: { mudId: string; userId: string }) =>
      mudAdminApi.removeAdmin(mudId, userId),
    onSuccess: (_, { mudId }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.admins(mudId) });
    },
  });
}

export function useTransferOwnership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mudId, newOwnerId }: { mudId: string; newOwnerId: string }) =>
      mudAdminApi.transferOwnership(mudId, newOwnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}
