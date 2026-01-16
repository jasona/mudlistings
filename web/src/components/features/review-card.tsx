import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, ThumbsUp, Flag, MessageSquare, Trash2, Pencil } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarRating } from './star-rating';
import { cn } from '@/lib/utils';
import type { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
  onMarkHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string, reason: string, details?: string) => void;
  onReply?: (reviewId: string, body: string) => void;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
  isHelpfulLoading?: boolean;
  className?: string;
}

export function ReviewCard({
  review,
  onMarkHelpful,
  onReport,
  onReply,
  onEdit,
  onDelete,
  isHelpfulLoading,
  className,
}: ReviewCardProps) {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [replyBody, setReplyBody] = useState('');

  const handleReport = () => {
    if (onReport && reportReason) {
      onReport(review.id, reportReason, reportDetails || undefined);
      setShowReportDialog(false);
      setReportReason('');
      setReportDetails('');
    }
  };

  const handleReply = () => {
    if (onReply && replyBody.trim()) {
      onReply(review.id, replyBody);
      setShowReplyDialog(false);
      setReplyBody('');
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(review.id);
      setShowDeleteDialog(false);
    }
  };

  const initials = review.userDisplayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <Card className={cn('hover:border-border/80 transition-colors', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={review.userAvatarUrl} alt={review.userDisplayName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{review.userDisplayName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} size="sm" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {review.isOwn && onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(review.id)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {review.isOwn && onDelete && (
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                  {onReply && !review.reply && (
                    <DropdownMenuItem onClick={() => setShowReplyDialog(true)}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Reply
                    </DropdownMenuItem>
                  )}
                  {onReport && !review.isOwn && (
                    <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                      <Flag className="h-4 w-4 mr-2" />
                      Report
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {review.title && (
            <h4 className="font-semibold text-foreground">{review.title}</h4>
          )}
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{review.body}</p>

          {/* Official Reply */}
          {review.reply && (
            <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-primary">Official Reply</span>
                <span className="text-xs text-muted-foreground">
                  from {review.reply.authorDisplayName}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{review.reply.body}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            {onMarkHelpful && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkHelpful(review.id)}
                disabled={isHelpfulLoading || review.hasVotedHelpful}
                className={cn(
                  'text-muted-foreground',
                  review.hasVotedHelpful && 'text-primary'
                )}
              >
                <ThumbsUp className={cn(
                  'h-4 w-4 mr-1',
                  review.hasVotedHelpful && 'fill-current'
                )} />
                Helpful ({review.helpfulCount})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Review</DialogTitle>
            <DialogDescription>
              Please tell us why you're reporting this review.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <select
                id="reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select a reason...</option>
                <option value="spam">Spam or advertising</option>
                <option value="offensive">Offensive or inappropriate</option>
                <option value="misleading">Misleading or false information</option>
                <option value="harassment">Harassment or abuse</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">Additional details (optional)</Label>
              <Textarea
                id="details"
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Provide any additional context..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReport} disabled={!reportReason}>
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
            <DialogDescription>
              Your reply will be shown as an official response.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Write your reply..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReplyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReply} disabled={!replyBody.trim()}>
              Post Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
