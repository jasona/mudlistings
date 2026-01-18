import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getManagedMuds } from "@/data/admin.data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/mud/status-indicator";
import { Settings, Star, Users, MessageSquare, Plus } from "lucide-react";

export const metadata = {
  title: "Manage MUDs - MudListings",
  description: "Manage your MUD listings",
};

export default async function ManagePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "PLAYER") {
    redirect("/");
  }

  const managedMuds = await getManagedMuds(session.user.id);

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage MUDs</h1>
          <p className="text-muted-foreground">
            Manage your MUD listings and respond to reviews
          </p>
        </div>
        {session.user.role === "SITE_ADMIN" && (
          <Link href="/admin/muds/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add MUD
            </Button>
          </Link>
        )}
      </div>

      {managedMuds.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No MUDs to manage</h3>
            <p className="text-muted-foreground mb-4">
              You haven&apos;t claimed ownership of any MUDs yet.
            </p>
            <Link href="/muds">
              <Button variant="outline">Browse MUDs</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {managedMuds.map((admin) => (
            <Card key={admin.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-xl">{admin.mud.name}</CardTitle>
                      {admin.isOwner && (
                        <Badge variant="secondary">Owner</Badge>
                      )}
                      {!admin.isVerified && (
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                          Pending Verification
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      <StatusIndicator isOnline={admin.mud.isOnline} />
                    </CardDescription>
                  </div>
                  <Link href={`/manage/${admin.mudId}`}>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {admin.mud.ratingAverage.toFixed(1)} ({admin.mud.ratingCount} reviews)
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {admin.mud.favoriteCount} favorites
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {admin.mud.ratingCount} reviews
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
