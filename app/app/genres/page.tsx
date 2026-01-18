import Link from "next/link";
import { getGenresWithCounts } from "@/data/genre.data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";

export const metadata = {
  title: "Genres - MudListings",
  description: "Browse MUD games by genre",
};

const genreDescriptions: Record<string, string> = {
  FANTASY: "Magical worlds with elves, dragons, and epic quests",
  SCI_FI: "Futuristic settings with space travel and technology",
  HORROR: "Dark and terrifying experiences",
  ROLEPLAY: "Focus on character development and storytelling",
  PVP: "Player vs player combat and competition",
  SOCIAL: "Community-focused with emphasis on interaction",
  EDUCATIONAL: "Learning through gameplay",
  HISTORICAL: "Based on real historical periods",
  SUPERHERO: "Powers, capes, and saving the world",
  CUSTOM: "Unique themes that defy categorization",
};

export default async function GenresPage() {
  const genres = await getGenresWithCounts();

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Genres</h1>
        </div>
        <p className="text-muted-foreground">
          Explore MUD games organized by genre
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {genres.map(({ genre, count }) => (
          <Link key={genre} href={`/genres/${genre.toLowerCase()}`}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {genre.replace("_", " ")}
                  </CardTitle>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {genreDescriptions[genre] || "Explore games in this genre"}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
