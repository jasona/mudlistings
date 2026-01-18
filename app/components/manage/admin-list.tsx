"use client";

import { useState } from "react";
import { removeAdmin, inviteAdmin, transferOwnership } from "@/actions/mud-admin.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Trash2, Crown } from "lucide-react";
import type { MudAdmin, User } from "@prisma/client";

type AdminWithUser = MudAdmin & {
  user: Pick<User, "id" | "displayName" | "email" | "avatarUrl">;
};

interface AdminListProps {
  admins: AdminWithUser[];
  mudId: string;
  currentUserId: string;
}

export function AdminList({ admins, mudId, currentUserId }: AdminListProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const { toast } = useToast();

  const currentAdmin = admins.find((a) => a.userId === currentUserId);
  const isOwner = currentAdmin?.isOwner;

  async function handleInvite() {
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    const result = await inviteAdmin(mudId, inviteEmail);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Invitation sent",
        description: `Invited ${inviteEmail} as an admin`,
      });
      setInviteEmail("");
      setInviteDialogOpen(false);
    }
    setIsInviting(false);
  }

  async function handleRemove(adminId: string) {
    const result = await removeAdmin(mudId, adminId);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Admin removed",
        description: "The admin has been removed",
      });
    }
  }

  async function handleTransfer(newOwnerId: string) {
    const result = await transferOwnership(mudId, newOwnerId);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Ownership transferred",
        description: "You are no longer the owner of this MUD",
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Admin list */}
      <div className="space-y-4">
        {admins.map((admin) => (
          <div
            key={admin.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={admin.user.avatarUrl || undefined} />
                <AvatarFallback>
                  {admin.user.displayName?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{admin.user.displayName}</span>
                  {admin.isOwner && (
                    <Badge variant="secondary" className="gap-1">
                      <Crown className="h-3 w-3" />
                      Owner
                    </Badge>
                  )}
                  {!admin.isVerified && (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {admin.user.email}
                </div>
              </div>
            </div>

            {isOwner && admin.userId !== currentUserId && (
              <div className="flex items-center gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Crown className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Transfer Ownership</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to transfer ownership to{" "}
                        {admin.user.displayName}? You will no longer be the
                        owner of this MUD.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleTransfer(admin.userId)}
                      >
                        Transfer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Admin</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove {admin.user.displayName}{" "}
                        as an admin?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleRemove(admin.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Invite button */}
      {isOwner && (
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Invite Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Admin</DialogTitle>
              <DialogDescription>
                Enter the email address of the person you want to invite as an
                admin for this MUD.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setInviteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={isInviting || !inviteEmail}>
                {isInviting ? "Inviting..." : "Send Invite"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
