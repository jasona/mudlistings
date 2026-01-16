import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createWrapper, mockUser, mockTokens } from '@/test/test-utils';

// Mock the API module
vi.mock('@/lib/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    verifyEmail: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
  },
  getStoredTokens: vi.fn(),
  setStoredTokens: vi.fn(),
}));

// Mock the auth store
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({
    setUser: vi.fn(),
    setIsAuthenticated: vi.fn(),
  }),
}));

import { authApi, getStoredTokens, setStoredTokens } from '@/lib/api';
import {
  useCurrentUser,
  useLogin,
  useRegister,
  useLogout,
  useVerifyEmail,
  useForgotPassword,
  useResetPassword,
  authKeys,
} from './use-auth';

describe('use-auth hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authKeys', () => {
    it('should generate correct query keys', () => {
      expect(authKeys.all).toEqual(['auth']);
      expect(authKeys.user()).toEqual(['auth', 'user']);
    });
  });

  describe('useCurrentUser', () => {
    it('should return null when no tokens stored', async () => {
      vi.mocked(getStoredTokens).mockReturnValue(null);

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeNull();
    });

    it('should fetch user when tokens exist', async () => {
      vi.mocked(getStoredTokens).mockReturnValue(mockTokens);
      vi.mocked(authApi.getCurrentUser).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockUser);
      expect(authApi.getCurrentUser).toHaveBeenCalled();
    });

    it('should clear tokens on error', async () => {
      vi.mocked(getStoredTokens).mockReturnValue(mockTokens);
      vi.mocked(authApi.getCurrentUser).mockRejectedValue(new Error('Unauthorized'));

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeNull();
      expect(setStoredTokens).toHaveBeenCalledWith(null);
    });
  });

  describe('useLogin', () => {
    it('should login successfully', async () => {
      const loginResponse = { user: mockUser, tokens: mockTokens };
      vi.mocked(authApi.login).mockResolvedValue(loginResponse);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ email: 'test@example.com', password: 'password123' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(authApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(setStoredTokens).toHaveBeenCalledWith(mockTokens);
    });

    it('should handle login error', async () => {
      vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ email: 'test@example.com', password: 'wrong' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useRegister', () => {
    it('should register successfully', async () => {
      vi.mocked(authApi.register).mockResolvedValue({ message: 'Check your email' });

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        email: 'new@example.com',
        password: 'password123',
        displayName: 'New User',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(authApi.register).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        displayName: 'New User',
      });
    });
  });

  describe('useLogout', () => {
    it('should logout successfully', async () => {
      vi.mocked(authApi.logout).mockResolvedValue(undefined);

      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(authApi.logout).toHaveBeenCalled();
      expect(setStoredTokens).toHaveBeenCalledWith(null);
    });

    it('should clear local state even on API error', async () => {
      vi.mocked(authApi.logout).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      // Should still clear tokens even on error
      expect(setStoredTokens).toHaveBeenCalledWith(null);
    });
  });

  describe('useVerifyEmail', () => {
    it('should verify email successfully', async () => {
      vi.mocked(authApi.verifyEmail).mockResolvedValue({ message: 'Email verified' });

      const { result } = renderHook(() => useVerifyEmail(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('verification-token-123');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(authApi.verifyEmail).toHaveBeenCalledWith('verification-token-123');
    });
  });

  describe('useForgotPassword', () => {
    it('should send forgot password email', async () => {
      vi.mocked(authApi.forgotPassword).mockResolvedValue({ message: 'Email sent' });

      const { result } = renderHook(() => useForgotPassword(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('test@example.com');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(authApi.forgotPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('useResetPassword', () => {
    it('should reset password successfully', async () => {
      vi.mocked(authApi.resetPassword).mockResolvedValue({ message: 'Password reset' });

      const { result } = renderHook(() => useResetPassword(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ token: 'reset-token', password: 'newpassword123' });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(authApi.resetPassword).toHaveBeenCalledWith('reset-token', 'newpassword123');
    });
  });
});
