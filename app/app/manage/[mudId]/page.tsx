import { redirect, notFound } from "next/navigation";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getMudById } from "@/data/mud.data";
import { getMudAnalytics } from "@/data/admin.data";
import { prisma } from "@/lib/prisma";
import { MudEditForm } from "@/components/manage/mud-edit-form";
import { AdminList } from "@/components/manage/admin-list";
import { ReviewManagement } from "@/components/manage/review-management";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, MessageSquare, BarChart3 } from "lucide-react";

interface ManageMudPageProps {
  params: Promise<{ mudId: string }>;
}

export async function generateMetadata({
  params,
}: ManageMudPageProps): Promise<Metadata> {
  const { mudId } = await params;
  const mud = await getMudById(mudId);

  if (!mud) {
    return { title: "MUD Not Found - MudListings" };
  }

  return {
    title: `Manage ${mud.name} - MudListings`,
  };
}

export default async function ManageMudPage({ params }: ManageMudPageProps) {
  const { mudId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Check if user has access to manage this MUD
  const mudAdmin = await prisma.mudAdmin.findUnique({
    where: {
      mudId_userId: {
        mudId,
        userId: session.user.id,
      },
    },
  });

  const isSiteAdmin = session.user.role === "SITE_ADMIN";

  if (!mudAdmin && !isSiteAdmin) {
    redirect("/manage");
  }

  const [mud, analytics] = await Promise.all([
    getMudById(mudId),
    getMudAnalytics(mudId),
  ]);

  if (!mud) {
    notFound();
  }

  const admins = await prisma.mudAdmin.findMany({
    where: { mudId },
    include: { user: { select: { id: true, displayName: true, email: true, avatarUrl: true } } },
    orderBy: { createdAt: "asc" },
  });

  const reviews = await prisma.review.findMany({
    where: { mudId, isDeleted: false },
    include: {
      user: { select: { id: true, displayName: true, avatarUrl: true } },
      reply: { include: { adminUser: { select: { displayName: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const isOwner = mudAdmin?.isOwner || isSiteAdmin;

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage {mud.name}</h1>
        <p className="text-muted-foreground">
          Edit details, manage admins, and respond to reviews
        </p>
      </div>

      {/* Analytics */}
      {analytics && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{analytics.viewCount}</div>
              <div className="text-sm text-muted-foreground">Views (30d)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{mud.favoriteCount}</div>
              <div className="text-sm text-muted-foreground">Favorites</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{mud.ratingCount}</div>
              <div className="text-sm text-muted-foreground">Reviews</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {mud.ratingAverage.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details" className="gap-2">
            <Settings className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Reviews
          </TabsTrigger>
          {isOwner && (
            <TabsTrigger value="admins" className="gap-2">
              <Users className="h-4 w-4" />
              Admins
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>MUD Details</CardTitle>
              <CardDescription>
                Update your MUD&apos;s information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MudEditForm mud={mud} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
              <CardDescription>
                Respond to player reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewManagement reviews={reviews} mudId={mudId} />
            </CardContent>
          </Card>
        </TabsContent>

        {isOwner && (
          <TabsContent value="admins">
            <Card>
              <CardHeader>
                <CardTitle>Admin Management</CardTitle>
                <CardDescription>
                  Manage who can edit this MUD
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminList
                  admins={admins}
                  mudId={mudId}
                  currentUserId={session.user.id}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
