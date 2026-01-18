import { prisma } from "@/lib/prisma";

export type ReviewSortBy = "newest" | "oldest" | "highestRating" | "lowestRating" | "mostHelpful";

export async function getReviewById(id: string, userId?: string) {
  const review = await prisma.review.findFirst({
    where: { id, isDeleted: false },
    include: {
      user: {
        select: { id: true, displayName: true, avatarUrl: true },
      },
      mud: {
        select: { id: true, name: true, slug: true },
      },
      reply: {
        include: {
          adminUser: {
            select: { id: true, displayName: true, avatarUrl: true },
          },
        },
      },
    },
  });

  if (!review) return null;

  // Check if user has voted helpful
  let hasVotedHelpful = false;
  if (userId) {
    const vote = await prisma.reviewHelpful.findUnique({
      where: { reviewId_userId: { reviewId: id, userId } },
    });
    hasVotedHelpful = !!vote;
  }

  return { ...review, hasVotedHelpful };
}

export async function getReviewsByMud(
  mudId: string,
  sortBy: ReviewSortBy = "newest",
  page = 1,
  pageSize = 10,
  userId?: string
) {
  const orderBy = getReviewOrderBy(sortBy);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { mudId, isDeleted: false, isHidden: false },
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
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.review.count({
      where: { mudId, isDeleted: false, isHidden: false },
    }),
  ]);

  // Get user's helpful votes if logged in
  let userHelpfulVotes: Set<string> = new Set();
  if (userId && reviews.length > 0) {
    const votes = await prisma.reviewHelpful.findMany({
      where: {
        userId,
        reviewId: { in: reviews.map((r) => r.id) },
      },
      select: { reviewId: true },
    });
    userHelpfulVotes = new Set(votes.map((v) => v.reviewId));
  }

  const reviewsWithVotes = reviews.map((review) => ({
    ...review,
    hasVotedHelpful: userHelpfulVotes.has(review.id),
  }));

  return {
    data: reviewsWithVotes,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getReviewsByUser(userId: string, page = 1, pageSize = 10) {
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { userId, isDeleted: false },
      include: {
        mud: {
          select: { id: true, name: true, slug: true },
        },
        reply: true,
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

export async function getRatingDistribution(mudId: string) {
  const distribution = await prisma.review.groupBy({
    by: ["rating"],
    where: { mudId, isDeleted: false, isHidden: false },
    _count: { rating: true },
  });

  // Convert to object with all ratings 1-5
  const result: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  distribution.forEach((d) => {
    result[d.rating] = d._count.rating;
  });

  return result;
}

export async function hasUserReviewed(userId: string, mudId: string) {
  const review = await prisma.review.findFirst({
    where: { userId, mudId, isDeleted: false },
    select: { id: true },
  });
  return !!review;
}

export async function getUserReviewForMud(userId: string, mudId: string) {
  return prisma.review.findFirst({
    where: { userId, mudId, isDeleted: false },
  });
}

export async function hasUserVotedHelpful(userId: string, reviewId: string) {
  const vote = await prisma.reviewHelpful.findUnique({
    where: { reviewId_userId: { reviewId, userId } },
  });
  return !!vote;
}

function getReviewOrderBy(sortBy: ReviewSortBy) {
  switch (sortBy) {
    case "oldest":
      return { createdAt: "asc" as const };
    case "highestRating":
      return { rating: "desc" as const };
    case "lowestRating":
      return { rating: "asc" as const };
    case "mostHelpful":
      return { helpfulCount: "desc" as const };
    case "newest":
    default:
      return { createdAt: "desc" as const };
  }
}
