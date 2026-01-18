"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { moderateReport } from "@/actions/admin.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Star, Check, X, EyeOff, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewReport, Review, User, Mud } from "@prisma/client";

type ReportWithDetails = ReviewReport & {
  review: Review & {
    user: Pick<User, "id" | "displayName" | "avatarUrl">;
    mud: Pick<Mud, "id" | "name" | "slug">;
  };
  reporter: Pick<User, "id" | "displayName">;
};

interface ModerationQueueProps {
  reports: ReportWithDetails[];
}

export function ModerationQueue({ reports }: ModerationQueueProps) {
  if (reports.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No reports in this queue
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}

function ReportCard({ report }: { report: ReportWithDetails }) {
  const [resolution, setResolution] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    "APPROVED" | "REJECTED" | "REVIEW_HIDDEN" | "REVIEW_DELETED" | null
  >(null);
  const { toast } = useToast();

  const isPending = report.status === "PENDING";

  async function handleAction(
    action: "APPROVED" | "REJECTED" | "REVIEW_HIDDEN" | "REVIEW_DELETED"
  ) {
    setIsProcessing(true);
    const result = await moderateReport(report.id, action, resolution);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Report processed",
        description: `Report has been ${action.toLowerCase().replace("_", " ")}`,
      });
      setActionDialogOpen(false);
    }
    setIsProcessing(false);
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline">{report.reason}</Badge>
              <span className="text-sm text-muted-foreground">
                Reported by {report.reporter.displayName}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(report.createdAt, { addSuffix: true })}
              </span>
            </div>
            <Link
              href={`/muds/${report.review.mud.slug}`}
              className="text-sm text-primary hover:underline"
            >
              {report.review.mud.name}
            </Link>
          </div>
          {!isPending && (
            <Badge
              className={cn(
                report.status === "APPROVED" && "bg-green-500/10 text-green-500",
                report.status === "REJECTED" && "bg-gray-500/10 text-gray-500",
                report.status === "REVIEW_HIDDEN" &&
                  "bg-yellow-500/10 text-yellow-500",
                report.status === "REVIEW_DELETED" &&
                  "bg-red-500/10 text-red-500"
              )}
            >
              {report.status.replace("_", " ")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {report.details && (
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
            <strong>Report details:</strong> {report.details}
          </div>
        )}

        {/* The reported review */}
        <div className="border rounded-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={report.review.user.avatarUrl || undefined} />
              <AvatarFallback>
                {report.review.user.displayName?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {report.review.user.displayName}
                </span>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-3 w-3",
                        star <= report.review.rating
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          {report.review.title && (
            <h4 className="font-medium mb-1">{report.review.title}</h4>
          )}
          <p className="text-sm">{report.review.body}</p>
        </div>

        {/* Actions */}
        {isPending && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction("APPROVED")}
              disabled={isProcessing}
              className="gap-1"
            >
              <Check className="h-4 w-4" />
              Approve Review
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction("REJECTED")}
              disabled={isProcessing}
              className="gap-1"
            >
              <X className="h-4 w-4" />
              Dismiss Report
            </Button>

            <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-yellow-500"
                  onClick={() => setSelectedAction("REVIEW_HIDDEN")}
                >
                  <EyeOff className="h-4 w-4" />
                  Hide Review
                </Button>
              </DialogTrigger>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-destructive"
                  onClick={() => setSelectedAction("REVIEW_DELETED")}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Review
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedAction === "REVIEW_HIDDEN"
                      ? "Hide Review"
                      : "Delete Review"}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedAction === "REVIEW_HIDDEN"
                      ? "This will hide the review from public view."
                      : "This will permanently delete the review."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Add a note about this decision (optional)..."
                    rows={3}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setActionDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => selectedAction && handleAction(selectedAction)}
                    disabled={isProcessing}
                    variant={
                      selectedAction === "REVIEW_DELETED"
                        ? "destructive"
                        : "default"
                    }
                  >
                    {isProcessing ? "Processing..." : "Confirm"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {report.resolution && (
          <div className="text-sm text-muted-foreground">
            <strong>Resolution:</strong> {report.resolution}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
