import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api';
import type { CreateReviewRequest } from '@/types';
import { mudKeys } from './use-muds';

export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  byMud: (mudId: string, page?: number) => [...reviewKeys.lists(), 'mud', mudId, page] as const,
  byUser: (userId: string, page?: number) => [...reviewKeys.lists(), 'user', userId, page] as const,
};

export function useReviewsByMud(mudId: string, page = 1, pageSize = 10) {
  return useQuery({
    queryKey: reviewKeys.byMud(mudId, page),
    queryFn: () => reviewsApi.getByMud(mudId, page, pageSize),
    enabled: !!mudId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useReviewsByUser(userId: string, page = 1) {
  return useQuery({
    queryKey: reviewKeys.byUser(userId, page),
    queryFn: () => reviewsApi.getByUser(userId, page),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mudId, data }: { mudId: string; data: CreateReviewRequest }) =>
      reviewsApi.create(mudId, data),
    onSuccess: (_, { mudId }) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.byMud(mudId) });
      queryClient.invalidateQueries({ queryKey: mudKeys.detail(mudId) });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: Partial<CreateReviewRequest> }) =>
      reviewsApi.update(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => reviewsApi.delete(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
}

export function useMarkReviewHelpful() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => reviewsApi.markHelpful(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
}

export function useReplyToReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, body }: { reviewId: string; body: string }) =>
      reviewsApi.reply(reviewId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
}

export function useReportReview() {
  return useMutation({
    mutationFn: ({ reviewId, reason, details }: { reviewId: string; reason: string; details?: string }) =>
      reviewsApi.report(reviewId, reason, details),
  });
}
