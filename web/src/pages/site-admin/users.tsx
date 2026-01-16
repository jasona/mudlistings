import { useState } from 'react';
import {
  Users,
  Search,
  Shield,
  Mail,
  Calendar,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageTransition } from '@/components/features/animated-card';
import { Pagination } from '@/components/features/pagination';
import { useUsers, useChangeUserRole, useSiteStats } from '@/hooks/use-site-admin';
import { toast } from 'sonner';
import type { UserRole } from '@/types';

export default function UserManagementPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data: stats } = useSiteStats();
  const { data: usersData, isLoading } = useUsers(page, search || undefined);
  const changeUserRole = useChangeUserRole();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleRoleChange = (userId: string, role: UserRole, displayName: string) => {
    changeUserRole.mutate(
      { userId, role },
      {
        onSuccess: () => {
          toast.success(`${displayName}'s role updated to ${role}`);
        },
        onError: (error) => {
          toast.error((error as Error).message || 'Failed to update role');
        },
      }
    );
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SiteAdmin':
        return <Badge variant="default" className="bg-red-500/10 text-red-500 border-red-500/20">Site Admin</Badge>;
      case 'MudAdmin':
        return <Badge variant="default" className="bg-blue-500/10 text-blue-500 border-blue-500/20">MUD Admin</Badge>;
      case 'Player':
        return <Badge variant="secondary">Player</Badge>;
      case 'Anonymous':
        return <Badge variant="outline">Guest</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            User Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage user accounts and roles
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.totalUsers || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">New This Week</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.newUsersLast7Days || 0}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">MUD Admins</p>
                  <p className="text-2xl font-bold text-foreground">
                    {usersData?.items.filter((u) => u.role === 'MudAdmin').length || 0}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
            {search && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearch('');
                  setSearchInput('');
                  setPage(1);
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </form>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Users</CardTitle>
            <CardDescription>
              {usersData?.totalCount || 0} total users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : usersData && usersData.items.length > 0 ? (
              <div className="space-y-2">
                {usersData.items.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                      <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground truncate">
                          {user.displayName}
                        </p>
                        {getRoleBadge(user.role)}
                        {user.isEmailVerified && (
                          <Badge variant="outline" className="text-xs text-green-500 border-green-500/50">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {(['Player', 'MudAdmin', 'SiteAdmin'] as UserRole[]).map((role) => (
                          <DropdownMenuItem
                            key={role}
                            onClick={() => handleRoleChange(user.id, role, user.displayName)}
                            disabled={user.role === role || changeUserRole.isPending}
                          >
                            {role === user.role && '✓ '}
                            {role === 'SiteAdmin'
                              ? 'Site Admin'
                              : role === 'MudAdmin'
                              ? 'MUD Admin'
                              : role}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {search ? `No users found for "${search}"` : 'No users found'}
              </div>
            )}

            {usersData && usersData.totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={usersData.totalPages}
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
