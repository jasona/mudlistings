import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  Grid3X3,
  List,
  SlidersHorizontal,
  X,
  Wifi,
  Star,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SearchBar } from '@/components/features/search-bar';
import { PageTransition } from '@/components/features/animated-card';
import { MudCard, MudListItemRow } from '@/components/features/mud-card';
import { Pagination, PaginationInfo } from '@/components/features/pagination';
import { NoSearchResults } from '@/components/features/empty-state';
import { useMudSearch, useGenres } from '@/hooks/use-muds';
import { useToggleFavorite } from '@/hooks/use-favorites';
import { useFilterStore, selectHasActiveFilters } from '@/stores/filter-store';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import type { MudSortBy } from '@/types';

const sortOptions: { value: MudSortBy; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'trending', label: 'Trending' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'players', label: 'Most Players' },
  { value: 'newest', label: 'Newest' },
  { value: 'alphabetical', label: 'A-Z' },
];

const ratingOptions = [
  { value: '0', label: 'Any rating' },
  { value: '3', label: '3+ stars' },
  { value: '4', label: '4+ stars' },
  { value: '4.5', label: '4.5+ stars' },
];

const playerOptions = [
  { value: '0', label: 'Any players' },
  { value: '1', label: '1+ online' },
  { value: '5', label: '5+ online' },
  { value: '10', label: '10+ online' },
  { value: '25', label: '25+ online' },
];

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const toggleFavorite = useToggleFavorite();

  // Filter store
  const {
    query,
    setQuery,
    selectedGenres,
    toggleGenre,
    clearGenres,
    onlineOnly,
    setOnlineOnly,
    minRating,
    setMinRating,
    minPlayers,
    setMinPlayers,
    sortBy,
    setSortBy,
    page,
    setPage,
    pageSize,
    resetFilters,
    getSearchParams,
  } = useFilterStore();

  const hasActiveFilters = useFilterStore(selectHasActiveFilters);

  // View mode state (grid/list)
  const viewMode = (searchParams.get('view') as 'grid' | 'list') || 'grid';

  // Sync URL params to filter store on mount
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    const urlGenres = searchParams.get('genres');
    const urlOnline = searchParams.get('online');
    const urlRating = searchParams.get('rating');
    const urlPlayers = searchParams.get('players');
    const urlSort = searchParams.get('sort') as MudSortBy | null;
    const urlPage = searchParams.get('page');

    if (urlQuery) setQuery(urlQuery);
    if (urlGenres) useFilterStore.setState({ selectedGenres: urlGenres.split(',') });
    if (urlOnline === 'true') setOnlineOnly(true);
    if (urlRating) setMinRating(parseFloat(urlRating));
    if (urlPlayers) setMinPlayers(parseInt(urlPlayers, 10));
    if (urlSort) setSortBy(urlSort);
    if (urlPage) setPage(parseInt(urlPage, 10));
  }, []); // Only run on mount

  // Sync filter store to URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedGenres.length > 0) params.set('genres', selectedGenres.join(','));
    if (onlineOnly) params.set('online', 'true');
    if (minRating) params.set('rating', minRating.toString());
    if (minPlayers) params.set('players', minPlayers.toString());
    if (sortBy !== 'relevance') params.set('sort', sortBy);
    if (page > 1) params.set('page', page.toString());
    if (viewMode !== 'grid') params.set('view', viewMode);

    setSearchParams(params, { replace: true });
  }, [query, selectedGenres, onlineOnly, minRating, minPlayers, sortBy, page, viewMode, setSearchParams]);

  // Fetch data
  const searchParamsObj = useMemo(() => getSearchParams(), [getSearchParams, query, selectedGenres, onlineOnly, minRating, minPlayers, sortBy, page, pageSize]);
  const { data: searchResults, isLoading, isError } = useMudSearch(searchParamsObj);
  const { data: genres } = useGenres();

  const handleFavoriteToggle = (mudId: string) => {
    if (isAuthenticated) {
      toggleFavorite.mutate(mudId);
    }
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    const params = new URLSearchParams(searchParams);
    if (mode === 'grid') {
      params.delete('view');
    } else {
      params.set('view', mode);
    }
    setSearchParams(params, { replace: true });
  };

  const handleClearFilters = () => {
    resetFilters();
    setSearchParams({}, { replace: true });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedGenres.length > 0) count += selectedGenres.length;
    if (onlineOnly) count++;
    if (minRating) count++;
    if (minPlayers) count++;
    return count;
  }, [selectedGenres, onlineOnly, minRating, minPlayers]);

  // Filter sidebar content (shared between desktop sidebar and mobile sheet)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Online Status */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Status</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="online-only"
            checked={onlineOnly}
            onCheckedChange={(checked) => setOnlineOnly(checked === true)}
          />
          <Label htmlFor="online-only" className="text-sm cursor-pointer flex items-center gap-2">
            <Wifi className="h-4 w-4 text-green-500" />
            Online only
          </Label>
        </div>
      </div>

      {/* Min Rating */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Star className="h-4 w-4" />
          Minimum Rating
        </h3>
        <Select
          value={minRating?.toString() || '0'}
          onValueChange={(value) => setMinRating(value === '0' ? null : parseFloat(value))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ratingOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Min Players */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Players Online
        </h3>
        <Select
          value={minPlayers?.toString() || '0'}
          onValueChange={(value) => setMinPlayers(value === '0' ? null : parseInt(value, 10))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {playerOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Genres */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">Genres</h3>
          {selectedGenres.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearGenres}
              className="h-auto py-1 px-2 text-xs"
            >
              Clear
            </Button>
          )}
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {genres?.map((genre) => (
            <div key={genre.id} className="flex items-center space-x-2">
              <Checkbox
                id={`genre-${genre.slug}`}
                checked={selectedGenres.includes(genre.slug)}
                onCheckedChange={() => toggleGenre(genre.slug)}
              />
              <Label
                htmlFor={`genre-${genre.slug}`}
                className="text-sm cursor-pointer flex-1 flex items-center justify-between"
              >
                <span>{genre.name}</span>
                {genre.mudCount !== undefined && (
                  <span className="text-xs text-muted-foreground">{genre.mudCount}</span>
                )}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          className="w-full"
          onClick={handleClearFilters}
        >
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Browse MUDs</h1>
          <p className="mt-2 text-muted-foreground">
            Discover and explore text-based multiplayer worlds
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search MUDs by name, description, or keyword..."
            className="max-w-2xl"
            showAutocomplete={false}
          />
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {activeFilterCount}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FilterContent />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</Label>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as MudSortBy)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-1 ml-auto">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => handleViewModeChange('grid')}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => handleViewModeChange('list')}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Active Filters Tags */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {query && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {query}
                    <button onClick={() => setQuery('')} className="ml-1 hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {onlineOnly && (
                  <Badge variant="secondary" className="gap-1">
                    Online only
                    <button onClick={() => setOnlineOnly(false)} className="ml-1 hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {minRating && (
                  <Badge variant="secondary" className="gap-1">
                    {minRating}+ stars
                    <button onClick={() => setMinRating(null)} className="ml-1 hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {minPlayers && (
                  <Badge variant="secondary" className="gap-1">
                    {minPlayers}+ players
                    <button onClick={() => setMinPlayers(null)} className="ml-1 hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedGenres.map((genreSlug) => {
                  const genre = genres?.find((g) => g.slug === genreSlug);
                  return (
                    <Badge key={genreSlug} variant="secondary" className="gap-1">
                      {genre?.name || genreSlug}
                      <button onClick={() => toggleGenre(genreSlug)} className="ml-1 hover:text-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Results Info */}
            {!isLoading && searchResults && (
              <PaginationInfo
                currentPage={page}
                pageSize={pageSize}
                totalItems={searchResults.totalCount}
                className="mb-4"
              />
            )}

            {/* Loading State */}
            {isLoading && (
              <div className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-3'
              )}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className={viewMode === 'grid' ? 'h-48' : 'h-24'}
                  />
                ))}
              </div>
            )}

            {/* Error State */}
            {isError && (
              <Card className="p-8 text-center text-muted-foreground">
                An error occurred while loading MUDs. Please try again.
              </Card>
            )}

            {/* Empty State */}
            {!isLoading && !isError && searchResults?.items.length === 0 && (
              <NoSearchResults onReset={hasActiveFilters ? handleClearFilters : undefined} />
            )}

            {/* Results Grid/List */}
            {!isLoading && !isError && searchResults && searchResults.items.length > 0 && (
              <>
                <div className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-3'
                )}>
                  {searchResults.items.map((mud) =>
                    viewMode === 'grid' ? (
                      <MudCard
                        key={mud.id}
                        mud={mud}
                        onFavoriteToggle={isAuthenticated ? handleFavoriteToggle : undefined}
                      />
                    ) : (
                      <MudListItemRow
                        key={mud.id}
                        mud={mud}
                        onFavoriteToggle={isAuthenticated ? handleFavoriteToggle : undefined}
                      />
                    )
                  )}
                </div>

                {/* Pagination */}
                {searchResults.totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={page}
                      totalPages={searchResults.totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
