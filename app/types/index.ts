import type { Mud, Review, User, Genre, MudGenre, Favorite } from "@prisma/client";

// MUD types
export type MudWithGenres = Mud & {
  genres: MudGenre[];
};

export type MudWithDetails = Mud & {
  genres: MudGenre[];
  reviews: (Review & { user: Pick<User, "id" | "displayName" | "avatarUrl"> })[];
  _count?: {
    reviews: number;
    favorites: number;
  };
};

// Search params
export interface MudSearchParams {
  query?: string;
  genre?: Genre;
  isOnline?: boolean;
  minRating?: number;
  page?: number;
  pageSize?: number;
  sortBy?: MudSortBy;
  sortDirection?: "asc" | "desc";
}

export type MudSortBy =
  | "name"
  | "trendingScore"
  | "ratingAverage"
  | "ratingCount"
  | "favoriteCount"
  | "createdAt"
  | "playerCount";

// Review types
export type ReviewWithUser = Review & {
  user: Pick<User, "id" | "displayName" | "avatarUrl">;
};

// Pagination
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Action results
export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}
