import { prisma } from "@/lib/prisma";
import { Genre } from "@prisma/client";

export async function getGenresWithCounts() {
  const genreCounts = await prisma.mudGenre.groupBy({
    by: ["genre"],
    _count: { genre: true },
    orderBy: { _count: { genre: "desc" } },
  });

  // Get all genres with their counts (including zeros)
  const allGenres = Object.values(Genre);
  const countMap = new Map(genreCounts.map((g) => [g.genre, g._count.genre]));

  return allGenres.map((genre) => ({
    genre,
    displayName: formatGenreName(genre),
    count: countMap.get(genre) || 0,
  }));
}

export async function getPopularGenres(limit = 5) {
  const genreCounts = await prisma.mudGenre.groupBy({
    by: ["genre"],
    _count: { genre: true },
    orderBy: { _count: { genre: "desc" } },
    take: limit,
  });

  return genreCounts.map((g) => ({
    genre: g.genre,
    displayName: formatGenreName(g.genre),
    count: g._count.genre,
  }));
}

function formatGenreName(genre: Genre): string {
  const names: Record<Genre, string> = {
    FANTASY: "Fantasy",
    SCI_FI: "Sci-Fi",
    HORROR: "Horror",
    ROLEPLAY: "Roleplay",
    PVP: "PvP",
    SOCIAL: "Social",
    EDUCATIONAL: "Educational",
    HISTORICAL: "Historical",
    SUPERHERO: "Superhero",
    CUSTOM: "Custom",
  };
  return names[genre] || genre;
}
