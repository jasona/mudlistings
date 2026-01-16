import { type LucideIcon, Search, Heart, FileText, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'outline' | 'terminal';
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = FileText,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      <div className="mb-4 rounded-full bg-muted p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {action && (
        <Button
          variant={action.variant || 'default'}
          onClick={action.onClick}
          className="mt-6"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Preset empty states for common scenarios
export function NoSearchResults({ onReset }: { onReset?: () => void }) {
  return (
    <EmptyState
      icon={Search}
      title="No MUDs found"
      description="Try adjusting your search terms or filters to find what you're looking for."
      action={
        onReset
          ? {
              label: 'Clear filters',
              onClick: onReset,
              variant: 'outline',
            }
          : undefined
      }
    />
  );
}

export function NoFavorites({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <EmptyState
      icon={Heart}
      title="No favorites yet"
      description="Start exploring and add MUDs to your favorites to keep track of them."
      action={
        onBrowse
          ? {
              label: 'Browse MUDs',
              onClick: onBrowse,
            }
          : undefined
      }
    />
  );
}

export function NoReviews({ onWrite }: { onWrite?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No reviews yet"
      description="Be the first to share your experience with this MUD."
      action={
        onWrite
          ? {
              label: 'Write a review',
              onClick: onWrite,
            }
          : undefined
      }
    />
  );
}

export function NoManagedMuds({ onClaim }: { onClaim?: () => void }) {
  return (
    <EmptyState
      icon={Gamepad2}
      title="No MUDs to manage"
      description="Claim ownership of your MUD to access analytics and management features."
      action={
        onClaim
          ? {
              label: 'Claim a MUD',
              onClick: onClaim,
            }
          : undefined
      }
    />
  );
}
