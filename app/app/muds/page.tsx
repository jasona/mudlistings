import { Suspense } from "react";
import { getMuds } from "@/data/mud.data";
import { getGenresWithCounts } from "@/data/genre.data";
import { MudList } from "@/components/mud/mud-list";
import { MudFilters } from "@/components/mud/mud-filters";
import { Pagination } from "@/components/mud/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Genre } from "@prisma/client";

interface MudsPageProps {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    status?: string;
    sort?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: "Browse MUDs - MudListings",
  description: "Search and discover Multi-User Dungeon games",
};

export default async function MudsPage({ searchParams }: MudsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const pageSize = 20;

  const [mudsResult, genres] = await Promise.all([
    getMuds({
      query: params.q,
      genre: params.genre as Genre | undefined,
      isOnline:
        params.status === "online"
          ? true
          : params.status === "offline"
            ? false
            : undefined,
      sortBy: (params.sort as "trending" | "rating" | "reviews" | "newest" | "name") || "trending",
      page,
      pageSize,
    }),
    getGenresWithCounts(),
  ]);

  const totalPages = Math.ceil(mudsResult.total / pageSize);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse MUDs</h1>
        <p className="text-muted-foreground">
          Discover Multi-User Dungeon games from around the world
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-20 w-full" />}>
        <MudFilters genres={genres} />
      </Suspense>

      <div className="mt-6 mb-4 text-sm text-muted-foreground">
        {mudsResult.total} {mudsResult.total === 1 ? "MUD" : "MUDs"} found
      </div>

      <MudList muds={mudsResult.muds} emptyMessage="No MUDs match your search criteria." />

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
