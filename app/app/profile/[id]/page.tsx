import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getPublicProfile, getUserStats } from "@/data/user.data";
import { getReviewsByUser } from "@/data/review.data";
import { getUserFavorites } from "@/data/favorite.data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MudCard } from "@/components/mud/mud-card";
import { Star, Heart, Calendar, MessageSquare, ThumbsUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PublicProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const user = await getPublicProfile(id);

  if (!user) {
    return { title: "User Not Found - MudListings" };
  }

  return {
    title: `${user.displayName} - MudListings`,
    description: user.bio || `${user.displayName}'s profile on MudListings`,
  };
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { id } = await params;
  const [session, user, stats] = await Promise.all([
    auth(),
    getPublicProfile(id),
    getUserStats(id),
  ]);

  if (!user) {
    notFound();
  }

  // Check if profile is public or if viewing own profile
  const isOwnProfile = session?.user?.id === user.id;
  if (!user.isProfilePublic && !isOwnProfile) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Private Profile</h1>
        <p className="text-muted-foreground">
          This user has set their profile to private.
        </p>
      </div>
    );
  }

  const [reviews, favorites] = await Promise.all([
    getReviewsByUser(user.id, 1),
    user.showFavoritesPublicly || isOwnProfile
      ? getUserFavorites(user.id, 1)
      : { favorites: [], total: 0 },
  ]);

  return (
    <div className="container py-8 max-w-4xl">
      {/* Profile Header */}
      <div className="flex items-start gap-6 mb-8">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.avatarUrl || undefined} />
          <AvatarFallback className="text-2xl">
            {user.displayName?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
            {user.role !== "PLAYER" && (
              <Badge variant="secondary">{user.role.replace("_", " ")}</Badge>
            )}
          </div>
          {user.bio && (
            <p className="text-muted-foreground mb-3">{user.bio}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Joined {formatDistanceToNow(user.createdAt, { addSuffix: true })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-2xl font-bold">{stats?.reviewCount || 0}</div>
              <div className="text-sm text-muted-foreground">Reviews</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Heart className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-2xl font-bold">{stats?.favoriteCount || 0}</div>
              <div className="text-sm text-muted-foreground">Favorites</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <ThumbsUp className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-2xl font-bold">{stats?.helpfulVotesReceived || 0}</div>
              <div className="text-sm text-muted-foreground">Helpful Votes</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="reviews" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reviews">
            Reviews ({reviews.total})
          </TabsTrigger>
          {(user.showFavoritesPublicly || isOwnProfile) && (
            <TabsTrigger value="favorites">
              Favorites ({favorites.total})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="reviews" className="space-y-4">
          {reviews.reviews.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No reviews yet
            </p>
          ) : (
            reviews.reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/muds/${review.mud.slug}`}
                      className="font-semibold hover:underline"
                    >
                      {review.mud.name}
                    </Link>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(review.createdAt, { addSuffix: true })}
                  </div>
                </CardHeader>
                <CardContent>
                  {review.title && (
                    <h4 className="font-medium mb-2">{review.title}</h4>
                  )}
                  <p className="text-sm line-clamp-3">{review.body}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {(user.showFavoritesPublicly || isOwnProfile) && (
          <TabsContent value="favorites">
            {favorites.favorites.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No favorites yet
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {favorites.favorites.map((fav) => (
                  <MudCard key={fav.mud.id} mud={fav.mud} />
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
