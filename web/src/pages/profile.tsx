import { useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { Camera, Save, User, Mail, Calendar, Shield } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageTransition } from '@/components/features/animated-card';
import { ReviewCard } from '@/components/features/review-card';
import { Pagination } from '@/components/features/pagination';
import { NoReviews } from '@/components/features/empty-state';
import { useAuthStore } from '@/stores/auth-store';
import { useCurrentUser } from '@/hooks/use-auth';
import { useReviewsByUser, useDeleteReview } from '@/hooks/use-reviews';
import { usersApi } from '@/lib/api';
import { authKeys } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, isAuthenticated, setUser } = useAuthStore();
  const { isLoading: isUserLoading } = useCurrentUser();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [reviewPage, setReviewPage] = useState(1);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Fetch user's reviews
  const { data: reviewsData, isLoading: isReviewsLoading } = useReviewsByUser(
    user?.id || '',
    reviewPage
  );

  // Mutations
  const deleteReview = useDeleteReview();

  const updateProfileMutation = useMutation({
    mutationFn: (data: { displayName: string }) => usersApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.setQueryData(authKeys.user(), updatedUser);
      setIsEditingProfile(false);
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(file),
    onSuccess: (data) => {
      if (user) {
        const updatedUser = { ...user, avatarUrl: data.avatarUrl };
        setUser(updatedUser);
        queryClient.setQueryData(authKeys.user(), updatedUser);
        toast.success('Avatar updated successfully');
      }
    },
    onError: () => {
      toast.error('Failed to upload avatar');
    },
  });

  const handleSaveProfile = () => {
    if (displayName.trim()) {
      updateProfileMutation.mutate({ displayName: displayName.trim() });
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      uploadAvatarMutation.mutate(file);
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    deleteReview.mutate(reviewId, {
      onSuccess: () => {
        toast.success('Review deleted');
      },
    });
  };

  // Redirect if not authenticated
  if (!isUserLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isUserLoading) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </PageTransition>
    );
  }

  const initials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const roleLabels: Record<string, string> = {
    Anonymous: 'Guest',
    Player: 'Player',
    MudAdmin: 'MUD Administrator',
    SiteAdmin: 'Site Administrator',
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="reviews">My Reviews</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="space-y-6">
              {/* Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Manage your account details and public profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={user?.avatarUrl} alt={user?.displayName} />
                        <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                      </Avatar>
                      <button
                        onClick={handleAvatarClick}
                        className={cn(
                          'absolute inset-0 flex items-center justify-center rounded-full',
                          'bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity',
                          uploadAvatarMutation.isPending && 'opacity-100'
                        )}
                        disabled={uploadAvatarMutation.isPending}
                      >
                        {uploadAvatarMutation.isPending ? (
                          <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Camera className="h-6 w-6 text-white" />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">
                        {user?.displayName}
                      </h2>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                      <Badge variant="secondary" className="mt-2">
                        <Shield className="h-3 w-3 mr-1" />
                        {roleLabels[user?.role || 'Player']}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Profile Fields */}
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        {isEditingProfile ? (
                          <Input
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Enter your display name"
                          />
                        ) : (
                          <div className="flex items-center gap-2 h-9 px-3 py-1 rounded-md border border-input bg-background text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {user?.displayName}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Email</Label>
                        <div className="flex items-center gap-2 h-9 px-3 py-1 rounded-md border border-input bg-background text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {user?.email}
                          {user?.isEmailVerified ? (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="ml-auto text-xs text-amber-500 border-amber-500/50">
                              Unverified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Member Since</Label>
                      <div className="flex items-center gap-2 h-9 px-3 py-1 rounded-md border border-input bg-background text-sm max-w-xs">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'Unknown'}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {isEditingProfile ? (
                      <>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={updateProfileMutation.isPending}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingProfile(false);
                            setDisplayName(user?.displayName || '');
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setIsEditingProfile(true)}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>My Reviews</CardTitle>
                <CardDescription>
                  Reviews you've written for MUDs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isReviewsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-32" />
                    ))}
                  </div>
                ) : reviewsData && reviewsData.items.length > 0 ? (
                  <div className="space-y-4">
                    {reviewsData.items.map((review) => (
                      <ReviewCard
                        key={review.id}
                        review={{ ...review, isOwn: true }}
                        onDelete={handleDeleteReview}
                      />
                    ))}
                    {reviewsData.totalPages > 1 && (
                      <Pagination
                        currentPage={reviewPage}
                        totalPages={reviewsData.totalPages}
                        onPageChange={setReviewPage}
                        className="mt-6"
                      />
                    )}
                  </div>
                ) : (
                  <NoReviews />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              {/* Email Verification */}
              {!user?.isEmailVerified && (
                <Card>
                  <CardHeader>
                    <CardTitle>Email Verification</CardTitle>
                    <CardDescription>
                      Verify your email address to access all features
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      A verification email was sent to <strong>{user?.email}</strong>.
                      Please check your inbox and click the verification link.
                    </p>
                    <Button variant="outline">Resend Verification Email</Button>
                  </CardContent>
                </Card>
              )}

              {/* Account Security */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                  <CardDescription>
                    Manage your password and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Change Password</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Update your password to keep your account secure
                    </p>
                    <Button variant="outline">Change Password</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible actions for your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Delete Account</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Permanently delete your account and all associated data.
                      This action cannot be undone.
                    </p>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
