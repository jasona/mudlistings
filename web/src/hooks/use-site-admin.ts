import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';

export const siteAdminKeys = {
  all: ['site-admin'] as const,
  stats: () => [...siteAdminKeys.all, 'stats'] as const,
  moderation: (page?: number, status?: string) =>
    [...siteAdminKeys.all, 'moderation', { page, status }] as const,
  users: (page?: number, search?: string) =>
    [...siteAdminKeys.all, 'users', { page, search }] as const,
  auditLogs: (page?: number, action?: string, userId?: string) =>
    [...siteAdminKeys.all, 'audit', { page, action, userId }] as const,
};

export function useSiteStats() {
  return useQuery({
    queryKey: siteAdminKeys.stats(),
    queryFn: () => adminApi.getStats(),
  });
}

export function useModerationQueue(page?: number, status?: string) {
  return useQuery({
    queryKey: siteAdminKeys.moderation(page, status),
    queryFn: () => adminApi.getModerationQueue(page, status),
  });
}

export function useModerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, action, reason }: {
      reportId: string;
      action: 'approve' | 'hide' | 'delete';
      reason?: string
    }) => adminApi.moderateReport(reportId, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteAdminKeys.moderation() });
      queryClient.invalidateQueries({ queryKey: siteAdminKeys.stats() });
    },
  });
}

export function useUsers(page?: number, search?: string) {
  return useQuery({
    queryKey: siteAdminKeys.users(page, search),
    queryFn: () => adminApi.getUsers(page, search),
  });
}

export function useChangeUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminApi.changeUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: siteAdminKeys.users() });
    },
  });
}

export function useSetFeatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mudId, isFeatured }: { mudId: string; isFeatured: boolean }) =>
      adminApi.setFeatured(mudId, isFeatured),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['muds'] });
    },
  });
}

export function useUpdateFeaturedOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mudIds: string[]) => adminApi.updateFeaturedOrder(mudIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['muds'] });
    },
  });
}

export function useCreateMud() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof adminApi.createMud>[0]) =>
      adminApi.createMud(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['muds'] });
    },
  });
}

export function useImportMuds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => adminApi.importMuds(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['muds'] });
    },
  });
}

export function useAuditLogs(page?: number, action?: string, userId?: string) {
  return useQuery({
    queryKey: siteAdminKeys.auditLogs(page, action, userId),
    queryFn: () => adminApi.getAuditLogs(page, action, userId),
  });
}
