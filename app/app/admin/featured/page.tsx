import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FeaturedManager } from "@/components/admin/featured-manager";
import { Sparkles } from "lucide-react";

export const metadata = {
  title: "Featured MUDs - MudListings Admin",
  description: "Manage featured MUD listings",
};

export default async function FeaturedPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "SITE_ADMIN") {
    redirect("/");
  }

  const [featuredMuds, allMuds] = await Promise.all([
    prisma.mud.findMany({
      where: { isFeatured: true, isDeleted: false },
      include: { genres: true },
      orderBy: { featuredOrder: "asc" },
    }),
    prisma.mud.findMany({
      where: { isFeatured: false, isDeleted: false },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          <h1 className="text-3xl font-bold">Featured MUDs</h1>
        </div>
        <p className="text-muted-foreground">
          Manage which MUDs appear in the featured section on the homepage
        </p>
      </div>

      <FeaturedManager featuredMuds={featuredMuds} allMuds={allMuds} />
    </div>
  );
}
