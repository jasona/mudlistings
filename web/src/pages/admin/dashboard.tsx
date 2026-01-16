import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Plus,
  Settings,
  BarChart3,
  ExternalLink,
  Users,
  Star,
  MessageSquare,
  Eye,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageTransition } from '@/components/features/animated-card';
import { useAuthStore } from '@/stores/auth-store';
import { useCurrentUser } from '@/hooks/use-auth';
import { useManagedMuds } from '@/hooks/use-admin';
import { cn } from '@/lib/utils';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { isLoading: isUserLoading } = useCurrentUser();
  const { data: managedMuds, isLoading: isMudsLoading } = useManagedMuds();

  // Redirect if not authenticated
  if (!isUserLoading && !isAuthenticated) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  // Only MudAdmin and SiteAdmin can access
  const canAccessAdmin = user?.role === 'MudAdmin' || user?.role === 'SiteAdmin';

  if (!isUserLoading && !canAccessAdmin) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <LayoutDashboard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Admin Access Required</h1>
          <p className="mt-2 text-muted-foreground">
            You need to be a MUD administrator to access this area.
            Claim a MUD listing to manage it.
          </p>
          <div className="mt-6 flex gap-4 justify-center">
            <Button onClick={() => navigate('/browse')}>Browse MUDs</Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              Go Home
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const isLoading = isUserLoading || isMudsLoading;

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <LayoutDashboard className="h-8 w-8 text-primary" />
              MUD Admin Dashboard
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your MUD listings, view analytics, and respond to reviews
            </p>
          </div>

          <Button onClick={() => navigate('/browse')}>
            <Plus className="h-4 w-4 mr-2" />
            Claim a MUD
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!managedMuds || managedMuds.length === 0) && (
          <Card className="text-center py-12">
            <CardContent>
              <Globe className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                No MUDs under your management
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Claim ownership of your MUD to access analytics, respond to reviews,
                and keep your listing up to date.
              </p>
              <Button onClick={() => navigate('/browse')}>
                Browse MUDs to Claim
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Managed MUDs Grid */}
        {!isLoading && managedMuds && managedMuds.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managedMuds.map((mud) => (
              <Card key={mud.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        <Link
                          to={`/mud/${mud.slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {mud.name}
                        </Link>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={mud.isOnline ? 'default' : 'secondary'}
                          className={cn(
                            'text-xs',
                            mud.isOnline && 'bg-green-500/10 text-green-500 border-green-500/20'
                          )}
                        >
                          {mud.isOnline ? 'Online' : 'Offline'}
                        </Badge>
                        {mud.currentPlayers !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            {mud.currentPlayers} player{mud.currentPlayers !== 1 ? 's' : ''}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {mud.shortDescription}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">
                          {mud.averageRating > 0 ? mud.averageRating.toFixed(1) : '-'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{mud.reviewCount}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Reviews</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{mud.currentPlayers || 0}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Online</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto space-y-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/admin/mud/${mud.id}/edit`)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/admin/mud/${mud.id}/analytics`)}
                      >
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Analytics
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <Link to={`/mud/${mud.slug}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Public Page
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Site Admin Link */}
        {user?.role === 'SiteAdmin' && (
          <div className="mt-8 pt-8 border-t">
            <Card className="bg-muted/50">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">Site Administration</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage users, moderate content, and view site-wide statistics
                    </p>
                  </div>
                  <Button onClick={() => navigate('/admin/site')}>
                    Open Site Admin
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
