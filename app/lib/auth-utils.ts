import { auth } from "./auth";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

/**
 * Get the current session on the server side
 */
export async function getSession() {
  return await auth();
}

/**
 * Get the current user or redirect to login
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

/**
 * Require specific role or higher
 */
export async function requireRole(minRole: UserRole) {
  const session = await requireAuth();

  const roleHierarchy: Record<UserRole, number> = {
    PLAYER: 1,
    MUD_ADMIN: 2,
    SITE_ADMIN: 3,
  };

  const userRoleLevel = roleHierarchy[session.user.role as UserRole] || 0;
  const requiredRoleLevel = roleHierarchy[minRole];

  if (userRoleLevel < requiredRoleLevel) {
    redirect("/");
  }

  return session;
}

/**
 * Check if user is site admin
 */
export async function requireSiteAdmin() {
  return requireRole("SITE_ADMIN");
}

/**
 * Check if user is MUD admin or higher
 */
export async function requireMudAdmin() {
  return requireRole("MUD_ADMIN");
}
