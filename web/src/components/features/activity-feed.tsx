import { Link } from 'react-router-dom';
import { Gamepad2, Star, Wifi, Award, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActivityEvent, ActivityEventType } from '@/types';

const eventIcons: Record<ActivityEventType, React.ElementType> = {
  NewListing: Gamepad2,
  NewReview: Star,
  StatusChange: Wifi,
  Featured: Award,
};

const eventColors: Record<ActivityEventType, string> = {
  NewListing: 'text-green-400 bg-green-400/10',
  NewReview: 'text-amber-400 bg-amber-400/10',
  StatusChange: 'text-cyan-400 bg-cyan-400/10',
  Featured: 'text-purple-400 bg-purple-400/10',
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getEventMessage(event: ActivityEvent): React.ReactNode {
  switch (event.type) {
    case 'NewListing':
      return (
        <>
          <Link to={`/muds/${event.mudSlug}`} className="font-medium text-foreground hover:underline">
            {event.mudName}
          </Link>
          {' was added to the directory'}
        </>
      );
    case 'NewReview':
      return (
        <>
          <span className="font-medium text-foreground">{event.userDisplayName}</span>
          {' reviewed '}
          <Link to={`/muds/${event.mudSlug}`} className="font-medium text-foreground hover:underline">
            {event.mudName}
          </Link>
        </>
      );
    case 'StatusChange':
      const isOnline = event.metadata?.isOnline as boolean | undefined;
      return (
        <>
          <Link to={`/muds/${event.mudSlug}`} className="font-medium text-foreground hover:underline">
            {event.mudName}
          </Link>
          {isOnline ? ' is now online' : ' went offline'}
        </>
      );
    case 'Featured':
      return (
        <>
          <Link to={`/muds/${event.mudSlug}`} className="font-medium text-foreground hover:underline">
            {event.mudName}
          </Link>
          {' was featured'}
        </>
      );
    default:
      return event.mudName || 'Activity';
  }
}

interface ActivityItemProps {
  event: ActivityEvent;
  className?: string;
}

export function ActivityItem({ event, className }: ActivityItemProps) {
  const Icon = eventIcons[event.type];
  const colorClass = eventColors[event.type];

  return (
    <div className={cn('flex items-start gap-3 py-3', className)}>
      <div className={cn('p-2 rounded-lg shrink-0', colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">
          {getEventMessage(event)}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatRelativeTime(event.createdAt)}
        </p>
      </div>
    </div>
  );
}

interface ActivityFeedProps {
  events: ActivityEvent[];
  isLoading?: boolean;
  className?: string;
}

export function ActivityFeed({ events, isLoading, className }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 py-3 animate-pulse">
            <div className="w-10 h-10 rounded-lg bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-3 w-1/4 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={cn('py-8 text-center text-muted-foreground', className)}>
        No recent activity
      </div>
    );
  }

  return (
    <div className={cn('divide-y divide-border', className)}>
      {events.map((event) => (
        <ActivityItem key={event.id} event={event} />
      ))}
    </div>
  );
}
