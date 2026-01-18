"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { addAdminReply, deleteAdminReply } from "@/actions/review.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Star, MessageSquare, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Review, User, ReviewReply } from "@prisma/client";

type ReviewWithDetails = Review & {
  user: Pick<User, "id" | "displayName" | "avatarUrl">;
  reply?: (ReviewReply & { adminUser: Pick<User, "displayName"> }) | null;
};

interface ReviewManagementProps {
  reviews: ReviewWithDetails[];
  mudId: string;
}

export function ReviewManagement({ reviews, mudId }: ReviewManagementProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No reviews yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewItem key={review.id} review={review} />
      ))}
    </div>
  );
}

function ReviewItem({ review }: { review: ReviewWithDetails }) {
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  async function handleReply() {
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.set("reviewId", review.id);
    formData.set("body", replyText);

    const result = await addAdminReply(formData);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Reply posted",
        description: "Your response has been added",
      });
      setReplyText("");
      setReplyDialogOpen(false);
    }
    setIsSubmitting(false);
  }

  async function handleDeleteReply() {
    const result = await deleteAdminReply(review.id);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Reply deleted",
        description: "Your response has been removed",
      });
    }
  }

  return (
    <Card className={cn(review.isHidden && "opacity-50")}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.user.avatarUrl || undefined} />
            <AvatarFallback>
              {review.user.displayName?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-medium">{review.user.displayName}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  {formatDistanceToNow(review.createdAt, { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4",
                      star <= review.rating
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
            </div>

            {review.title && (
              <h4 className="font-medium mb-1">{review.title}</h4>
            )}
            <p className="text-sm">{review.body}</p>

            {/* Admin reply */}
            {review.reply ? (
              <div className="mt-4 pl-4 border-l-2 border-primary/50 bg-muted/50 p-3 rounded-r">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      Response from {review.reply.adminUser.displayName}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteReply}
                    className="text-destructive h-8"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm">{review.reply.body}</p>
              </div>
            ) : (
              <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="mt-4 gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Reply
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reply to Review</DialogTitle>
                    <DialogDescription>
                      Your response will be visible to everyone viewing this
                      review.
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your response..."
                    rows={4}
                  />
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setReplyDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleReply}
                      disabled={isSubmitting || !replyText.trim()}
                    >
                      {isSubmitting ? "Posting..." : "Post Reply"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
