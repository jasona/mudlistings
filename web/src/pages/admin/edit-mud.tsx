import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Loader2,
  Globe,
  Server,
  Info,
  UserPlus,
  Trash2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PageTransition } from '@/components/features/animated-card';
import { useAuthStore } from '@/stores/auth-store';
import { useCurrentUser } from '@/hooks/use-auth';
import { useMud } from '@/hooks/use-muds';
import { useUpdateMud, useMudAdmins, useInviteAdmin, useRemoveAdmin } from '@/hooks/use-admin';
import { toast } from 'sonner';
import type { Mud } from '@/types';

export default function EditMudPage() {
  const { mudId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { isLoading: isUserLoading } = useCurrentUser();
  const { data: mud, isLoading: isMudLoading } = useMud(mudId || '');
  const { data: admins, isLoading: isAdminsLoading } = useMudAdmins(mudId || '');

  const updateMud = useUpdateMud();
  const inviteAdmin = useInviteAdmin();
  const removeAdmin = useRemoveAdmin();

  const [formData, setFormData] = useState<Partial<Mud>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MudAdmin');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  // Populate form when mud data loads
  useEffect(() => {
    if (mud) {
      setFormData({
        name: mud.name,
        description: mud.description,
        host: mud.host,
        port: mud.port,
        websiteUrl: mud.websiteUrl || '',
        webClientUrl: mud.webClientUrl || '',
        codebase: mud.codebase || '',
        language: mud.language || '',
        establishedDate: mud.establishedDate || '',
      });
    }
  }, [mud]);

  // Redirect if not authenticated
  if (!isUserLoading && !isAuthenticated) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  const handleChange = (field: keyof Mud, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }
    if (!formData.host?.trim()) {
      newErrors.host = 'Host is required';
    }
    if (!formData.port || formData.port < 1 || formData.port > 65535) {
      newErrors.port = 'Port must be between 1 and 65535';
    }
    if (formData.websiteUrl && !/^https?:\/\/.+/.test(formData.websiteUrl)) {
      newErrors.websiteUrl = 'Must be a valid URL starting with http:// or https://';
    }
    if (formData.webClientUrl && !/^https?:\/\/.+/.test(formData.webClientUrl)) {
      newErrors.webClientUrl = 'Must be a valid URL starting with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !mudId) return;

    updateMud.mutate(
      { mudId, data: formData },
      {
        onSuccess: () => {
          toast.success('MUD updated successfully');
        },
        onError: (error) => {
          toast.error((error as Error).message || 'Failed to update MUD');
        },
      }
    );
  };

  const handleInviteAdmin = () => {
    if (!inviteEmail || !mudId) return;

    inviteAdmin.mutate(
      { mudId, email: inviteEmail, role: inviteRole },
      {
        onSuccess: () => {
          toast.success('Invitation sent successfully');
          setInviteEmail('');
          setIsInviteDialogOpen(false);
        },
        onError: (error) => {
          toast.error((error as Error).message || 'Failed to send invitation');
        },
      }
    );
  };

  const handleRemoveAdmin = (userId: string, displayName: string) => {
    if (!mudId) return;

    removeAdmin.mutate(
      { mudId, userId },
      {
        onSuccess: () => {
          toast.success(`${displayName} has been removed`);
        },
        onError: (error) => {
          toast.error((error as Error).message || 'Failed to remove admin');
        },
      }
    );
  };

  if (isUserLoading || isMudLoading) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <Skeleton className="h-96" />
        </div>
      </PageTransition>
    );
  }

  if (!mud) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <Info className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground">MUD Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            This MUD either doesn't exist or you don't have permission to edit it.
          </p>
          <Button className="mt-6" onClick={() => navigate('/admin')}>
            Back to Dashboard
          </Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Edit MUD</h1>
              <p className="mt-1 text-muted-foreground">
                Update your MUD listing information
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to={`/mud/${mud.slug}`}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Public Page
              </Link>
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Core details about your MUD
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Your MUD's name"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe your MUD (at least 50 characters)"
                  rows={6}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Minimum 50 characters</span>
                  <span>{formData.description?.length || 0} characters</span>
                </div>
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="codebase">Codebase</Label>
                  <Input
                    id="codebase"
                    value={formData.codebase || ''}
                    onChange={(e) => handleChange('codebase', e.target.value)}
                    placeholder="e.g., CircleMUD, DikuMUD, LPMud"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Primary Language</Label>
                  <Input
                    id="language"
                    value={formData.language || ''}
                    onChange={(e) => handleChange('language', e.target.value)}
                    placeholder="e.g., English, Spanish"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="establishedDate">Established Date</Label>
                <Input
                  id="establishedDate"
                  type="date"
                  value={formData.establishedDate || ''}
                  onChange={(e) => handleChange('establishedDate', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Connection Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Connection Information
              </CardTitle>
              <CardDescription>
                How players connect to your MUD
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="host">Host *</Label>
                  <Input
                    id="host"
                    value={formData.host || ''}
                    onChange={(e) => handleChange('host', e.target.value)}
                    placeholder="mud.example.com"
                  />
                  {errors.host && (
                    <p className="text-sm text-destructive">{errors.host}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port *</Label>
                  <Input
                    id="port"
                    type="number"
                    value={formData.port || ''}
                    onChange={(e) => handleChange('port', parseInt(e.target.value, 10))}
                    placeholder="4000"
                    min={1}
                    max={65535}
                  />
                  {errors.port && (
                    <p className="text-sm text-destructive">{errors.port}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Web Presence */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Web Presence
              </CardTitle>
              <CardDescription>
                Links to your website and web client
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={formData.websiteUrl || ''}
                  onChange={(e) => handleChange('websiteUrl', e.target.value)}
                  placeholder="https://www.yourmud.com"
                />
                {errors.websiteUrl && (
                  <p className="text-sm text-destructive">{errors.websiteUrl}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="webClientUrl">Web Client URL</Label>
                <Input
                  id="webClientUrl"
                  type="url"
                  value={formData.webClientUrl || ''}
                  onChange={(e) => handleChange('webClientUrl', e.target.value)}
                  placeholder="https://play.yourmud.com"
                />
                {errors.webClientUrl && (
                  <p className="text-sm text-destructive">{errors.webClientUrl}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMud.isPending}>
              {updateMud.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>

        <Separator className="my-8" />

        {/* Admin Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  MUD Administrators
                </CardTitle>
                <CardDescription>
                  People who can edit this MUD listing
                </CardDescription>
              </div>
              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Admin
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Administrator</DialogTitle>
                    <DialogDescription>
                      Send an invitation to add a new administrator for this MUD.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="inviteEmail">Email Address</Label>
                      <Input
                        id="inviteEmail"
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="admin@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inviteRole">Role</Label>
                      <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MudAdmin">Admin (full access)</SelectItem>
                          <SelectItem value="MudEditor">Editor (limited access)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsInviteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleInviteAdmin}
                      disabled={!inviteEmail || inviteAdmin.isPending}
                    >
                      {inviteAdmin.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Invitation'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isAdminsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : admins && admins.length > 0 ? (
              <div className="space-y-2">
                {admins.map((admin) => (
                  <div
                    key={admin.userId}
                    className="flex items-center justify-between p-3 rounded-lg border bg-background"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {admin.displayName}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {admin.role}
                        </Badge>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Administrator</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {admin.displayName} as an administrator?
                            They will no longer be able to edit this MUD listing.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveAdmin(admin.userId, admin.displayName)}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No additional administrators
              </p>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50 mt-6">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions for this MUD listing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Transfer Ownership</h3>
                <p className="text-sm text-muted-foreground">
                  Transfer this MUD to another user. You will lose admin access.
                </p>
              </div>
              <Button variant="outline">Transfer</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
