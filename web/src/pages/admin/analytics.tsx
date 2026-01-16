import { useState } from 'react';
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  Eye,
  MousePointerClick,
  Heart,
  MessageSquare,
  Star,
  TrendingUp,
  TrendingDown,
  Calendar,
  ExternalLink,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageTransition } from '@/components/features/animated-card';
import { useAuthStore } from '@/stores/auth-store';
import { useCurrentUser } from '@/hooks/use-auth';
import { useMud } from '@/hooks/use-muds';
import { useMudAnalytics } from '@/hooks/use-admin';
import { cn } from '@/lib/utils';

export default function MudAnalyticsPage() {
  const { mudId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { isLoading: isUserLoading } = useCurrentUser();
  const { data: mud, isLoading: isMudLoading } = useMud(mudId || '');
  const [timeRange, setTimeRange] = useState(30);
  const { data: analytics, isLoading: isAnalyticsLoading } = useMudAnalytics(mudId || '', timeRange);

  // Redirect if not authenticated
  if (!isUserLoading && !isAuthenticated) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  const isLoading = isUserLoading || isMudLoading || isAnalyticsLoading;

  // Stat card component
  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendLabel,
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: number;
    trendLabel?: string;
  }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            {trend !== undefined && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs mt-2',
                  trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-muted-foreground'
                )}
              >
                {trend > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : trend < 0 ? (
                  <TrendingDown className="h-3 w-3" />
                ) : null}
                <span>
                  {trend > 0 ? '+' : ''}
                  {trend}% {trendLabel || 'vs last period'}
                </span>
              </div>
            )}
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </PageTransition>
    );
  }

  if (!mud) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground">MUD Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            This MUD either doesn't exist or you don't have permission to view its analytics.
          </p>
          <Button className="mt-6" onClick={() => navigate('/admin')}>
            Back to Dashboard
          </Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-primary" />
                Analytics
              </h1>
              <p className="mt-1 text-muted-foreground">
                Performance metrics for <span className="font-medium">{mud.name}</span>
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Select
                value={String(timeRange)}
                onValueChange={(value) => setTimeRange(Number(value))}
              >
                <SelectTrigger className="w-40">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" asChild>
                <Link to={`/mud/${mud.slug}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Page
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Views"
            value={analytics?.totalViews.toLocaleString() || '0'}
            icon={Eye}
          />
          <StatCard
            title="Unique Visitors"
            value={analytics?.uniqueVisitors.toLocaleString() || '0'}
            icon={Users}
          />
          <StatCard
            title="Click-throughs"
            value={analytics?.clickThroughs.toLocaleString() || '0'}
            icon={MousePointerClick}
          />
          <StatCard
            title="Favorites"
            value={analytics?.favoriteCount.toLocaleString() || '0'}
            icon={Heart}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">
                  {analytics?.averageRating ? analytics.averageRating.toFixed(1) : '-'}
                </span>
                <span className="text-muted-foreground">/ 5.0</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Based on {analytics?.reviewCount || 0} reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Total Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">
                  {analytics?.reviewCount || 0}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                All-time reviews for this MUD
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MousePointerClick className="h-4 w-4 text-green-500" />
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">
                  {analytics?.totalViews
                    ? ((analytics.clickThroughs / analytics.totalViews) * 100).toFixed(1)
                    : '0'}
                  %
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Views that resulted in connection attempts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Insights Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance Insights</CardTitle>
            <CardDescription>
              Suggestions to improve your MUD's visibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!mud.description || mud.description.length < 200 ? (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="p-1 bg-amber-500/20 rounded">
                    <TrendingUp className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Add more description</p>
                    <p className="text-sm text-muted-foreground">
                      MUDs with detailed descriptions (200+ characters) get 40% more views on average.
                    </p>
                  </div>
                </div>
              ) : null}

              {!mud.websiteUrl ? (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="p-1 bg-blue-500/20 rounded">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Add your website</p>
                    <p className="text-sm text-muted-foreground">
                      Linking to your website increases trust and click-through rates.
                    </p>
                  </div>
                </div>
              ) : null}

              {(analytics?.reviewCount || 0) < 5 ? (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="p-1 bg-purple-500/20 rounded">
                    <MessageSquare className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Encourage reviews</p>
                    <p className="text-sm text-muted-foreground">
                      MUDs with 5+ reviews rank higher in search results.
                      Ask your players to leave reviews!
                    </p>
                  </div>
                </div>
              ) : null}

              {mud.description &&
                mud.description.length >= 200 &&
                mud.websiteUrl &&
                (analytics?.reviewCount || 0) >= 5 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="p-1 bg-green-500/20 rounded">
                      <Star className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Great job!</p>
                      <p className="text-sm text-muted-foreground">
                        Your listing is well optimized. Keep engaging with your community!
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Time Period Info */}
        {analytics && (
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Data from{' '}
            {new Date(analytics.periodStart).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            to{' '}
            {new Date(analytics.periodEnd).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        )}
      </div>
    </PageTransition>
  );
}
