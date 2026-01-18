import { getTrendingMuds } from "@/data/mud.data";
import { MudList } from "@/components/mud/mud-list";
import { TrendingUp } from "lucide-react";

export const metadata = {
  title: "Trending MUDs - MudListings",
  description: "Discover the most popular MUD games right now",
};

export default async function TrendingPage() {
  const muds = await getTrendingMuds(50);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Trending MUDs</h1>
        </div>
        <p className="text-muted-foreground">
          The most popular Multi-User Dungeon games based on recent activity,
          reviews, and player count
        </p>
      </div>

      <MudList muds={muds} emptyMessage="No trending MUDs at the moment." />
    </div>
  );
}
