// User types
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: string;
}

export type UserRole = 'Anonymous' | 'Player' | 'MudAdmin' | 'SiteAdmin';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

// MUD types
export interface Mud {
  id: string;
  name: string;
  slug: string;
  description: string;
  host: string;
  port: number;
  websiteUrl?: string;
  webClientUrl?: string;
  establishedDate?: string;
  codebase?: string;
  language?: string;
  isOnline: boolean;
  currentPlayers?: number;
  lastCheckedAt?: string;
  isFeatured: boolean;
  featuredOrder?: number;
  trendingScore: number;
  averageRating: number;
  reviewCount: number;
  favoriteCount: number;
  genres: Genre[];
  isFavorited?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MudListItem {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  host: string;
  port: number;
  isOnline: boolean;
  currentPlayers?: number;
  averageRating: number;
  reviewCount: number;
  genres: Genre[];
  isFavorited?: boolean;
}

export interface MudSearchResult {
  items: MudListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  mudCount?: number;
}

// Review types
export interface Review {
  id: string;
  mudId: string;
  userId: string;
  userDisplayName: string;
  userAvatarUrl?: string;
  title?: string;
  body: string;
  rating: number;
  helpfulCount: number;
  hasVotedHelpful?: boolean;
  isOwn?: boolean;
  reply?: ReviewReply;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewReply {
  id: string;
  body: string;
  authorDisplayName: string;
  createdAt: string;
}

export interface CreateReviewRequest {
  title?: string;
  body: string;
  rating: number;
}

// Activity types
export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  mudId?: string;
  mudName?: string;
  mudSlug?: string;
  userId?: string;
  userDisplayName?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type ActivityEventType = 'NewListing' | 'NewReview' | 'StatusChange' | 'Featured';

// Favorite types
export interface Favorite {
  id: string;
  mudId: string;
  mud: MudListItem;
  createdAt: string;
}

// Filter/Search types
export interface MudSearchParams {
  query?: string;
  genres?: string[];
  isOnline?: boolean;
  minPlayers?: number;
  minRating?: number;
  sortBy?: MudSortBy;
  page?: number;
  pageSize?: number;
}

export type MudSortBy = 'relevance' | 'players' | 'rating' | 'newest' | 'alphabetical' | 'trending';

// Analytics types (for MUD admins)
export interface MudAnalytics {
  mudId: string;
  totalViews: number;
  uniqueVisitors: number;
  clickThroughs: number;
  favoriteCount: number;
  reviewCount: number;
  averageRating: number;
  periodStart: string;
  periodEnd: string;
}

// Admin types
export interface ReportedReview {
  id: string;
  reviewId: string;
  reviewTitle?: string;
  reviewBody: string;
  reviewRating: number;
  reviewAuthorName: string;
  reviewAuthorId: string;
  mudName: string;
  mudId: string;
  reporterName: string;
  reporterId: string;
  reason: string;
  details?: string;
  status: ReportStatus;
  createdAt: string;
}

export type ReportStatus = 'Pending' | 'Approved' | 'Rejected' | 'ReviewHidden' | 'ReviewDeleted';

export interface SiteStats {
  totalMuds: number;
  onlineMuds: number;
  totalUsers: number;
  totalReviews: number;
  pendingReports: number;
  newMudsLast7Days: number;
  newUsersLast7Days: number;
  newReviewsLast7Days: number;
}

// Pagination
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API Response types
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}
