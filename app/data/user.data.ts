import { prisma } from "@/lib/prisma";

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      role: true,
      isProfilePublic: true,
      showFavoritesPublicly: true,
      createdAt: true,
      lastLoginAt: true,
      _count: {
        select: {
          reviews: true,
          favorites: true,
        },
      },
    },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

export async function getPublicProfile(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      role: true,
      isProfilePublic: true,
      showFavoritesPublicly: true,
      createdAt: true,
      _count: {
        select: {
          reviews: true,
          favorites: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return user;
}

export async function getUserReviews(userId: string, page = 1, pageSize = 10) {
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { userId, isDeleted: false },
      include: {
        mud: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.review.count({
      where: { userId, isDeleted: false },
    }),
  ]);

  return {
    data: reviews,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getUserStats(userId: string) {
  const [reviewCount, favoriteCount, helpfulVotesReceived] = await Promise.all([
    prisma.review.count({ where: { userId, isDeleted: false } }),
    prisma.favorite.count({ where: { userId } }),
    prisma.review.aggregate({
      where: { userId, isDeleted: false },
      _sum: { helpfulCount: true },
    }),
  ]);

  return {
    reviewCount,
    favoriteCount,
    helpfulVotesReceived: helpfulVotesReceived._sum.helpfulCount || 0,
  };
}
