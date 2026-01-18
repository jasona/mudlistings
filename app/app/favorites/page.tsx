import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserFavorites } from "@/data/favorite.data";
import { MudList } from "@/components/mud/mud-list";
import { Heart } from "lucide-react";

export const metadata = {
  title: "Favorites - MudListings",
  description: "Your favorite MUD games",
};

export default async function FavoritesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const favorites = await getUserFavorites(session.user.id, 1);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-6 w-6 text-red-500" />
          <h1 className="text-3xl font-bold">Your Favorites</h1>
        </div>
        <p className="text-muted-foreground">
          MUD games you&apos;ve saved to your favorites
        </p>
      </div>

      <MudList
        muds={favorites.favorites.map((f) => f.mud)}
        emptyMessage="You haven't added any favorites yet. Browse MUDs and click the heart icon to save them here."
      />
    </div>
  );
}
