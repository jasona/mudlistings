import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  showCount = false,
  count,
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (interactive) {
      setHoverRating(index + 1);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {Array.from({ length: maxRating }).map((_, index) => {
          const fillPercentage = Math.min(100, Math.max(0, (displayRating - index) * 100));
          const isFilled = fillPercentage >= 100;
          const isPartial = fillPercentage > 0 && fillPercentage < 100;

          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(index)}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              className={cn(
                'relative focus:outline-none',
                interactive && 'cursor-pointer hover:scale-110 transition-transform'
              )}
            >
              {/* Background star (empty) */}
              <Star
                className={cn(
                  sizeClasses[size],
                  'text-muted-foreground/30'
                )}
              />

              {/* Filled star overlay */}
              {(isFilled || isPartial) && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillPercentage}%` }}
                >
                  <Star
                    className={cn(
                      sizeClasses[size],
                      'fill-amber-400 text-amber-400'
                    )}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {(showValue || showCount) && (
        <span className={cn('text-muted-foreground', textSizeClasses[size])}>
          {showValue && (
            <span className="font-medium text-foreground">
              {rating.toFixed(1)}
            </span>
          )}
          {showCount && count !== undefined && (
            <span className="ml-1">
              ({count} {count === 1 ? 'review' : 'reviews'})
            </span>
          )}
        </span>
      )}
    </div>
  );
}

interface RatingInputProps {
  value: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RatingInput({ value, onChange, size = 'lg', className }: RatingInputProps) {
  return (
    <StarRating
      rating={value}
      size={size}
      interactive
      onChange={onChange}
      className={className}
    />
  );
}
