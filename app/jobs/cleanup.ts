/**
 * Database Cleanup Job
 *
 * This script performs periodic cleanup tasks:
 * - Removes old MUD status records (older than 30 days)
 * - Removes old activity events (older than 90 days)
 * - Removes expired refresh tokens
 *
 * Run via cron daily.
 *
 * Usage: npx tsx jobs/cleanup.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runCleanup() {
  console.log("Starting database cleanup...\n");

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Clean up old MUD status records
  console.log("Cleaning up old MUD status records (>30 days)...");
  const deletedStatus = await prisma.mudStatus.deleteMany({
    where: {
      createdAt: { lt: thirtyDaysAgo },
    },
  });
  console.log(`  Deleted ${deletedStatus.count} status records`);

  // Clean up old activity events
  console.log("Cleaning up old activity events (>90 days)...");
  const deletedActivity = await prisma.activityEvent.deleteMany({
    where: {
      createdAt: { lt: ninetyDaysAgo },
    },
  });
  console.log(`  Deleted ${deletedActivity.count} activity events`);

  // Clean up expired refresh tokens
  console.log("Cleaning up expired refresh tokens...");
  const deletedTokens = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: now } },
        { isRevoked: true },
      ],
    },
  });
  console.log(`  Deleted ${deletedTokens.count} expired tokens`);

  // Clean up soft-deleted reviews older than 30 days
  console.log("Permanently deleting old soft-deleted reviews...");
  const deletedReviews = await prisma.review.deleteMany({
    where: {
      isDeleted: true,
      deletedAt: { lt: thirtyDaysAgo },
    },
  });
  console.log(`  Deleted ${deletedReviews.count} soft-deleted reviews`);

  console.log("\n--- Cleanup Summary ---");
  console.log(`Status records: ${deletedStatus.count}`);
  console.log(`Activity events: ${deletedActivity.count}`);
  console.log(`Refresh tokens: ${deletedTokens.count}`);
  console.log(`Soft-deleted reviews: ${deletedReviews.count}`);
}

// Run the job
runCleanup()
  .then(() => {
    console.log("\nCleanup job completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nCleanup job failed:", error);
    process.exit(1);
  });
