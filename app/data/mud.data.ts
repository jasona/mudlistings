import { prisma } from "@/lib/prisma";
import { Genre } from "@prisma/client";
import type { MudSearchParams, MudSortBy } from "@/types";

export async function getMuds(params: MudSearchParams = {}) {
  const {
    query,
    genre,
    isOnline,
    minRating,
    page = 1,
    pageSize = 20,
    sortBy = "trendingScore",
    sortDirection = "desc",
  } = params;

  const where = {
    isDeleted: false,
    ...(query && {
      OR: [
        { name: { contains: query, mode: "insensitive" as const } },
        { description: { contains: query, mode: "insensitive" as const } },
        { shortDescription: { contains: query, mode: "insensitive" as const } },
      ],
    }),
    ...(genre && {
      genres: { some: { genre } },
    }),
    ...(isOnline !== undefined && { isOnline }),
    ...(minRating && { ratingAverage: { gte: minRating } }),
  };

  const orderBy = getOrderBy(sortBy, sortDirection);

  const [muds, total] = await Promise.all([
    prisma.mud.findMany({
      where,
      include: { genres: true },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.mud.count({ where }),
  ]);

  return {
    data: muds,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getMudBySlug(slug: string, userId?: string) {
  const mud = await prisma.mud.findFirst({
    where: { slug, isDeleted: false },
    include: {
      genres: true,
      reviews: {
        where: { isDeleted: false, isHidden: false },
        include: {
          user: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
          reply: {
            include: {
              adminUser: {
                select: { id: true, displayName: true, avatarUrl: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: {
        select: { reviews: true, favorites: true },
      },
    },
  });

  if (!mud) return null;

  // Check if user has favorited this MUD
  let isFavorited = false;
  if (userId) {
    const favorite = await prisma.favorite.findUnique({
      where: { userId_mudId: { userId, mudId: mud.id } },
    });
    isFavorited = !!favorite;
  }

  return { ...mud, isFavorited };
}

export async function getMudById(id: string) {
  return prisma.mud.findFirst({
    where: { id, isDeleted: false },
    include: { genres: true },
  });
}

export async function getFeaturedMuds(limit = 10) {
  return prisma.mud.findMany({
    where: { isFeatured: true, isDeleted: false },
    include: { genres: true },
    orderBy: { featuredOrder: "asc" },
    take: limit,
  });
}

export async function getTrendingMuds(limit = 20) {
  return prisma.mud.findMany({
    where: { isDeleted: false },
    include: { genres: true },
    orderBy: { trendingScore: "desc" },
    take: limit,
  });
}

export async function getMudsByGenre(genre: Genre, limit = 20) {
  return prisma.mud.findMany({
    where: {
      isDeleted: false,
      genres: { some: { genre } },
    },
    include: { genres: true },
    orderBy: { trendingScore: "desc" },
    take: limit,
  });
}

export async function getRecentMuds(limit = 10) {
  return prisma.mud.findMany({
    where: { isDeleted: false },
    include: { genres: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getAutocomplete(query: string, limit = 10) {
  if (query.length < 2) return [];

  return prisma.mud.findMany({
    where: {
      isDeleted: false,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      isOnline: true,
    },
    orderBy: { trendingScore: "desc" },
    take: limit,
  });
}

export async function getMudStatus(mudId: string) {
  const mud = await prisma.mud.findUnique({
    where: { id: mudId },
    select: {
      isOnline: true,
      lastOnlineCheck: true,
      currentMsspData: true,
    },
  });

  return mud;
}

export async function getMudStatusHistory(mudId: string, hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  return prisma.mudStatus.findMany({
    where: {
      mudId,
      checkedAt: { gte: since },
    },
    orderBy: { checkedAt: "desc" },
  });
}

function getOrderBy(sortBy: MudSortBy, direction: "asc" | "desc") {
  const orderMap: Record<MudSortBy, object> = {
    name: { name: direction },
    trendingScore: { trendingScore: direction },
    ratingAverage: { ratingAverage: direction },
    ratingCount: { ratingCount: direction },
    favoriteCount: { favoriteCount: direction },
    createdAt: { createdAt: direction },
    playerCount: { currentMsspData: direction },
  };

  return orderMap[sortBy] || { trendingScore: "desc" };
}
