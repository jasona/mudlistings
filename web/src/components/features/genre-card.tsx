import { Link } from 'react-router-dom';
import {
  Sword,
  Rocket,
  Skull,
  Users,
  Swords,
  Heart,
  GraduationCap,
  Castle,
  Zap,
  Gamepad2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Genre } from '@/types';

const genreIcons: Record<string, React.ElementType> = {
  fantasy: Sword,
  scifi: Rocket,
  horror: Skull,
  roleplay: Users,
  pvp: Swords,
  social: Heart,
  educational: GraduationCap,
  historical: Castle,
  superhero: Zap,
  custom: Gamepad2,
};

const genreGradients: Record<string, string> = {
  fantasy: 'from-purple-500/20 to-purple-600/5',
  scifi: 'from-cyan-500/20 to-cyan-600/5',
  horror: 'from-red-500/20 to-red-600/5',
  roleplay: 'from-green-500/20 to-green-600/5',
  pvp: 'from-orange-500/20 to-orange-600/5',
  social: 'from-pink-500/20 to-pink-600/5',
  educational: 'from-blue-500/20 to-blue-600/5',
  historical: 'from-amber-500/20 to-amber-600/5',
  superhero: 'from-yellow-500/20 to-yellow-600/5',
  custom: 'from-gray-500/20 to-gray-600/5',
};

const genreColors: Record<string, string> = {
  fantasy: 'text-purple-400',
  scifi: 'text-cyan-400',
  horror: 'text-red-400',
  roleplay: 'text-green-400',
  pvp: 'text-orange-400',
  social: 'text-pink-400',
  educational: 'text-blue-400',
  historical: 'text-amber-400',
  superhero: 'text-yellow-400',
  custom: 'text-gray-400',
};

interface GenreCardProps {
  genre: Genre;
  className?: string;
}

export function GenreCard({ genre, className }: GenreCardProps) {
  const Icon = genreIcons[genre.slug.toLowerCase()] || Gamepad2;
  const gradient = genreGradients[genre.slug.toLowerCase()] || genreGradients.custom;
  const color = genreColors[genre.slug.toLowerCase()] || genreColors.custom;

  return (
    <Link to={`/genres/${genre.slug}`}>
      <Card className={cn(
        'group relative overflow-hidden transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-lg hover:border-primary/30',
        className
      )}>
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', gradient)} />
        <CardContent className="relative p-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              'p-3 rounded-lg bg-background/50 backdrop-blur-sm',
              'group-hover:scale-110 transition-transform duration-300',
              color
            )}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{genre.name}</h3>
              {genre.mudCount !== undefined && (
                <p className="text-sm text-muted-foreground">
                  {genre.mudCount} {genre.mudCount === 1 ? 'MUD' : 'MUDs'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

interface GenreGridProps {
  genres: Genre[];
  className?: string;
}

export function GenreGrid({ genres, className }: GenreGridProps) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4', className)}>
      {genres.map((genre) => (
        <GenreCard key={genre.id} genre={genre} />
      ))}
    </div>
  );
}
