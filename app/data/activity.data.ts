import { prisma } from "@/lib/prisma";

export async function getGlobalActivity(page = 1, pageSize = 20) {
  const [events, total] = await Promise.all([
    prisma.activityEvent.findMany({
      include: {
        user: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
        mud: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.activityEvent.count(),
  ]);

  return {
    data: events,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getPersonalizedActivity(userId: string, page = 1, pageSize = 20) {
  // Get user's favorited MUD IDs
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { mudId: true },
  });
  const favoriteMudIds = favorites.map((f) => f.mudId);

  if (favoriteMudIds.length === 0) {
    return getGlobalActivity(page, pageSize);
  }

  const [events, total] = await Promise.all([
    prisma.activityEvent.findMany({
      where: {
        mudId: { in: favoriteMudIds },
      },
      include: {
        user: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
        mud: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.activityEvent.count({
      where: { mudId: { in: favoriteMudIds } },
    }),
  ]);

  return {
    data: events,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getMudActivity(mudId: string, page = 1, pageSize = 20) {
  const [events, total] = await Promise.all([
    prisma.activityEvent.findMany({
      where: { mudId },
      include: {
        user: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
        mud: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.activityEvent.count({ where: { mudId } }),
  ]);

  return {
    data: events,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
