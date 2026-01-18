/**
 * Trending Score Update Job
 *
 * This script recalculates trending scores for all MUDs based on:
 * - Recent reviews (7 days)
 * - Recent favorites (7 days)
 * - Overall rating
 * - Online status
 * - Current player count
 *
 * Run via cron every hour.
 *
 * Usage: npx tsx jobs/trending-update.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Scoring weights
const WEIGHTS = {
  RATING: 0.3, // Weight for rating * review count
  RECENT_REVIEWS: 10, // Points per recent review
  RECENT_FAVORITES: 5, // Points per recent favorite
  ONLINE_BONUS: 20, // Bonus for being online
  PLAYER_MULTIPLIER: 0.5, // Points per current player
};

async function updateTrendingScores() {
  console.log("Starting trending score update...");

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Get all non-deleted MUDs with their metrics
  const muds = await prisma.mud.findMany({
    where: { isDeleted: false },
    select: {
      id: true,
      name: true,
      ratingAverage: true,
      ratingCount: true,
      isOnline: true,
      currentMsspData: true,
      _count: {
        select: {
          reviews: {
            where: {
              createdAt: { gte: sevenDaysAgo },
              isDeleted: false,
            },
          },
          favorites: {
            where: {
              createdAt: { gte: sevenDaysAgo },
            },
          },
        },
      },
    },
  });

  console.log(`Calculating scores for ${muds.length} MUDs...`);

  let updated = 0;

  for (const mud of muds) {
    // Calculate trending score components
    const ratingScore =
      (mud.ratingAverage || 0) * (mud.ratingCount || 0) * WEIGHTS.RATING;

    const recentReviewScore =
      (mud._count?.reviews || 0) * WEIGHTS.RECENT_REVIEWS;

    const recentFavoriteScore =
      (mud._count?.favorites || 0) * WEIGHTS.RECENT_FAVORITES;

    const onlineBonus = mud.isOnline ? WEIGHTS.ONLINE_BONUS : 0;

    // Get player count from MSSP data
    let playerScore = 0;
    if (
      mud.currentMsspData &&
      typeof mud.currentMsspData === "object" &&
      "players" in mud.currentMsspData
    ) {
      const players = (mud.currentMsspData as { players?: number }).players;
      if (typeof players === "number") {
        playerScore = players * WEIGHTS.PLAYER_MULTIPLIER;
      }
    }

    // Calculate total score
    const trendingScore =
      ratingScore +
      recentReviewScore +
      recentFavoriteScore +
      onlineBonus +
      playerScore;

    // Update the MUD
    await prisma.mud.update({
      where: { id: mud.id },
      data: { trendingScore },
    });

    updated++;

    // Log top scorers
    if (trendingScore > 50) {
      console.log(
        `  ${mud.name}: ${trendingScore.toFixed(2)} ` +
          `(rating: ${ratingScore.toFixed(1)}, ` +
          `reviews: ${recentReviewScore}, ` +
          `favorites: ${recentFavoriteScore}, ` +
          `online: ${onlineBonus}, ` +
          `players: ${playerScore.toFixed(1)})`
      );
    }
  }

  console.log(`\nUpdated ${updated} MUDs`);

  // Log top 10 trending
  const topTrending = await prisma.mud.findMany({
    where: { isDeleted: false },
    orderBy: { trendingScore: "desc" },
    take: 10,
    select: { name: true, trendingScore: true },
  });

  console.log("\n--- Top 10 Trending ---");
  topTrending.forEach((mud, i) => {
    console.log(`${i + 1}. ${mud.name} (${mud.trendingScore.toFixed(2)})`);
  });
}

// Run the job
updateTrendingScores()
  .then(() => {
    console.log("\nTrending update job completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nTrending update job failed:", error);
    process.exit(1);
  });
