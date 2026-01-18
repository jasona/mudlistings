"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toggleHelpful, deleteReview, reportReview } from "@/actions/review.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Star, ThumbsUp, MoreVertical, Flag, Trash2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Review, User, ReviewReply } from "@prisma/client";

type ReviewWithUser = Review & {
  user: Pick<User, "id" | "displayName" | "avatarUrl">;
  reply?: (ReviewReply & { adminUser: Pick<User, "displayName"> }) | null;
};

interface ReviewCardProps {
  review: ReviewWithUser;
  currentUserId?: string;
  mudSlug: string;
}

export function ReviewCard({ review, currentUserId, mudSlug }: ReviewCardProps) {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const isOwner = currentUserId === review.userId;

  async function handleHelpful() {
    if (!currentUserId) {
      toast({
        title: "Login required",
        description: "You must be logged in to mark reviews as helpful",
        variant: "destructive",
      });
      return;
    }

    const result = await toggleHelpful(review.id);
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteReview(review.id);
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Review deleted",
        description: "Your review has been removed",
      });
    }
    setIsDeleting(false);
  }

  return (
    <>
      <Card className={cn(review.isHidden && "opacity-50")}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={review.user.avatarUrl || undefined} />
                <AvatarFallback>
                  {review.user.displayName?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{review.user.displayName}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(review.createdAt, { addSuffix: true })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
              {currentUserId && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isOwner ? (
                      <DropdownMenuItem
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {review.title && (
            <h4 className="font-semibold">{review.title}</h4>
          )}
          <p className="text-sm whitespace-pre-wrap">{review.body}</p>

          {review.reply && (
            <div className="mt-4 pl-4 border-l-2 border-primary/50 bg-muted/50 p-3 rounded-r">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  Response from {review.reply.adminUser.displayName}
                </span>
              </div>
              <p className="text-sm">{review.reply.body}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHelpful}
            className="gap-2"
          >
            <ThumbsUp className="h-4 w-4" />
            Helpful {review.helpfulCount > 0 && `(${review.helpfulCount})`}
          </Button>
        </CardFooter>
      </Card>

      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        reviewId={review.id}
      />
    </>
  );
}

function ReportDialog({
  open,
  onOpenChange,
  reviewId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewId: string;
}) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  async function handleSubmit() {
    if (!reason.trim()) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.set("reviewId", reviewId);
    formData.set("reason", reason);

    const result = await reportReview(formData);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe",
      });
      onOpenChange(false);
      setReason("");
    }
    setIsSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Review</DialogTitle>
          <DialogDescription>
            Please tell us why you&apos;re reporting this review.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this review should be reviewed..."
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!reason.trim() || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
