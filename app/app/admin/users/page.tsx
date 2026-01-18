import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUsers } from "@/data/admin.data";
import { UserTable } from "@/components/admin/user-table";
import { UserFilters } from "@/components/admin/user-filters";
import { Pagination } from "@/components/mud/pagination";
import { Users } from "lucide-react";
import { UserRole } from "@prisma/client";

interface UsersPageProps {
  searchParams: Promise<{
    search?: string;
    role?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: "User Management - MudListings Admin",
  description: "Manage user accounts and permissions",
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== "SITE_ADMIN") {
    redirect("/");
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const { users, total } = await getUsers(
    params.search,
    params.role as UserRole | undefined,
    page
  );

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">User Management</h1>
        </div>
        <p className="text-muted-foreground">
          Manage user accounts and permissions
        </p>
      </div>

      <UserFilters />

      <div className="mt-6 mb-4 text-sm text-muted-foreground">
        {total} {total === 1 ? "user" : "users"} found
      </div>

      <UserTable users={users} currentUserId={session.user.id} />

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/admin/users"
          />
        </div>
      )}
    </div>
  );
}
