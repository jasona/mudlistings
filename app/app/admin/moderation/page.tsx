import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getModerationQueue } from "@/data/admin.data";
import { ModerationQueue } from "@/components/admin/moderation-queue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flag } from "lucide-react";
import { ReportStatus } from "@prisma/client";

interface ModerationPageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: "Moderation - MudListings Admin",
  description: "Review and moderate reported content",
};

export default async function ModerationPage({
  searchParams,
}: ModerationPageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SITE_ADMIN") {
    redirect("/");
  }

  const params = await searchParams;
  const status = (params.status as ReportStatus) || "PENDING";
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const { reports, total } = await getModerationQueue(status, page);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Flag className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Moderation Queue</h1>
        </div>
        <p className="text-muted-foreground">
          Review reported reviews and take action
        </p>
      </div>

      <Tabs defaultValue={status} className="space-y-6">
        <TabsList>
          <TabsTrigger value="PENDING">
            <a href="/admin/moderation?status=PENDING">Pending</a>
          </TabsTrigger>
          <TabsTrigger value="APPROVED">
            <a href="/admin/moderation?status=APPROVED">Approved</a>
          </TabsTrigger>
          <TabsTrigger value="REJECTED">
            <a href="/admin/moderation?status=REJECTED">Rejected</a>
          </TabsTrigger>
          <TabsTrigger value="REVIEW_HIDDEN">
            <a href="/admin/moderation?status=REVIEW_HIDDEN">Hidden</a>
          </TabsTrigger>
          <TabsTrigger value="REVIEW_DELETED">
            <a href="/admin/moderation?status=REVIEW_DELETED">Deleted</a>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={status} className="mt-6">
          <div className="mb-4 text-sm text-muted-foreground">
            {total} {total === 1 ? "report" : "reports"}
          </div>
          <ModerationQueue reports={reports} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
