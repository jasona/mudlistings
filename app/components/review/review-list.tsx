import { ReviewCard } from "./review-card";
import type { Review, User, ReviewReply } from "@prisma/client";

type ReviewWithUser = Review & {
  user: Pick<User, "id" | "displayName" | "avatarUrl">;
  reply?: (ReviewReply & { adminUser: Pick<User, "displayName"> }) | null;
};

interface ReviewListProps {
  reviews: ReviewWithUser[];
  mudSlug: string;
  currentUserId?: string;
  emptyMessage?: string;
}

export function ReviewList({
  reviews,
  mudSlug,
  currentUserId,
  emptyMessage = "No reviews yet. Be the first to share your experience!",
}: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          mudSlug={mudSlug}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
