import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getMudsByGenre } from "@/data/mud.data";
import { MudList } from "@/components/mud/mud-list";
import { Badge } from "@/components/ui/badge";
import { Genre } from "@prisma/client";

interface GenrePageProps {
  params: Promise<{ genre: string }>;
}

const genreNames: Record<string, string> = {
  fantasy: "Fantasy",
  sci_fi: "Sci-Fi",
  horror: "Horror",
  roleplay: "Roleplay",
  pvp: "PvP",
  social: "Social",
  educational: "Educational",
  historical: "Historical",
  superhero: "Superhero",
  custom: "Custom",
};

export async function generateMetadata({
  params,
}: GenrePageProps): Promise<Metadata> {
  const { genre } = await params;
  const genreName = genreNames[genre.toLowerCase()] || genre;

  return {
    title: `${genreName} MUDs - MudListings`,
    description: `Browse ${genreName} Multi-User Dungeon games`,
  };
}

export default async function GenrePage({ params }: GenrePageProps) {
  const { genre: genreParam } = await params;
  const genreKey = genreParam.toUpperCase() as Genre;

  // Validate genre
  if (!Object.values(Genre).includes(genreKey)) {
    notFound();
  }

  const muds = await getMudsByGenre(genreKey, 100);
  const genreName = genreNames[genreParam.toLowerCase()] || genreParam;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{genreName} MUDs</h1>
          <Badge variant="secondary">{muds.length}</Badge>
        </div>
        <p className="text-muted-foreground">
          Multi-User Dungeon games in the {genreName} genre
        </p>
      </div>

      <MudList
        muds={muds}
        emptyMessage={`No ${genreName} MUDs found.`}
      />
    </div>
  );
}
