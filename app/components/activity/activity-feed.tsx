import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Heart, MessageSquare, Sparkles, Plus, RefreshCw } from "lucide-react";
import type { ActivityEvent, Mud, User, ActivityEventType } from "@prisma/client";

type ActivityEventWithRelations = ActivityEvent & {
  mud?: Pick<Mud, "id" | "name" | "slug"> | null;
  user?: Pick<User, "id" | "displayName" | "avatarUrl"> | null;
};

interface ActivityFeedProps {
  events: ActivityEventWithRelations[];
  emptyMessage?: string;
}

const eventIcons: Record<ActivityEventType, React.ReactNode> = {
  MUD_CREATED: <Plus className="h-4 w-4" />,
  REVIEW_POSTED: <MessageSquare className="h-4 w-4" />,
  MUD_CLAIMED: <Star className="h-4 w-4" />,
  MUD_UPDATED: <RefreshCw className="h-4 w-4" />,
  STATUS_CHANGE: <RefreshCw className="h-4 w-4" />,
  FEATURED: <Sparkles className="h-4 w-4 text-yellow-500" />,
};

const eventColors: Record<ActivityEventType, string> = {
  MUD_CREATED: "bg-green-500/10 text-green-500",
  REVIEW_POSTED: "bg-blue-500/10 text-blue-500",
  MUD_CLAIMED: "bg-purple-500/10 text-purple-500",
  MUD_UPDATED: "bg-orange-500/10 text-orange-500",
  STATUS_CHANGE: "bg-gray-500/10 text-gray-500",
  FEATURED: "bg-yellow-500/10 text-yellow-500",
};

export function ActivityFeed({
  events,
  emptyMessage = "No recent activity",
}: ActivityFeedProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0 divide-y divide-border">
        {events.map((event) => (
          <div key={event.id} className="flex items-start gap-4 p-4">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${eventColors[event.type]}`}
            >
              {eventIcons[event.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">{event.description}</p>
              <div className="flex items-center gap-2 mt-1">
                {event.user && (
                  <div className="flex items-center gap-1">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={event.user.avatarUrl || undefined} />
                      <AvatarFallback className="text-[8px]">
                        {event.user.displayName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {event.user.displayName}
                    </span>
                  </div>
                )}
                {event.mud && (
                  <Link
                    href={`/muds/${event.mud.slug}`}
                    className="text-xs text-primary hover:underline"
                  >
                    {event.mud.name}
                  </Link>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(event.createdAt, { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
