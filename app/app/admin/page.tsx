import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getSiteStats } from "@/data/admin.data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  MessageSquare,
  Flag,
  Gamepad2,
  TrendingUp,
  ArrowRight,
  Shield,
  FileText,
} from "lucide-react";

export const metadata = {
  title: "Admin Dashboard - MudListings",
  description: "Site administration dashboard",
};

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "SITE_ADMIN") {
    redirect("/");
  }

  const stats = await getSiteStats();

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Site administration and moderation tools
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsersThisWeek} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total MUDs</CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMuds}</div>
            <p className="text-xs text-muted-foreground">
              {stats.onlineMuds} currently online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newReviewsThisWeek} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReports}</div>
            <p className="text-xs text-muted-foreground">
              Require moderation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Moderation
            </CardTitle>
            <CardDescription>
              Review reported content and take action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/moderation">
              <Button className="w-full gap-2">
                View Reports
                {stats.pendingReports > 0 && (
                  <span className="bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full text-xs">
                    {stats.pendingReports}
                  </span>
                )}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage user accounts and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full gap-2">
                Manage Users
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Audit Logs
            </CardTitle>
            <CardDescription>
              View administrative action history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/audit">
              <Button variant="outline" className="w-full gap-2">
                View Logs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              Featured MUDs
            </CardTitle>
            <CardDescription>
              Manage featured listings on the homepage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/featured">
              <Button variant="outline" className="w-full gap-2">
                Manage Featured
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Add New MUD
            </CardTitle>
            <CardDescription>
              Create a new MUD listing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/muds/new">
              <Button variant="outline" className="w-full gap-2">
                Add MUD
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
