import { formatDistanceToNow } from "date-fns";
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
import type { AuditLog, User } from "@prisma/client";

type AuditLogWithUser = AuditLog & {
  user: Pick<User, "id" | "displayName" | "avatarUrl">;
};

interface AuditLogTableProps {
  logs: AuditLogWithUser[];
}

const actionColors: Record<string, string> = {
  MODERATE_REVIEW_APPROVED: "bg-green-500/10 text-green-500",
  MODERATE_REVIEW_REJECTED: "bg-gray-500/10 text-gray-500",
  MODERATE_REVIEW_REVIEW_HIDDEN: "bg-yellow-500/10 text-yellow-500",
  MODERATE_REVIEW_REVIEW_DELETED: "bg-red-500/10 text-red-500",
  CHANGE_USER_ROLE: "bg-purple-500/10 text-purple-500",
  CREATE_MUD: "bg-blue-500/10 text-blue-500",
  BULK_IMPORT_MUDS: "bg-blue-500/10 text-blue-500",
};

export function AuditLogTable({ logs }: AuditLogTableProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No audit logs found
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <Badge
                  className={actionColors[log.action] || "bg-gray-500/10 text-gray-500"}
                >
                  {formatAction(log.action)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={log.user.avatarUrl || undefined} />
                    <AvatarFallback className="text-xs">
                      {log.user.displayName?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{log.user.displayName}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {log.targetType && (
                  <span className="text-xs">
                    {log.targetType}
                    {log.targetId && `: ${log.targetId.slice(0, 8)}...`}
                  </span>
                )}
              </TableCell>
              <TableCell>
                {log.details && (
                  <pre className="text-xs text-muted-foreground max-w-xs truncate">
                    {JSON.stringify(log.details)}
                  </pre>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(log.createdAt, { addSuffix: true })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function formatAction(action: string): string {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}
