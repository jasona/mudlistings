"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createReviewSchema = z.object({
  mudId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().min(10, "Review must be at least 10 characters").max(10000),
});

const updateReviewSchema = z.object({
  reviewId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().min(10).max(10000),
});

export async function createReview(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Must be logged in to write a review" };
  }

  const parsed = createReviewSchema.safeParse({
    mudId: formData.get("mudId"),
    rating: Number(formData.get("rating")),
    title: formData.get("title") || undefined,
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { mudId, rating, title, body } = parsed.data;

  // Check MUD exists
  const mud = await prisma.mud.findUnique({
    where: { id: mudId, isDeleted: false },
  });

  if (!mud) {
    return { error: "MUD not found" };
  }

  // Check if user already reviewed
  const existingReview = await prisma.review.findFirst({
    where: { mudId, userId: session.user.id, isDeleted: false },
  });

  if (existingReview) {
    return { error: "You have already reviewed this MUD" };
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      mudId,
      userId: session.user.id,
      rating,
      title,
      body,
    },
  });

  // Update MUD rating aggregate
  await updateMudRating(mudId);

  // Create activity event
  await prisma.activityEvent.create({
    data: {
      type: "REVIEW_POSTED",
      userId: session.user.id,
      mudId,
      description: `${session.user.displayName} reviewed ${mud.name}`,
    },
  });

  revalidatePath(`/muds/${mud.slug}`);
  return { success: true, reviewId: review.id };
}

export async function updateReview(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Must be logged in" };
  }

  const parsed = updateReviewSchema.safeParse({
    reviewId: formData.get("reviewId"),
    rating: Number(formData.get("rating")),
    title: formData.get("title") || undefined,
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { reviewId, rating, title, body } = parsed.data;

  // Check review exists and belongs to user
  const review = await prisma.review.findFirst({
    where: { id: reviewId, isDeleted: false },
    include: { mud: true },
  });

  if (!review) {
    return { error: "Review not found" };
  }

  if (review.userId !== session.user.id) {
    return { error: "You can only edit your own reviews" };
  }

  // Update review
  await prisma.review.update({
    where: { id: reviewId },
    data: { rating, title, body },
  });

  // Update MUD rating
  await updateMudRating(review.mudId);

  revalidatePath(`/muds/${review.mud.slug}`);
  return { success: true };
}

export async function deleteReview(reviewId: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Must be logged in" };
  }

  const review = await prisma.review.findFirst({
    where: { id: reviewId, isDeleted: false },
    include: { mud: true },
  });

  if (!review) {
    return { error: "Review not found" };
  }

  // Check ownership or admin
  const isOwner = review.userId === session.user.id;
  const isAdmin = session.user.role === "SITE_ADMIN";

  if (!isOwner && !isAdmin) {
    return { error: "You can only delete your own reviews" };
  }

  // Soft delete
  await prisma.review.update({
    where: { id: reviewId },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  // Update MUD rating
  await updateMudRating(review.mudId);

  revalidatePath(`/muds/${review.mud.slug}`);
  return { success: true };
}

export async function toggleHelpful(reviewId: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Must be logged in" };
  }

  const review = await prisma.review.findFirst({
    where: { id: reviewId, isDeleted: false },
  });

  if (!review) {
    return { error: "Review not found" };
  }

  // Can't vote on own review
  if (review.userId === session.user.id) {
    return { error: "You can't vote on your own review" };
  }

  const existingVote = await prisma.reviewHelpful.findUnique({
    where: {
      reviewId_userId: { reviewId, userId: session.user.id },
    },
  });

  if (existingVote) {
    // Remove vote
    await prisma.$transaction([
      prisma.reviewHelpful.delete({
        where: { reviewId_userId: { reviewId, userId: session.user.id } },
      }),
      prisma.review.update({
        where: { id: reviewId },
        data: { helpfulCount: { decrement: 1 } },
      }),
    ]);
  } else {
    // Add vote
    await prisma.$transaction([
      prisma.reviewHelpful.create({
        data: { reviewId, userId: session.user.id },
      }),
      prisma.review.update({
        where: { id: reviewId },
        data: { helpfulCount: { increment: 1 } },
      }),
    ]);
  }

  revalidatePath("/");
  return { success: true, isHelpful: !existingVote };
}

export async function addAdminReply(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Must be logged in" };
  }

  // Check if user is MUD admin or site admin
  if (session.user.role !== "MUD_ADMIN" && session.user.role !== "SITE_ADMIN") {
    return { error: "Only MUD admins can reply to reviews" };
  }

  const reviewId = formData.get("reviewId") as string;
  const body = formData.get("body") as string;

  if (!reviewId || !body) {
    return { error: "Review ID and body are required" };
  }

  if (body.length < 10 || body.length > 5000) {
    return { error: "Reply must be between 10 and 5000 characters" };
  }

  const review = await prisma.review.findFirst({
    where: { id: reviewId, isDeleted: false },
    include: { mud: true, reply: true },
  });

  if (!review) {
    return { error: "Review not found" };
  }

  if (review.reply) {
    return { error: "This review already has a reply" };
  }

  // Verify user is admin of this MUD
  if (session.user.role !== "SITE_ADMIN") {
    const mudAdmin = await prisma.mudAdmin.findFirst({
      where: {
        mudId: review.mudId,
        userId: session.user.id,
        isVerified: true,
      },
    });

    if (!mudAdmin) {
      return { error: "You are not an admin of this MUD" };
    }
  }

  await prisma.reviewReply.create({
    data: {
      reviewId,
      adminUserId: session.user.id,
      body,
    },
  });

  revalidatePath(`/muds/${review.mud.slug}`);
  return { success: true };
}

export async function deleteAdminReply(reviewId: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Must be logged in" };
  }

  const reply = await prisma.reviewReply.findUnique({
    where: { reviewId },
    include: { review: { include: { mud: true } } },
  });

  if (!reply) {
    return { error: "Reply not found" };
  }

  // Check ownership or site admin
  if (reply.adminUserId !== session.user.id && session.user.role !== "SITE_ADMIN") {
    return { error: "You can only delete your own replies" };
  }

  await prisma.reviewReply.delete({
    where: { reviewId },
  });

  revalidatePath(`/muds/${reply.review.mud.slug}`);
  return { success: true };
}

export async function reportReview(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Must be logged in" };
  }

  const reviewId = formData.get("reviewId") as string;
  const reason = formData.get("reason") as string;
  const details = formData.get("details") as string;

  if (!reviewId || !reason) {
    return { error: "Review ID and reason are required" };
  }

  const review = await prisma.review.findFirst({
    where: { id: reviewId, isDeleted: false },
  });

  if (!review) {
    return { error: "Review not found" };
  }

  // Check if user already reported this review
  const existingReport = await prisma.reviewReport.findFirst({
    where: { reviewId, reporterId: session.user.id },
  });

  if (existingReport) {
    return { error: "You have already reported this review" };
  }

  await prisma.reviewReport.create({
    data: {
      reviewId,
      reporterId: session.user.id,
      reason,
      details,
    },
  });

  return { success: true };
}

async function updateMudRating(mudId: string) {
  const stats = await prisma.review.aggregate({
    where: { mudId, isDeleted: false, isHidden: false },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.mud.update({
    where: { id: mudId },
    data: {
      ratingAverage: stats._avg.rating || 0,
      ratingCount: stats._count.rating,
    },
  });
}
