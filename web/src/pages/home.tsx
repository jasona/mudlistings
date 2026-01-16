import { Link } from 'react-router-dom';
import { Search, ArrowRight, Gamepad2, Users, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchBar } from '@/components/features/search-bar';
import { TypewriterLoop } from '@/components/features/typing-animation';
import { PageTransition } from '@/components/features/animated-card';
import { MudCard, FeaturedMudCard } from '@/components/features/mud-card';
import { GenreGrid } from '@/components/features/genre-card';
import { ActivityFeed } from '@/components/features/activity-feed';
import { useFeaturedMuds, useTrendingMuds, useGenres } from '@/hooks/use-muds';
import { useGlobalActivity } from '@/hooks/use-favorites';
import { useToggleFavorite } from '@/hooks/use-favorites';
import { useAuthStore } from '@/stores/auth-store';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const { data: featuredMuds, isLoading: isFeaturedLoading } = useFeaturedMuds();
  const { data: trendingMuds, isLoading: isTrendingLoading } = useTrendingMuds(6);
  const { data: genres, isLoading: isGenresLoading } = useGenres();
  const { data: activityData, isLoading: isActivityLoading } = useGlobalActivity(1, 10);
  const toggleFavorite = useToggleFavorite();

  const heroTexts = [
    'your next adventure',
    'epic quests',
    'new realms',
    'lasting friendships',
  ];

  const handleFavoriteToggle = (mudId: string) => {
    if (isAuthenticated) {
      toggleFavorite.mutate(mudId);
    }
  };

  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-glow-purple">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              <span className="block">Discover</span>
              <span className="block text-gradient-hero">
                <TypewriterLoop texts={heroTexts} />
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Explore the largest directory of MUDs. Find your perfect text-based adventure,
              connect with communities, and dive into worlds crafted by imagination.
            </p>

            {/* Search Bar */}
            <div className="mx-auto mt-10 max-w-xl">
              <SearchBar placeholder="Search for MUDs by name, genre, or keyword..." />
            </div>

            {/* Quick Actions */}
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link to="/browse">
                  <Search className="mr-2 h-4 w-4" />
                  Browse All MUDs
                </Link>
              </Button>
              <Button size="lg" variant="terminal" asChild>
                <Link to="/what-is-mud">
                  What is a MUD?
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <Gamepad2 className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 text-3xl font-bold text-foreground">500+</p>
              <p className="text-sm text-muted-foreground">Active MUDs</p>
            </div>
            <div className="text-center">
              <Users className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 text-3xl font-bold text-foreground">10,000+</p>
              <p className="text-sm text-muted-foreground">Players Online</p>
            </div>
            <div className="text-center">
              <Star className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 text-3xl font-bold text-foreground">5,000+</p>
              <p className="text-sm text-muted-foreground">Reviews</p>
            </div>
            <div className="text-center">
              <TrendingUp className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-2 text-3xl font-bold text-foreground">30+</p>
              <p className="text-sm text-muted-foreground">Years of MUDs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured MUD Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Featured MUD</h2>
            <Button variant="ghost" asChild>
              <Link to="/browse?featured=true">View all</Link>
            </Button>
          </div>
          {isFeaturedLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : featuredMuds && featuredMuds.length > 0 ? (
            <FeaturedMudCard
              mud={featuredMuds[0]}
              onFavoriteToggle={isAuthenticated ? handleFavoriteToggle : undefined}
            />
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              No featured MUDs at this time
            </Card>
          )}
        </div>
      </section>

      {/* Genre Cards Section */}
      <section className="py-16 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Browse by Genre</h2>
            <Button variant="ghost" asChild>
              <Link to="/browse">See all genres</Link>
            </Button>
          </div>
          {isGenresLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : genres ? (
            <GenreGrid genres={genres.slice(0, 10)} />
          ) : null}
        </div>
      </section>

      {/* Trending MUDs Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Trending Now</h2>
            <Button variant="ghost" asChild>
              <Link to="/browse?sort=trending">View all</Link>
            </Button>
          </div>
          {isTrendingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : trendingMuds && trendingMuds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingMuds.map((mud) => (
                <MudCard
                  key={mud.id}
                  mud={mud}
                  onFavoriteToggle={isAuthenticated ? handleFavoriteToggle : undefined}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              No trending MUDs at this time
            </Card>
          )}
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="py-16 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityFeed
                    events={activityData?.items || []}
                    isLoading={isActivityLoading}
                  />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/browse?sort=newest">
                      <Gamepad2 className="mr-2 h-4 w-4" />
                      Newest MUDs
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/browse?online=true">
                      <Users className="mr-2 h-4 w-4" />
                      Online Now
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/browse?sort=rating">
                      <Star className="mr-2 h-4 w-4" />
                      Top Rated
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/what-is-mud">
                      <ArrowRight className="mr-2 h-4 w-4" />
                      New to MUDs?
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
