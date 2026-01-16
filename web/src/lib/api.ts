import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type {
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  User,
  Mud,
  MudListItem,
  MudSearchResult,
  MudSearchParams,
  Genre,
  Review,
  CreateReviewRequest,
  ActivityEvent,
  Favorite,
  MudAnalytics,
  ReportedReview,
  SiteStats,
  PaginatedResult,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage helpers
const TOKEN_KEY = 'mudlistings_tokens';

export const getStoredTokens = (): AuthTokens | null => {
  try {
    const stored = localStorage.getItem(TOKEN_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const setStoredTokens = (tokens: AuthTokens | null): void => {
  if (tokens) {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tokens = getStoredTokens();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const tokens = getStoredTokens();
      if (!tokens?.refreshToken) {
        setStoredTokens(null);
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<AuthTokens>(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: tokens.refreshToken,
        });

        const newTokens = response.data;
        setStoredTokens(newTokens);
        processQueue(null, newTokens.accessToken);

        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        setStoredTokens(null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<{ message: string }> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    setStoredTokens(null);
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

// MUDs API
export const mudsApi = {
  search: async (params: MudSearchParams): Promise<MudSearchResult> => {
    const response = await api.get('/muds', { params });
    return response.data;
  },

  getById: async (idOrSlug: string): Promise<Mud> => {
    const response = await api.get(`/muds/${idOrSlug}`);
    return response.data;
  },

  getFeatured: async (): Promise<MudListItem[]> => {
    const response = await api.get('/muds/featured');
    return response.data;
  },

  getTrending: async (limit?: number): Promise<MudListItem[]> => {
    const response = await api.get('/muds/trending', { params: { limit } });
    return response.data;
  },

  autocomplete: async (query: string): Promise<{ id: string; name: string; slug: string }[]> => {
    const response = await api.get('/muds/autocomplete', { params: { q: query } });
    return response.data;
  },

  getStatus: async (mudId: string): Promise<{ isOnline: boolean; players: number; lastChecked: string }> => {
    const response = await api.get(`/muds/${mudId}/status`);
    return response.data;
  },

  getStatusHistory: async (mudId: string, days?: number): Promise<Array<{ timestamp: string; players: number; isOnline: boolean }>> => {
    const response = await api.get(`/muds/${mudId}/status/history`, { params: { days } });
    return response.data;
  },
};

// Genres API
export const genresApi = {
  getAll: async (): Promise<Genre[]> => {
    const response = await api.get('/genres');
    return response.data;
  },
};

// Reviews API
export const reviewsApi = {
  getByMud: async (mudId: string, page?: number, pageSize?: number): Promise<PaginatedResult<Review>> => {
    const response = await api.get(`/muds/${mudId}/reviews`, { params: { page, pageSize } });
    return response.data;
  },

  create: async (mudId: string, data: CreateReviewRequest): Promise<Review> => {
    const response = await api.post(`/muds/${mudId}/reviews`, data);
    return response.data;
  },

  update: async (reviewId: string, data: Partial<CreateReviewRequest>): Promise<Review> => {
    const response = await api.put(`/reviews/${reviewId}`, data);
    return response.data;
  },

  delete: async (reviewId: string): Promise<void> => {
    await api.delete(`/reviews/${reviewId}`);
  },

  markHelpful: async (reviewId: string): Promise<{ helpfulCount: number }> => {
    const response = await api.post(`/reviews/${reviewId}/helpful`);
    return response.data;
  },

  reply: async (reviewId: string, body: string): Promise<Review> => {
    const response = await api.post(`/reviews/${reviewId}/reply`, { body });
    return response.data;
  },

  report: async (reviewId: string, reason: string, details?: string): Promise<{ message: string }> => {
    const response = await api.post(`/reviews/${reviewId}/report`, { reason, details });
    return response.data;
  },

  getByUser: async (userId: string, page?: number): Promise<PaginatedResult<Review & { mudName: string; mudSlug: string }>> => {
    const response = await api.get(`/users/${userId}/reviews`, { params: { page } });
    return response.data;
  },
};

// Favorites API
export const favoritesApi = {
  toggle: async (mudId: string): Promise<{ isFavorited: boolean }> => {
    const response = await api.post(`/muds/${mudId}/favorite`);
    return response.data;
  },

  getMine: async (page?: number): Promise<PaginatedResult<Favorite>> => {
    const response = await api.get('/users/me/favorites', { params: { page } });
    return response.data;
  },

  getByUser: async (userId: string, page?: number): Promise<PaginatedResult<Favorite>> => {
    const response = await api.get(`/users/${userId}/favorites`, { params: { page } });
    return response.data;
  },
};

// Activity API
export const activityApi = {
  getGlobal: async (page?: number, pageSize?: number): Promise<PaginatedResult<ActivityEvent>> => {
    const response = await api.get('/activity', { params: { page, pageSize } });
    return response.data;
  },

  getPersonalized: async (page?: number, pageSize?: number): Promise<PaginatedResult<ActivityEvent>> => {
    const response = await api.get('/activity/personalized', { params: { page, pageSize } });
    return response.data;
  },
};

// User API
export const usersApi = {
  getProfile: async (userId: string): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateProfile: async (data: Partial<{ displayName: string; avatarUrl: string }>): Promise<User> => {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.put('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// MUD Admin API
export const mudAdminApi = {
  getManagedMuds: async (): Promise<MudListItem[]> => {
    const response = await api.get('/users/me/muds');
    return response.data;
  },

  initiateClaim: async (mudId: string, method: 'mssp' | 'metatag'): Promise<{ verificationCode: string; instructions: string }> => {
    const response = await api.post(`/muds/${mudId}/claim`, { method });
    return response.data;
  },

  verifyClaim: async (mudId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/muds/${mudId}/claim/verify`);
    return response.data;
  },

  updateMud: async (mudId: string, data: Partial<Mud>): Promise<Mud> => {
    const response = await api.put(`/muds/${mudId}`, data);
    return response.data;
  },

  getAnalytics: async (mudId: string, days?: number): Promise<MudAnalytics> => {
    const response = await api.get(`/muds/${mudId}/analytics`, { params: { days } });
    return response.data;
  },

  getAdmins: async (mudId: string): Promise<Array<{ userId: string; displayName: string; role: string }>> => {
    const response = await api.get(`/muds/${mudId}/admins`);
    return response.data;
  },

  inviteAdmin: async (mudId: string, email: string, role: string): Promise<{ message: string }> => {
    const response = await api.post(`/muds/${mudId}/admins/invite`, { email, role });
    return response.data;
  },

  removeAdmin: async (mudId: string, userId: string): Promise<void> => {
    await api.delete(`/muds/${mudId}/admins/${userId}`);
  },

  transferOwnership: async (mudId: string, newOwnerId: string): Promise<{ message: string }> => {
    const response = await api.post(`/muds/${mudId}/transfer`, { newOwnerId });
    return response.data;
  },
};

// Site Admin API
export const adminApi = {
  getStats: async (): Promise<SiteStats> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getModerationQueue: async (page?: number, status?: string): Promise<PaginatedResult<ReportedReview>> => {
    const response = await api.get('/admin/moderation', { params: { page, status } });
    return response.data;
  },

  moderateReport: async (reportId: string, action: 'approve' | 'hide' | 'delete', reason?: string): Promise<{ message: string }> => {
    const response = await api.post(`/admin/moderation/${reportId}`, { action, reason });
    return response.data;
  },

  getUsers: async (page?: number, search?: string): Promise<PaginatedResult<User>> => {
    const response = await api.get('/admin/users', { params: { page, search } });
    return response.data;
  },

  changeUserRole: async (userId: string, role: string): Promise<{ message: string }> => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  setFeatured: async (mudId: string, isFeatured: boolean): Promise<{ message: string }> => {
    if (isFeatured) {
      const response = await api.post(`/admin/muds/${mudId}/feature`);
      return response.data;
    } else {
      const response = await api.delete(`/admin/muds/${mudId}/feature`);
      return response.data;
    }
  },

  updateFeaturedOrder: async (mudIds: string[]): Promise<{ message: string }> => {
    const response = await api.put('/admin/featured/order', { mudIds });
    return response.data;
  },

  createMud: async (data: Partial<Mud>): Promise<Mud> => {
    const response = await api.post('/admin/muds', data);
    return response.data;
  },

  importMuds: async (file: File): Promise<{ successCount: number; errorCount: number; errors: Array<{ row: number; message: string }> }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/admin/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getAuditLogs: async (page?: number, action?: string, userId?: string): Promise<PaginatedResult<{ id: string; action: string; targetType: string; targetId: string; userId: string; userDisplayName: string; details: string; createdAt: string }>> => {
    const response = await api.get('/admin/audit', { params: { page, action, userId } });
    return response.data;
  },
};

export default api;
