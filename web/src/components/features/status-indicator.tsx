import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  isOnline: boolean;
  playerCount?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusIndicator({
  isOnline,
  playerCount,
  showLabel = false,
  size = 'md',
  className,
}: StatusIndicatorProps) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  };

  const glowClasses = isOnline
    ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
    : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="relative flex">
        <span
          className={cn(
            'rounded-full',
            sizeClasses[size],
            glowClasses,
            isOnline && 'animate-pulse-status'
          )}
        />
      </span>
      {showLabel && (
        <span
          className={cn(
            'text-sm font-medium',
            isOnline ? 'text-green-500' : 'text-red-500'
          )}
        >
          {isOnline ? 'Online' : 'Offline'}
          {isOnline && playerCount !== undefined && playerCount > 0 && (
            <span className="text-muted-foreground ml-1">
              ({playerCount} {playerCount === 1 ? 'player' : 'players'})
            </span>
          )}
        </span>
      )}
    </div>
  );
}
