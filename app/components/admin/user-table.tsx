"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { changeUserRole } from "@/actions/admin.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@prisma/client";
import type { User } from "@prisma/client";

type UserWithCounts = Pick<
  User,
  | "id"
  | "email"
  | "displayName"
  | "avatarUrl"
  | "role"
  | "createdAt"
  | "lastLoginAt"
>;

interface UserTableProps {
  users: UserWithCounts[];
  currentUserId: string;
}

const roleColors: Record<UserRole, string> = {
  PLAYER: "bg-gray-500/10 text-gray-500",
  MUD_ADMIN: "bg-blue-500/10 text-blue-500",
  SITE_ADMIN: "bg-purple-500/10 text-purple-500",
};

export function UserTable({ users, currentUserId }: UserTableProps) {
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleRoleChange(userId: string, newRole: UserRole) {
    setUpdatingUserId(userId);
    const result = await changeUserRole(userId, newRole);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Role updated",
        description: "User role has been changed",
      });
    }
    setUpdatingUserId(null);
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Last Login</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback>
                      {user.displayName?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.displayName}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {user.id === currentUserId ? (
                  <Badge className={roleColors[user.role]}>
                    {user.role.replace("_", " ")}
                  </Badge>
                ) : (
                  <Select
                    defaultValue={user.role}
                    disabled={updatingUserId === user.id}
                    onValueChange={(value) =>
                      handleRoleChange(user.id, value as UserRole)
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLAYER">Player</SelectItem>
                      <SelectItem value="MUD_ADMIN">MUD Admin</SelectItem>
                      <SelectItem value="SITE_ADMIN">Site Admin</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(user.createdAt, { addSuffix: true })}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {user.lastLoginAt
                  ? formatDistanceToNow(user.lastLoginAt, { addSuffix: true })
                  : "Never"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
