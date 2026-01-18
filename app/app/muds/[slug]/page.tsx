import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getMudBySlug, getMudStatus } from "@/data/mud.data";
import { getReviewsByMud, getRatingDistribution } from "@/data/review.data";
import { isFavorited } from "@/data/favorite.data";
import { auth } from "@/lib/auth";
import { StatusIndicatorWithIcon } from "@/components/mud/status-indicator";
import { ReviewList } from "@/components/review/review-list";
import { ReviewForm } from "@/components/review/review-form";
import { FavoriteButton } from "@/components/mud/favorite-button";
import { RatingDisplay } from "@/components/review/rating-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe,
  MessageSquare,
  Terminal,
  Users,
  ExternalLink,
  Calendar,
  Code,
} from "lucide-react";
import { recordMudView } from "@/actions/mud.actions";

interface MudPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: MudPageProps): Promise<Metadata> {
  const { slug } = await params;
  const mud = await getMudBySlug(slug);
  if (!mud) {
    return { title: "MUD Not Found - MudListings" };
  }
  return {
    title: `${mud.name} - MudListings`,
    description: mud.shortDescription || mud.description?.slice(0, 160),
  };
}

export default async function MudPage({ params }: MudPageProps) {
  const { slug } = await params;
  const [session, mud] = await Promise.all([auth(), getMudBySlug(slug)]);

  if (!mud) {
    notFound();
  }

  // Record view (fire and forget)
  recordMudView(mud.id);

  const [reviews, ratingDistribution, favorited] = await Promise.all([
    getReviewsByMud(mud.id, "recent", 1),
    getRatingDistribution(mud.id),
    session?.user ? isFavorited(session.user.id, mud.id) : false,
  ]);

  const msspData = mud.currentMsspData as {
    players?: number;
    uptime?: number;
    [key: string]: unknown;
  } | null;

  return (
    <div className="container py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{mud.name}</h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <StatusIndicatorWithIcon isOnline={mud.isOnline} />
                  {mud.ratingCount > 0 && (
                    <RatingDisplay
                      rating={mud.ratingAverage}
                      count={mud.ratingCount}
                    />
                  )}
                </div>
              </div>
              <FavoriteButton
                mudId={mud.id}
                isFavorited={favorited}
                isLoggedIn={!!session?.user}
              />
            </div>

            {mud.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {mud.genres.map((g) => (
                  <Badge key={g.genre} variant="secondary">
                    {g.genre.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            )}

            {mud.shortDescription && (
              <p className="text-lg text-muted-foreground">
                {mud.shortDescription}
              </p>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="about" className="w-full">
            <TabsList>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews ({mud.ratingCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-6 space-y-6">
              {mud.description && (
                <div className="prose prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{mud.description}</p>
                </div>
              )}

              {msspData && Object.keys(msspData).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Server Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {msspData.players !== undefined && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {msspData.players} players online
                          </span>
                        </div>
                      )}
                      {msspData.uptime !== undefined && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Uptime: {formatUptime(msspData.uptime)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-6 space-y-6">
              {session?.user && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Write a Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ReviewForm mudId={mud.id} mudSlug={mud.slug} />
                    </CardContent>
                  </Card>
                  <Separator />
                </>
              )}

              {ratingDistribution && mud.ratingCount > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rating Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RatingBreakdown distribution={ratingDistribution} />
                  </CardContent>
                </Card>
              )}

              <ReviewList
                reviews={reviews.reviews}
                mudSlug={mud.slug}
                currentUserId={session?.user?.id}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Connection Info */}
          {mud.connectionHost && mud.connectionPort && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Connect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="font-mono text-sm bg-muted p-3 rounded">
                  {mud.connectionHost}:{mud.connectionPort}
                </div>
                {mud.webClientUrl && (
                  <Button asChild variant="outline" className="w-full">
                    <a
                      href={mud.webClientUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Web Client
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Links */}
          {(mud.website || mud.discordUrl || mud.wikiUrl) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {mud.website && (
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <a
                      href={mud.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </a>
                  </Button>
                )}
                {mud.discordUrl && (
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <a
                      href={mud.discordUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Discord
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </a>
                  </Button>
                )}
                {mud.wikiUrl && (
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <a
                      href={mud.wikiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Wiki
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {mud.codebase && (
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Codebase:</span>
                  <span>{mud.codebase}</span>
                </div>
              )}
              {mud.language && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Language:</span>
                  <span>{mud.language}</span>
                </div>
              )}
              {mud.establishedDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Established:</span>
                  <span>{new Date(mud.establishedDate).getFullYear()}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Favorites:</span>
                <span>{mud.favoriteCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  return `${hours}h`;
}

function RatingBreakdown({
  distribution,
}: {
  distribution: { rating: number; count: number }[];
}) {
  const total = distribution.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((rating) => {
        const item = distribution.find((d) => d.rating === rating);
        const count = item?.count || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;

        return (
          <div key={rating} className="flex items-center gap-3">
            <span className="w-8 text-sm text-muted-foreground">
              {rating}★
            </span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-8 text-sm text-muted-foreground text-right">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
