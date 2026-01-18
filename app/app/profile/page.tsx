import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserById, getUserStats } from "@/data/user.data";
import { ProfileForm } from "@/components/profile/profile-form";
import { PrivacySettingsForm } from "@/components/profile/privacy-settings-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Key } from "lucide-react";

export const metadata = {
  title: "Profile Settings - MudListings",
  description: "Manage your MudListings profile",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [user, stats] = await Promise.all([
    getUserById(session.user.id),
    getUserStats(session.user.id),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats?.reviewCount || 0}</div>
            <div className="text-sm text-muted-foreground">Reviews</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats?.favoriteCount || 0}</div>
            <div className="text-sm text-muted-foreground">Favorites</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats?.helpfulVotesReceived || 0}</div>
            <div className="text-sm text-muted-foreground">Helpful Votes</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Key className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your display name and bio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm user={user} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control what others can see about you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PrivacySettingsForm user={user} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your account password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
