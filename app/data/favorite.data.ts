import { prisma } from "@/lib/prisma";

export async function getUserFavorites(userId: string, page = 1, pageSize = 20) {
  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
      include: {
        mud: {
          include: { genres: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.favorite.count({ where: { userId } }),
  ]);

  return {
    data: favorites.map((f) => f.mud),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function isFavorited(userId: string, mudId: string) {
  const favorite = await prisma.favorite.findUnique({
    where: { userId_mudId: { userId, mudId } },
  });
  return !!favorite;
}

export async function getFavoritedMudIds(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    select: { mudId: true },
  });
  return favorites.map((f) => f.mudId);
}

export async function getFavoriteCount(mudId: string) {
  return prisma.favorite.count({ where: { mudId } });
}
