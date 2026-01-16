import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flag,
  CheckCircle,
  EyeOff,
  Trash2,
  ExternalLink,
  User,
  Star,
  AlertTriangle,
  Loader2,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { PageTransition } from '@/components/features/animated-card';
import { Pagination } from '@/components/features/pagination';
import { useModerationQueue, useModerateReport, useSiteStats } from '@/hooks/use-site-admin';
import { toast } from 'sonner';
import type { ReportedReview, ReportStatus } from '@/types';

export default function ModerationPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('Pending');
  const [selectedReport, setSelectedReport] = useState<ReportedReview | null>(null);
  const [moderationAction, setModerationAction] = useState<'approve' | 'hide' | 'delete' | null>(null);
  const [moderationReason, setModerationReason] = useState('');

  const { data: stats } = useSiteStats();
  const { data: reportsData, isLoading } = useModerationQueue(page, statusFilter);
  const moderateReport = useModerateReport();

  const handleModerate = () => {
    if (!selectedReport || !moderationAction) return;

    moderateReport.mutate(
      {
        reportId: selectedReport.id,
        action: moderationAction,
        reason: moderationReason || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Report handled successfully');
          setSelectedReport(null);
          setModerationAction(null);
          setModerationReason('');
        },
        onError: (error) => {
          toast.error((error as Error).message || 'Failed to moderate report');
        },
      }
    );
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="text-amber-500 border-amber-500/50">Pending</Badge>;
      case 'Approved':
        return <Badge variant="outline" className="text-green-500 border-green-500/50">Approved</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="text-muted-foreground">Rejected</Badge>;
      case 'ReviewHidden':
        return <Badge variant="outline" className="text-orange-500 border-orange-500/50">Hidden</Badge>;
      case 'ReviewDeleted':
        return <Badge variant="outline" className="text-red-500 border-red-500/50">Deleted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Flag className="h-8 w-8 text-primary" />
            Content Moderation
          </h1>
          <p className="mt-2 text-muted-foreground">
            Review and manage reported content
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Reports</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.pendingReports || 0}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.totalReviews || 0}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New This Week</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.newReviewsLast7Days || 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter by status:</span>
          </div>
          <Select value={statusFilter} onValueChange={(v: string) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
              <SelectItem value="ReviewHidden">Hidden</SelectItem>
              <SelectItem value="ReviewDeleted">Deleted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reports List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : reportsData && reportsData.items.length > 0 ? (
          <div className="space-y-4">
            {reportsData.items.map((report) => (
              <Card key={report.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(report.status)}
                        <span className="text-xs text-muted-foreground">
                          Reported {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-medium text-foreground mb-1">
                        {report.reviewTitle || 'Untitled Review'}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {report.reviewBody}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <Link
                          to={`/muds/${report.mudId}`}
                          className="flex items-center gap-1 hover:text-foreground"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {report.mudName}
                        </Link>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Review by {report.reviewAuthorName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {report.reviewRating}/5
                        </span>
                      </div>

                      <div className="mt-3 p-2 rounded bg-muted/50 text-sm">
                        <span className="font-medium text-foreground">Report reason: </span>
                        <span className="text-muted-foreground">{report.reason}</span>
                        {report.details && (
                          <p className="mt-1 text-muted-foreground">{report.details}</p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          Reported by {report.reporterName}
                        </p>
                      </div>
                    </div>

                    {report.status === 'Pending' && (
                      <div className="flex md:flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-500 hover:text-green-600"
                          onClick={() => {
                            setSelectedReport(report);
                            setModerationAction('approve');
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-orange-500 hover:text-orange-600"
                          onClick={() => {
                            setSelectedReport(report);
                            setModerationAction('hide');
                          }}
                        >
                          <EyeOff className="h-4 w-4 mr-1" />
                          Hide
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => {
                            setSelectedReport(report);
                            setModerationAction('delete');
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {reportsData.totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={reportsData.totalPages}
                onPageChange={setPage}
                className="mt-6"
              />
            )}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                All caught up!
              </h2>
              <p className="text-muted-foreground">
                {statusFilter === 'Pending'
                  ? 'No pending reports to review'
                  : 'No reports match this filter'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Moderation Dialog */}
        <Dialog
          open={Boolean(selectedReport && moderationAction)}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedReport(null);
              setModerationAction(null);
              setModerationReason('');
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {moderationAction === 'approve' && 'Approve Report'}
                {moderationAction === 'hide' && 'Hide Review'}
                {moderationAction === 'delete' && 'Delete Review'}
              </DialogTitle>
              <DialogDescription>
                {moderationAction === 'approve' &&
                  'Dismiss this report. The review will remain visible.'}
                {moderationAction === 'hide' &&
                  'Hide this review from public view. It can be restored later.'}
                {moderationAction === 'delete' &&
                  'Permanently delete this review. This action cannot be undone.'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                placeholder="Add a note about this moderation action..."
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedReport(null);
                  setModerationAction(null);
                  setModerationReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleModerate}
                disabled={moderateReport.isPending}
                variant={moderationAction === 'delete' ? 'destructive' : 'default'}
              >
                {moderateReport.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
