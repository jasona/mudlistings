import { prisma } from "@/lib/prisma";
import { ReportStatus, UserRole } from "@prisma/client";

export async function getSiteStats() {
  const [userCount, mudCount, reviewCount, onlineMuds, pendingReports] =
    await Promise.all([
      prisma.user.count(),
      prisma.mud.count({ where: { isDeleted: false } }),
      prisma.review.count({ where: { isDeleted: false } }),
      prisma.mud.count({ where: { isDeleted: false, isOnline: true } }),
      prisma.reviewReport.count({ where: { status: "PENDING" } }),
    ]);

  return {
    userCount,
    mudCount,
    reviewCount,
    onlineMuds,
    pendingReports,
  };
}

export async function getModerationQueue(
  status: ReportStatus = "PENDING",
  page = 1,
  pageSize = 20
) {
  const [reports, total] = await Promise.all([
    prisma.reviewReport.findMany({
      where: { status },
      include: {
        review: {
          include: {
            user: {
              select: { id: true, displayName: true, avatarUrl: true },
            },
            mud: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        reporter: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
        resolvedBy: {
          select: { id: true, displayName: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.reviewReport.count({ where: { status } }),
  ]);

  return {
    data: reports,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getUsers(
  search?: string,
  role?: UserRole,
  page = 1,
  pageSize = 20
) {
  const where = {
    ...(search && {
      OR: [
        { email: { contains: search, mode: "insensitive" as const } },
        { displayName: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(role && { role }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: { reviews: true, favorites: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getAuditLogs(
  filters: {
    action?: string;
    userId?: string;
    fromDate?: Date;
    toDate?: Date;
  } = {},
  page = 1,
  pageSize = 50
) {
  const where = {
    ...(filters.action && { action: filters.action }),
    ...(filters.userId && { userId: filters.userId }),
    ...(filters.fromDate &&
      filters.toDate && {
        createdAt: {
          gte: filters.fromDate,
          lte: filters.toDate,
        },
      }),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, displayName: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data: logs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getManagedMuds(userId: string) {
  const mudAdmins = await prisma.mudAdmin.findMany({
    where: { userId, isVerified: true },
    include: {
      mud: {
        include: { genres: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return mudAdmins.map((ma) => ({
    ...ma.mud,
    isOwner: ma.isOwner,
  }));
}

export async function getMudAnalytics(mudId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [mud, recentReviews, recentFavorites, statusHistory] = await Promise.all([
    prisma.mud.findUnique({
      where: { id: mudId },
      select: {
        viewCount: true,
        favoriteCount: true,
        ratingAverage: true,
        ratingCount: true,
      },
    }),
    prisma.review.count({
      where: { mudId, createdAt: { gte: thirtyDaysAgo }, isDeleted: false },
    }),
    prisma.favorite.count({
      where: { mudId, createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.mudStatus.findMany({
      where: { mudId, checkedAt: { gte: thirtyDaysAgo } },
      select: { isOnline: true, playerCount: true, checkedAt: true },
      orderBy: { checkedAt: "asc" },
    }),
  ]);

  return {
    ...mud,
    recentReviews,
    recentFavorites,
    statusHistory,
  };
}

export async function getFeaturedMudsAdmin() {
  return prisma.mud.findMany({
    where: { isFeatured: true, isDeleted: false },
    include: { genres: true },
    orderBy: { featuredOrder: "asc" },
  });
}
