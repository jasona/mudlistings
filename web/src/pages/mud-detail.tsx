import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Globe,
  ExternalLink,
  Heart,
  Share2,
  Clock,
  Calendar,
  Code,
  Languages,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTransition } from '@/components/features/animated-card';
import { StatusIndicator } from '@/components/features/status-indicator';
import { GenreTagList } from '@/components/features/genre-tag';
import { StarRating } from '@/components/features/star-rating';
import { ReviewCard } from '@/components/features/review-card';
import { ReviewForm } from '@/components/features/review-form';
import { Pagination } from '@/components/features/pagination';
import { NoReviews } from '@/components/features/empty-state';
import { useMud, useMudStatusHistory } from '@/hooks/use-muds';
import {
  useReviewsByMud,
  useCreateReview,
  useMarkReviewHelpful,
  useReportReview,
  useDeleteReview,
} from '@/hooks/use-reviews';
import { useToggleFavorite } from '@/hooks/use-favorites';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function MudDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, user } = useAuthStore();
  const [reviewPage, setReviewPage] = useState(1);
  const [copied, setCopied] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Fetch MUD data
  const { data: mud, isLoading: isMudLoading, isError } = useMud(slug || '');
  const { data: statusHistory } = useMudStatusHistory(mud?.id || '', 7);
  const { data: reviewsData, isLoading: isReviewsLoading } = useReviewsByMud(
    mud?.id || '',
    reviewPage
  );

  // Mutations
  const toggleFavorite = useToggleFavorite();
  const createReview = useCreateReview();
  const markHelpful = useMarkReviewHelpful();
  const reportReview = useReportReview();
  const deleteReview = useDeleteReview();

  const handleFavoriteToggle = () => {
    if (mud && isAuthenticated) {
      toggleFavorite.mutate(mud.id);
    }
  };

  const handleCopyConnection = () => {
    if (mud) {
      navigator.clipboard.writeText(`${mud.host}:${mud.port}`);
      setCopied(true);
      toast.success('Connection info copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: mud?.name,
          text: mud?.description?.slice(0, 100),
          url,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  const handleSubmitReview = (data: { title?: string; body: string; rating: number }) => {
    if (mud) {
      createReview.mutate(
        { mudId: mud.id, data },
        {
          onSuccess: () => {
            toast.success('Review submitted successfully');
          },
          onError: () => {
            toast.error('Failed to submit review');
          },
        }
      );
    }
  };

  const handleMarkHelpful = (reviewId: string) => {
    markHelpful.mutate(reviewId);
  };

  const handleReportReview = (reviewId: string, reason: string, details?: string) => {
    reportReview.mutate(
      { reviewId, reason, details },
      {
        onSuccess: () => {
          toast.success('Report submitted');
        },
      }
    );
  };

  const handleDeleteReview = (reviewId: string) => {
    deleteReview.mutate(reviewId, {
      onSuccess: () => {
        toast.success('Review deleted');
      },
    });
  };

  // Calculate uptime from status history
  const uptimePercentage = statusHistory
    ? (statusHistory.filter((s) => s.isOnline).length / statusHistory.length) * 100
    : null;

  // Check if user has already reviewed
  const hasReviewed = reviewsData?.items.some((r) => r.userId === user?.id);

  if (isMudLoading) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <Skeleton className="h-64 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (isError || !mud) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">MUD Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The MUD you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild className="mt-6">
            <Link to="/browse">Browse MUDs</Link>
          </Button>
        </div>
      </PageTransition>
    );
  }

  const descriptionLines = mud.description?.split('\n') || [];
  const isLongDescription = descriptionLines.length > 5 || (mud.description?.length || 0) > 500;
  const displayDescription =
    showFullDescription || !isLongDescription
      ? mud.description
      : descriptionLines.slice(0, 5).join('\n').slice(0, 500) + '...';

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <StatusIndicator isOnline={mud.isOnline} showLabel playerCount={mud.currentPlayers} />
                {mud.isFeatured && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Featured
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{mud.name}</h1>
              <div className="flex items-center gap-4 mt-3">
                <StarRating
                  rating={mud.averageRating}
                  size="lg"
                  showValue
                  showCount
                  count={mud.reviewCount}
                />
              </div>
              <div className="mt-4">
                <GenreTagList genres={mud.genres} size="md" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button variant="terminal" size="lg" asChild>
                <a
                  href={`telnet://${mud.host}:${mud.port}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect
                </a>
              </Button>
              {mud.webClientUrl && (
                <Button variant="outline" size="lg" asChild>
                  <a href={mud.webClientUrl} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Web Client
                  </a>
                </Button>
              )}
              {isAuthenticated && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleFavoriteToggle}
                  className={cn(mud.isFavorited && 'text-red-500 border-red-500/50')}
                >
                  <Heart className={cn('h-5 w-5', mud.isFavorited && 'fill-current')} />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {displayDescription}
                  </p>
                </div>
                {isLongDescription && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-3"
                  >
                    {showFullDescription ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Read more
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <div>
              <Tabs defaultValue="reviews" className="w-full">
                <TabsList>
                  <TabsTrigger value="reviews">
                    Reviews ({mud.reviewCount})
                  </TabsTrigger>
                  {isAuthenticated && !hasReviewed && (
                    <TabsTrigger value="write">Write a Review</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="reviews" className="mt-6 space-y-4">
                  {isReviewsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                      ))}
                    </div>
                  ) : reviewsData && reviewsData.items.length > 0 ? (
                    <>
                      {reviewsData.items.map((review) => (
                        <ReviewCard
                          key={review.id}
                          review={review}
                          onMarkHelpful={isAuthenticated ? handleMarkHelpful : undefined}
                          onReport={isAuthenticated ? handleReportReview : undefined}
                          onDelete={review.isOwn ? handleDeleteReview : undefined}
                        />
                      ))}
                      {reviewsData.totalPages > 1 && (
                        <Pagination
                          currentPage={reviewPage}
                          totalPages={reviewsData.totalPages}
                          onPageChange={setReviewPage}
                          className="mt-6"
                        />
                      )}
                    </>
                  ) : (
                    <NoReviews
                      onWrite={
                        isAuthenticated
                          ? () => (document.querySelector('[data-value="write"]') as HTMLElement)?.click()
                          : undefined
                      }
                    />
                  )}
                </TabsContent>

                {isAuthenticated && !hasReviewed && (
                  <TabsContent value="write" className="mt-6">
                    <ReviewForm
                      onSubmit={handleSubmitReview}
                      isSubmitting={createReview.isPending}
                    />
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Connection Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Connection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <code className="text-sm font-mono text-foreground">
                    {mud.host}:{mud.port}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleCopyConnection}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {mud.websiteUrl && (
                  <a
                    href={mud.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    Official Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                {uptimePercentage !== null && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">7-day uptime</span>
                      <span className="font-medium text-foreground">
                        {uptimePercentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          uptimePercentage >= 90
                            ? 'bg-green-500'
                            : uptimePercentage >= 70
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        )}
                        style={{ width: `${uptimePercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mud.codebase && (
                  <div className="flex items-center gap-3">
                    <Code className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Codebase</p>
                      <p className="text-sm text-foreground">{mud.codebase}</p>
                    </div>
                  </div>
                )}
                {mud.language && (
                  <div className="flex items-center gap-3">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Language</p>
                      <p className="text-sm text-foreground">{mud.language}</p>
                    </div>
                  </div>
                )}
                {mud.establishedDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Established</p>
                      <p className="text-sm text-foreground">
                        {new Date(mud.establishedDate).getFullYear()}
                      </p>
                    </div>
                  </div>
                )}
                {mud.lastCheckedAt && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Last checked</p>
                      <p className="text-sm text-foreground">
                        {new Date(mud.lastCheckedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-secondary/50">
                    <p className="text-2xl font-bold text-foreground">{mud.reviewCount}</p>
                    <p className="text-xs text-muted-foreground">Reviews</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary/50">
                    <p className="text-2xl font-bold text-foreground">{mud.favoriteCount}</p>
                    <p className="text-xs text-muted-foreground">Favorites</p>
                  </div>
                  {mud.currentPlayers !== undefined && (
                    <div className="text-center p-3 rounded-lg bg-secondary/50 col-span-2">
                      <p className="text-2xl font-bold text-foreground">{mud.currentPlayers}</p>
                      <p className="text-xs text-muted-foreground">Players Online</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
