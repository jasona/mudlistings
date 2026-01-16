import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface GenreTagProps {
  name: string;
  slug: string;
  count?: number;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  asLink?: boolean;
  onClick?: () => void;
  className?: string;
}

const genreColors: Record<string, string> = {
  fantasy: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30',
  scifi: 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30',
  horror: 'bg-red-500/20 text-red-400 hover:bg-red-500/30',
  roleplay: 'bg-green-500/20 text-green-400 hover:bg-green-500/30',
  pvp: 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30',
  social: 'bg-pink-500/20 text-pink-400 hover:bg-pink-500/30',
  educational: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30',
  historical: 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30',
  superhero: 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30',
  custom: 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30',
};

const defaultColor = 'bg-primary/20 text-primary hover:bg-primary/30';

export function GenreTag({
  name,
  slug,
  count,
  isActive = false,
  size = 'md',
  asLink = true,
  onClick,
  className,
}: GenreTagProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  const colorClass = genreColors[slug.toLowerCase()] || defaultColor;

  const badgeContent = (
    <>
      {name}
      {count !== undefined && (
        <span className="ml-1 opacity-70">({count})</span>
      )}
    </>
  );

  const badgeClassName = cn(
    'rounded-md font-medium transition-colors cursor-pointer border-0',
    sizeClasses[size],
    colorClass,
    isActive && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
    className
  );

  if (asLink) {
    return (
      <Link to={`/genres/${slug}`}>
        <Badge variant="secondary" className={badgeClassName}>
          {badgeContent}
        </Badge>
      </Link>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={badgeClassName}
      onClick={onClick}
    >
      {badgeContent}
    </Badge>
  );
}

interface GenreTagListProps {
  genres: Array<{ name: string; slug: string }>;
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
  asLinks?: boolean;
  className?: string;
}

export function GenreTagList({
  genres,
  maxVisible = 3,
  size = 'sm',
  asLinks = true,
  className,
}: GenreTagListProps) {
  const visibleGenres = genres.slice(0, maxVisible);
  const remainingCount = genres.length - maxVisible;

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {visibleGenres.map((genre) => (
        <GenreTag
          key={genre.slug}
          name={genre.name}
          slug={genre.slug}
          size={size}
          asLink={asLinks}
        />
      ))}
      {remainingCount > 0 && (
        <Badge variant="secondary" className={cn('text-xs', size === 'lg' && 'text-sm')}>
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
}
