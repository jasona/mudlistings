import { useState } from 'react';
import {
  ScrollText,
  Filter,
  User,
  Calendar,
  Activity,
  Search,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageTransition } from '@/components/features/animated-card';
import { Pagination } from '@/components/features/pagination';
import { useAuditLogs } from '@/hooks/use-site-admin';
import { cn } from '@/lib/utils';

const actionLabels: Record<string, string> = {
  'user.login': 'User Login',
  'user.logout': 'User Logout',
  'user.register': 'User Registration',
  'user.role_change': 'Role Changed',
  'mud.create': 'MUD Created',
  'mud.update': 'MUD Updated',
  'mud.delete': 'MUD Deleted',
  'mud.claim': 'MUD Claimed',
  'review.create': 'Review Created',
  'review.update': 'Review Updated',
  'review.delete': 'Review Deleted',
  'review.report': 'Review Reported',
  'moderation.approve': 'Report Approved',
  'moderation.hide': 'Content Hidden',
  'moderation.delete': 'Content Deleted',
  'admin.import': 'Bulk Import',
  'admin.featured': 'Featured Updated',
};

const actionCategories = [
  { value: 'all', label: 'All Actions' },
  { value: 'user', label: 'User Actions' },
  { value: 'mud', label: 'MUD Actions' },
  { value: 'review', label: 'Review Actions' },
  { value: 'moderation', label: 'Moderation Actions' },
  { value: 'admin', label: 'Admin Actions' },
];

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [userSearch, setUserSearch] = useState('');
  const [userSearchInput, setUserSearchInput] = useState('');

  const { data: auditData, isLoading, refetch, isFetching } = useAuditLogs(
    page,
    actionFilter === 'all' ? undefined : actionFilter,
    userSearch || undefined
  );

  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setUserSearch(userSearchInput);
    setPage(1);
  };

  const clearFilters = () => {
    setActionFilter('all');
    setUserSearch('');
    setUserSearchInput('');
    setPage(1);
  };

  const getActionBadgeColor = (action: string) => {
    if (action.startsWith('user.')) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (action.startsWith('mud.')) return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    if (action.startsWith('review.')) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    if (action.startsWith('moderation.')) return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (action.startsWith('admin.')) return 'bg-green-500/10 text-green-500 border-green-500/20';
    return 'bg-muted text-muted-foreground';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const hasActiveFilters = actionFilter !== 'all' || userSearch;

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <ScrollText className="h-8 w-8 text-primary" />
              Audit Log
            </h1>
            <p className="mt-2 text-muted-foreground">
              Track all system activities and changes
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isFetching && 'animate-spin')} />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Action Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={actionFilter} onValueChange={(value: string) => { setActionFilter(value); setPage(1); }}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actionCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* User Search */}
              <form onSubmit={handleUserSearch} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filter by user email or ID..."
                    value={userSearchInput}
                    onChange={(e) => setUserSearchInput(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">
                  <Search className="h-4 w-4" />
                </Button>
              </form>

              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Audit Log List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity Log</CardTitle>
            <CardDescription>
              {auditData?.totalCount || 0} events recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : auditData && auditData.items.length > 0 ? (
              <div className="space-y-2">
                {auditData.items.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                      <Activity className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={cn('text-xs', getActionBadgeColor(log.action))}
                        >
                          {actionLabels[log.action] || log.action}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatTimestamp(log.createdAt)}
                        </span>
                      </div>

                      <p className="text-sm text-foreground">{log.details}</p>

                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {log.userDisplayName && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {log.userDisplayName}
                          </span>
                        )}
                        {log.targetId && (
                          <span>Target: {log.targetType} #{log.targetId.slice(0, 8)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ScrollText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No audit logs found</p>
                {hasActiveFilters && (
                  <p className="text-sm mt-1">Try adjusting your filters</p>
                )}
              </div>
            )}

            {auditData && auditData.totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={auditData.totalPages}
                onPageChange={setPage}
                className="mt-6"
              />
            )}
          </CardContent>
        </Card>

      </div>
    </PageTransition>
  );
}
