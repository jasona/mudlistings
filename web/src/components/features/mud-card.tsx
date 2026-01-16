import { Link } from 'react-router-dom';
import { Heart, Users, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusIndicator } from './status-indicator';
import { GenreTagList } from './genre-tag';
import { StarRating } from './star-rating';
import { cn } from '@/lib/utils';
import type { MudListItem } from '@/types';

interface MudCardProps {
  mud: MudListItem;
  onFavoriteToggle?: (mudId: string) => void;
  isFavoriting?: boolean;
  className?: string;
}

export function MudCard({ mud, onFavoriteToggle, isFavoriting, className }: MudCardProps) {
  return (
    <Card className={cn('group hover-glow transition-all duration-200 hover:-translate-y-1', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link to={`/muds/${mud.slug}`} className="hover:underline">
              <h3 className="font-semibold text-lg text-foreground truncate">{mud.name}</h3>
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <StatusIndicator isOnline={mud.isOnline} size="sm" />
              {mud.isOnline && mud.currentPlayers !== undefined && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {mud.currentPlayers}
                </span>
              )}
            </div>
          </div>
          {onFavoriteToggle && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onFavoriteToggle(mud.id)}
              disabled={isFavoriting}
              className={cn(
                'shrink-0',
                mud.isFavorited && 'text-red-500 hover:text-red-600'
              )}
            >
              <Heart className={cn('h-4 w-4', mud.isFavorited && 'fill-current')} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {mud.shortDescription}
        </p>
        <div className="flex items-center justify-between gap-2">
          <GenreTagList genres={mud.genres} maxVisible={2} size="sm" asLinks={false} />
          <StarRating rating={mud.averageRating} size="sm" showValue />
        </div>
      </CardContent>
    </Card>
  );
}

interface FeaturedMudCardProps {
  mud: MudListItem;
  onFavoriteToggle?: (mudId: string) => void;
  className?: string;
}

export function FeaturedMudCard({ mud, onFavoriteToggle, className }: FeaturedMudCardProps) {
  return (
    <Card className={cn(
      'relative overflow-hidden bg-gradient-to-br from-card to-card/50',
      'border-primary/20 hover:border-primary/40 transition-all duration-300',
      'hover:shadow-[0_0_40px_rgba(99,102,241,0.15)]',
      className
    )}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-primary uppercase tracking-wider">Featured</span>
            <Link to={`/muds/${mud.slug}`}>
              <h2 className="text-2xl font-bold text-foreground mt-1 hover:text-primary transition-colors">
                {mud.name}
              </h2>
            </Link>
          </div>
          <StatusIndicator isOnline={mud.isOnline} showLabel playerCount={mud.currentPlayers} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {mud.shortDescription}
        </p>
        <div className="flex items-center gap-3 mb-4">
          <StarRating rating={mud.averageRating} showValue showCount count={mud.reviewCount} />
        </div>
        <GenreTagList genres={mud.genres} maxVisible={4} size="md" />
        <div className="flex items-center gap-3 mt-6">
          <Button asChild className="flex-1">
            <Link to={`/muds/${mud.slug}`}>View Details</Link>
          </Button>
          <Button variant="terminal" size="icon" asChild>
            <a
              href={`telnet://${mud.host}:${mud.port}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          {onFavoriteToggle && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onFavoriteToggle(mud.id)}
              className={cn(mud.isFavorited && 'text-red-500 border-red-500/50')}
            >
              <Heart className={cn('h-4 w-4', mud.isFavorited && 'fill-current')} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface MudListItemProps {
  mud: MudListItem;
  onFavoriteToggle?: (mudId: string) => void;
  className?: string;
}

export function MudListItemRow({ mud, onFavoriteToggle, className }: MudListItemProps) {
  return (
    <div className={cn(
      'flex items-center gap-4 p-4 rounded-lg border border-border bg-card',
      'hover:bg-card/80 hover:border-primary/20 transition-all',
      className
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <Link to={`/muds/${mud.slug}`} className="hover:underline">
            <h3 className="font-medium text-foreground truncate">{mud.name}</h3>
          </Link>
          <StatusIndicator isOnline={mud.isOnline} size="sm" />
        </div>
        <p className="text-sm text-muted-foreground truncate mt-1">
          {mud.shortDescription}
        </p>
      </div>
      <div className="hidden sm:flex items-center gap-4">
        <GenreTagList genres={mud.genres} maxVisible={2} size="sm" asLinks={false} />
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {mud.isOnline && mud.currentPlayers !== undefined && (
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Users className="h-4 w-4" />
            {mud.currentPlayers}
          </span>
        )}
        <StarRating rating={mud.averageRating} size="sm" />
        {onFavoriteToggle && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onFavoriteToggle(mud.id)}
            className={cn(mud.isFavorited && 'text-red-500')}
          >
            <Heart className={cn('h-4 w-4', mud.isFavorited && 'fill-current')} />
          </Button>
        )}
      </div>
    </div>
  );
}
