import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Heart, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageTransition } from '@/components/features/animated-card';
import { MudCard, MudListItemRow } from '@/components/features/mud-card';
import { Pagination } from '@/components/features/pagination';
import { NoFavorites } from '@/components/features/empty-state';
import { ActivityFeed } from '@/components/features/activity-feed';
import { useAuthStore } from '@/stores/auth-store';
import { useCurrentUser } from '@/hooks/use-auth';
import { useMyFavorites, useToggleFavorite, usePersonalizedActivity } from '@/hooks/use-favorites';
import { cn } from '@/lib/utils';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { isLoading: isUserLoading } = useCurrentUser();
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch favorites
  const { data: favoritesData, isLoading: isFavoritesLoading } = useMyFavorites(page);
  const { data: activityData, isLoading: isActivityLoading } = usePersonalizedActivity(1, 5);
  const toggleFavorite = useToggleFavorite();

  const handleFavoriteToggle = (mudId: string) => {
    toggleFavorite.mutate(mudId);
  };

  const handleBrowse = () => {
    navigate('/browse');
  };

  // Redirect if not authenticated
  if (!isUserLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isUserLoading) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500 fill-red-500" />
              My Favorites
            </h1>
            <p className="mt-2 text-muted-foreground">
              MUDs you've saved for quick access
            </p>
          </div>

          {/* View Mode Toggle */}
          {favoritesData && favoritesData.items.length > 0 && (
            <div className="flex items-center gap-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Favorites Grid */}
          <div className="lg:col-span-2">
            {isFavoritesLoading ? (
              <div className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
                  : 'space-y-3'
              )}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className={viewMode === 'grid' ? 'h-48' : 'h-24'}
                  />
                ))}
              </div>
            ) : favoritesData && favoritesData.items.length > 0 ? (
              <>
                <div className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
                    : 'space-y-3'
                )}>
                  {favoritesData.items.map((favorite) =>
                    viewMode === 'grid' ? (
                      <MudCard
                        key={favorite.id}
                        mud={{ ...favorite.mud, isFavorited: true }}
                        onFavoriteToggle={handleFavoriteToggle}
                      />
                    ) : (
                      <MudListItemRow
                        key={favorite.id}
                        mud={{ ...favorite.mud, isFavorited: true }}
                        onFavoriteToggle={handleFavoriteToggle}
                      />
                    )
                  )}
                </div>

                {/* Pagination */}
                {favoritesData.totalPages > 1 && (
                  <Pagination
                    currentPage={page}
                    totalPages={favoritesData.totalPages}
                    onPageChange={setPage}
                    className="mt-8"
                  />
                )}
              </>
            ) : (
              <NoFavorites onBrowse={handleBrowse} />
            )}
          </div>

          {/* Sidebar - Personalized Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Activity from Your Favorites</CardTitle>
                <CardDescription>
                  Recent updates from MUDs you follow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityFeed
                  events={activityData?.items || []}
                  isLoading={isActivityLoading}
                />
                {activityData?.items.length === 0 && !isActivityLoading && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Add some favorites to see activity here
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
