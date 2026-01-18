import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Users, TrendingUp } from "lucide-react";
import type { Mud, MudGenre } from "@prisma/client";

type MudWithGenres = Mud & {
  genres: MudGenre[];
};

interface MudCardProps {
  mud: MudWithGenres;
  showTrending?: boolean;
}

export function MudCard({ mud, showTrending = false }: MudCardProps) {
  const playerCount = mud.currentMsspData &&
    typeof mud.currentMsspData === "object" &&
    "players" in mud.currentMsspData
      ? (mud.currentMsspData as { players: number }).players
      : null;

  // Check if the MUD is trending (high trending score)
  const isTrending = showTrending || mud.trendingScore > 50;

  return (
    <Link href={`/muds/${mud.slug}`}>
      <Card className="group h-full bg-card border-white/10 hover:border-primary/30 transition-all duration-200 hover:-translate-y-0.5">
        <CardContent className="p-5">
          {/* Header with title and trending badge */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {mud.name}
            </h3>
            {isTrending && (
              <Badge className="shrink-0 bg-warning/20 text-warning border-warning/30 hover:bg-warning/30">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </Badge>
            )}
          </div>

          {/* Description */}
          {mud.shortDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {mud.shortDescription}
            </p>
          )}

          {/* Genre tags */}
          {mud.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {mud.genres.slice(0, 2).map((g) => (
                <Badge
                  key={g.genre}
                  variant="secondary"
                  className="text-xs bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"
                >
                  {g.genre.replace("_", " ")}
                </Badge>
              ))}
              {mud.genres.length > 2 && (
                <Badge
                  variant="outline"
                  className="text-xs border-white/10 text-muted-foreground"
                >
                  +{mud.genres.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            {/* Rating */}
            <div className="flex items-center gap-2">
              {mud.ratingCount > 0 ? (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-sm">{mud.ratingAverage.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({mud.ratingCount})</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">No reviews</span>
              )}
            </div>

            {/* Player count and online status */}
            <div className="flex items-center gap-2">
              {playerCount !== null && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>{playerCount}</span>
                </div>
              )}
              {/* Online indicator */}
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    mud.isOnline
                      ? "bg-success animate-pulse-glow"
                      : "bg-muted-foreground"
                  }`}
                />
                <span className="text-xs text-muted-foreground">
                  {mud.isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
