import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createWrapper, mockReview, createPaginatedResponse } from '@/test/test-utils';

// Mock the API module
vi.mock('@/lib/api', () => ({
  reviewsApi: {
    getByMud: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    markHelpful: vi.fn(),
    reply: vi.fn(),
    report: vi.fn(),
    getByUser: vi.fn(),
  },
}));

import { reviewsApi } from '@/lib/api';
import {
  useReviewsByMud,
  useReviewsByUser,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
  useMarkReviewHelpful,
  useReplyToReview,
  useReportReview,
  reviewKeys,
} from './use-reviews';

describe('use-reviews hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('reviewKeys', () => {
    it('should generate correct query keys', () => {
      expect(reviewKeys.all).toEqual(['reviews']);
      expect(reviewKeys.lists()).toEqual(['reviews', 'list']);
      expect(reviewKeys.byMud('mud-123', 1)).toEqual(['reviews', 'list', 'mud', 'mud-123', 1]);
      expect(reviewKeys.byUser('user-123', 1)).toEqual(['reviews', 'list', 'user', 'user-123', 1]);
    });
  });

  describe('useReviewsByMud', () => {
    it('should fetch reviews for a MUD', async () => {
      const mockResponse = createPaginatedResponse([mockReview], 1, 10, 1);
      vi.mocked(reviewsApi.getByMud).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useReviewsByMud('mud-123', 1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(reviewsApi.getByMud).toHaveBeenCalledWith('mud-123', 1, 10);
    });

    it('should not fetch when mudId is empty', async () => {
      const { result } = renderHook(() => useReviewsByMud('', 1), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(reviewsApi.getByMud).not.toHaveBeenCalled();
    });
  });

  describe('useReviewsByUser', () => {
    it('should fetch reviews by a user', async () => {
      const mockResponse = createPaginatedResponse(
        [{ ...mockReview, mudName: 'Test MUD', mudSlug: 'test-mud' }],
        1,
        10,
        1
      );
      vi.mocked(reviewsApi.getByUser).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useReviewsByUser('user-123', 1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(reviewsApi.getByUser).toHaveBeenCalledWith('user-123', 1);
    });

    it('should not fetch when userId is empty', async () => {
      const { result } = renderHook(() => useReviewsByUser('', 1), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(reviewsApi.getByUser).not.toHaveBeenCalled();
    });
  });

  describe('useCreateReview', () => {
    it('should create a review successfully', async () => {
      vi.mocked(reviewsApi.create).mockResolvedValue(mockReview);

      const { result } = renderHook(() => useCreateReview(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        mudId: 'mud-123',
        data: { title: 'Great!', body: 'This is awesome.', rating: 5 },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(reviewsApi.create).toHaveBeenCalledWith('mud-123', {
        title: 'Great!',
        body: 'This is awesome.',
        rating: 5,
      });
      expect(result.current.data).toEqual(mockReview);
    });

    it('should handle create error', async () => {
      vi.mocked(reviewsApi.create).mockRejectedValue(new Error('Already reviewed'));

      const { result } = renderHook(() => useCreateReview(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        mudId: 'mud-123',
        data: { body: 'Review', rating: 5 },
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useUpdateReview', () => {
    it('should update a review successfully', async () => {
      const updatedReview = { ...mockReview, body: 'Updated review' };
      vi.mocked(reviewsApi.update).mockResolvedValue(updatedReview);

      const { result } = renderHook(() => useUpdateReview(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        reviewId: 'review-123',
        data: { body: 'Updated review' },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(reviewsApi.update).toHaveBeenCalledWith('review-123', { body: 'Updated review' });
    });
  });

  describe('useDeleteReview', () => {
    it('should delete a review successfully', async () => {
      vi.mocked(reviewsApi.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteReview(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('review-123');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(reviewsApi.delete).toHaveBeenCalledWith('review-123');
    });
  });

  describe('useMarkReviewHelpful', () => {
    it('should mark review as helpful', async () => {
      vi.mocked(reviewsApi.markHelpful).mockResolvedValue({ helpfulCount: 4 });

      const { result } = renderHook(() => useMarkReviewHelpful(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('review-123');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(reviewsApi.markHelpful).toHaveBeenCalledWith('review-123');
      expect(result.current.data).toEqual({ helpfulCount: 4 });
    });
  });

  describe('useReplyToReview', () => {
    it('should reply to a review successfully', async () => {
      const reviewWithReply = {
        ...mockReview,
        reply: {
          id: 'reply-123',
          body: 'Thank you for the feedback!',
          authorDisplayName: 'Admin',
          createdAt: '2024-01-15T00:00:00Z',
        },
      };
      vi.mocked(reviewsApi.reply).mockResolvedValue(reviewWithReply);

      const { result } = renderHook(() => useReplyToReview(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        reviewId: 'review-123',
        body: 'Thank you for the feedback!',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(reviewsApi.reply).toHaveBeenCalledWith('review-123', 'Thank you for the feedback!');
    });
  });

  describe('useReportReview', () => {
    it('should report a review successfully', async () => {
      vi.mocked(reviewsApi.report).mockResolvedValue({ message: 'Report submitted' });

      const { result } = renderHook(() => useReportReview(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        reviewId: 'review-123',
        reason: 'spam',
        details: 'This is spam content',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(reviewsApi.report).toHaveBeenCalledWith('review-123', 'spam', 'This is spam content');
    });

    it('should report without details', async () => {
      vi.mocked(reviewsApi.report).mockResolvedValue({ message: 'Report submitted' });

      const { result } = renderHook(() => useReportReview(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        reviewId: 'review-123',
        reason: 'offensive',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(reviewsApi.report).toHaveBeenCalledWith('review-123', 'offensive', undefined);
    });
  });
});
