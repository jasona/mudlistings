import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth-store';
import type { User } from '@/types';

describe('authStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });
  });

  it('has correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(true);
  });

  it('sets user correctly', () => {
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      displayName: 'Test User',
      role: 'Player',
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
    };

    useAuthStore.getState().setUser(mockUser);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
  });

  it('sets isAuthenticated correctly', () => {
    useAuthStore.getState().setIsAuthenticated(true);

    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    useAuthStore.getState().setIsAuthenticated(false);

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('sets isLoading correctly', () => {
    useAuthStore.getState().setIsLoading(false);

    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('resets state correctly', () => {
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      displayName: 'Test User',
      role: 'Player',
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
    };

    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().setIsAuthenticated(true);
    useAuthStore.getState().setIsLoading(false);

    useAuthStore.getState().reset();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(true);
  });
});
