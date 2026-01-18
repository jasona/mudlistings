import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAuditLogs } from "@/data/admin.data";
import { AuditLogTable } from "@/components/admin/audit-log-table";
import { Pagination } from "@/components/mud/pagination";
import { FileText } from "lucide-react";

interface AuditPageProps {
  searchParams: Promise<{
    action?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: "Audit Logs - MudListings Admin",
  description: "View administrative action history",
};

export default async function AuditPage({ searchParams }: AuditPageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SITE_ADMIN") {
    redirect("/");
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const { logs, total } = await getAuditLogs({ action: params.action }, page);
  const totalPages = Math.ceil(total / 50);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Audit Logs</h1>
        </div>
        <p className="text-muted-foreground">
          Administrative action history
        </p>
      </div>

      <div className="mb-4 text-sm text-muted-foreground">
        {total} {total === 1 ? "log entry" : "log entries"}
      </div>

      <AuditLogTable logs={logs} />

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/admin/audit"
          />
        </div>
      )}
    </div>
  );
}
