import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Search,
  Plus,
  ExternalLink,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageTransition } from '@/components/features/animated-card';
import { useFeaturedMuds, useMudSearch } from '@/hooks/use-muds';
import type { MudListItem } from '@/types';
import { useSetFeatured, useUpdateFeaturedOrder } from '@/hooks/use-site-admin';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function FeaturedManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: featuredMuds, isLoading: isFeaturedLoading } = useFeaturedMuds();
  const { data: searchResults, isLoading: isSearching } = useMudSearch({
    query: searchQuery,
    pageSize: 10,
  });
  const setFeatured = useSetFeatured();
  const updateOrder = useUpdateFeaturedOrder();

  const handleAddFeatured = (mudId: string, mudName: string) => {
    setFeatured.mutate(
      { mudId, isFeatured: true },
      {
        onSuccess: () => {
          toast.success(`${mudName} added to featured`);
          setIsAddDialogOpen(false);
          setSearchQuery('');
        },
        onError: (error) => {
          toast.error((error as Error).message || 'Failed to add to featured');
        },
      }
    );
  };

  const handleRemoveFeatured = (mudId: string, mudName: string) => {
    setFeatured.mutate(
      { mudId, isFeatured: false },
      {
        onSuccess: () => {
          toast.success(`${mudName} removed from featured`);
        },
        onError: (error) => {
          toast.error((error as Error).message || 'Failed to remove from featured');
        },
      }
    );
  };

  const handleMoveUp = (index: number) => {
    if (!featuredMuds || index === 0) return;
    const newOrder = [...featuredMuds];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    updateOrder.mutate(newOrder.map((m) => m.id), {
      onError: (error) => {
        toast.error((error as Error).message || 'Failed to update order');
      },
    });
  };

  const handleMoveDown = (index: number) => {
    if (!featuredMuds || index === featuredMuds.length - 1) return;
    const newOrder = [...featuredMuds];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    updateOrder.mutate(newOrder.map((m) => m.id), {
      onError: (error) => {
        toast.error((error as Error).message || 'Failed to update order');
      },
    });
  };

  const filteredSearchResults = searchResults?.items.filter(
    (mud: MudListItem) => !featuredMuds?.some((f) => f.id === mud.id)
  );

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
              Featured MUDs
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage which MUDs appear in the featured section
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Featured
          </Button>
        </div>

        {/* Featured List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Featured MUDs</CardTitle>
            <CardDescription>
              Use arrows to reorder. The top MUD will be highlighted on the homepage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isFeaturedLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : featuredMuds && featuredMuds.length > 0 ? (
              <div className="space-y-2">
                {featuredMuds.map((mud, index) => (
                  <div
                    key={mud.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-background"
                  >
                    <div className="flex flex-col">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={index === 0 || updateOrder.isPending}
                        onClick={() => handleMoveUp(index)}
                      >
                        <span className="sr-only">Move up</span>
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={index === featuredMuds.length - 1 || updateOrder.isPending}
                        onClick={() => handleMoveDown(index)}
                      >
                        <span className="sr-only">Move down</span>
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </Button>
                    </div>

                    <div className="flex items-center justify-center w-8 h-8 rounded bg-muted text-sm font-medium">
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/muds/${mud.slug}`}
                          className="font-medium text-foreground hover:text-primary truncate"
                        >
                          {mud.name}
                        </Link>
                        <Badge
                          variant={mud.isOnline ? 'default' : 'secondary'}
                          className={cn(
                            'text-xs',
                            mud.isOnline && 'bg-green-500/10 text-green-500'
                          )}
                        >
                          {mud.isOnline ? 'Online' : 'Offline'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {mud.shortDescription}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/muds/${mud.slug}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFeatured(mud.id, mud.name)}
                        disabled={setFeatured.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No featured MUDs yet. Add some to highlight them on the homepage.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Featured Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Featured MUD</DialogTitle>
              <DialogDescription>
                Search for a MUD to add to the featured section.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search MUDs by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="mt-4 max-h-[300px] overflow-y-auto">
                {isSearching ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : searchQuery && filteredSearchResults && filteredSearchResults.length > 0 ? (
                  <div className="space-y-2">
                    {filteredSearchResults.map((mud: MudListItem) => (
                      <div
                        key={mud.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleAddFeatured(mud.id, mud.name)}
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{mud.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {mud.shortDescription}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          disabled={setFeatured.isPending}
                        >
                          {setFeatured.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Add'
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No MUDs found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Start typing to search for MUDs
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
