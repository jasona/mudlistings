import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, setStoredTokens, getStoredTokens } from '@/lib/api';
import type { LoginRequest, RegisterRequest, User, AuthTokens } from '@/types';
import { useAuthStore } from '@/stores/auth-store';

export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

export function useCurrentUser() {
  const { setUser, setIsAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const tokens = getStoredTokens();
      if (!tokens) {
        setUser(null);
        setIsAuthenticated(false);
        return null;
      }
      try {
        const user = await authApi.getCurrentUser();
        setUser(user);
        setIsAuthenticated(true);
        return user;
      } catch {
        setStoredTokens(null);
        setUser(null);
        setIsAuthenticated(false);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { setUser, setIsAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response: { user: User; tokens: AuthTokens }) => {
      setStoredTokens(response.tokens);
      setUser(response.user);
      setIsAuthenticated(true);
      queryClient.setQueryData(authKeys.user(), response.user);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { setUser, setIsAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      setStoredTokens(null);
      setUser(null);
      setIsAuthenticated(false);
      queryClient.clear();
    },
    onError: () => {
      // Still clear local state even if API call fails
      setStoredTokens(null);
      setUser(null);
      setIsAuthenticated(false);
      queryClient.clear();
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authApi.resetPassword(token, password),
  });
}
