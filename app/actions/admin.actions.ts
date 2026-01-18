"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Genre, ReportStatus, UserRole } from "@prisma/client";

async function requireSiteAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SITE_ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

// Moderation actions
export async function moderateReport(
  reportId: string,
  action: "APPROVED" | "REJECTED" | "REVIEW_HIDDEN" | "REVIEW_DELETED",
  resolution?: string
) {
  const session = await requireSiteAdmin();

  const report = await prisma.reviewReport.findUnique({
    where: { id: reportId },
    include: { review: { include: { mud: true } } },
  });

  if (!report) {
    return { error: "Report not found" };
  }

  const updateData: {
    status: ReportStatus;
    resolvedAt: Date;
    resolvedByUserId: string;
    resolution?: string;
  } = {
    status: action,
    resolvedAt: new Date(),
    resolvedByUserId: session.user.id,
    resolution,
  };

  // Handle review actions
  if (action === "REVIEW_HIDDEN") {
    await prisma.review.update({
      where: { id: report.reviewId },
      data: { isHidden: true },
    });
  } else if (action === "REVIEW_DELETED") {
    await prisma.review.update({
      where: { id: report.reviewId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }

  await prisma.reviewReport.update({
    where: { id: reportId },
    data: updateData,
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      action: `MODERATE_REVIEW_${action}`,
      userId: session.user.id,
      targetType: "ReviewReport",
      targetId: reportId,
      details: { resolution },
    },
  });

  revalidatePath("/admin/moderation");
  return { success: true };
}

// User management
export async function changeUserRole(userId: string, role: UserRole) {
  const session = await requireSiteAdmin();

  // Can't change own role
  if (userId === session.user.id) {
    return { error: "Cannot change your own role" };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { error: "User not found" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      action: "CHANGE_USER_ROLE",
      userId: session.user.id,
      targetType: "User",
      targetId: userId,
      details: { oldRole: user.role, newRole: role },
    },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

// Featured management
export async function featureMud(mudId: string) {
  await requireSiteAdmin();

  const mud = await prisma.mud.findUnique({ where: { id: mudId } });
  if (!mud) {
    return { error: "MUD not found" };
  }

  // Get next order
  const lastFeatured = await prisma.mud.findFirst({
    where: { isFeatured: true },
    orderBy: { featuredOrder: "desc" },
  });

  const nextOrder = (lastFeatured?.featuredOrder || 0) + 1;

  await prisma.mud.update({
    where: { id: mudId },
    data: {
      isFeatured: true,
      featuredOrder: nextOrder,
      featuredAt: new Date(),
    },
  });

  // Create activity event
  await prisma.activityEvent.create({
    data: {
      type: "FEATURED",
      mudId,
      description: `${mud.name} is now featured`,
    },
  });

  revalidatePath("/admin/featured");
  revalidatePath("/");
  return { success: true };
}

export async function unfeatureMud(mudId: string) {
  await requireSiteAdmin();

  await prisma.mud.update({
    where: { id: mudId },
    data: {
      isFeatured: false,
      featuredOrder: null,
      featuredAt: null,
    },
  });

  revalidatePath("/admin/featured");
  revalidatePath("/");
  return { success: true };
}

export async function updateFeaturedOrder(orderedIds: string[]) {
  await requireSiteAdmin();

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.mud.update({
        where: { id },
        data: { featuredOrder: index + 1 },
      })
    )
  );

  revalidatePath("/admin/featured");
  revalidatePath("/");
  return { success: true };
}

// MUD creation (admin only)
const createMudSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(10000).optional(),
  shortDescription: z.string().max(500).optional(),
  connectionHost: z.string().max(255).optional(),
  connectionPort: z.number().min(1).max(65535).optional(),
  website: z.string().url().optional().or(z.literal("")),
  genres: z.array(z.nativeEnum(Genre)).max(5),
});

export async function createMud(formData: FormData) {
  const session = await requireSiteAdmin();

  const genresRaw = formData.get("genres") as string;
  const genres = genresRaw ? (JSON.parse(genresRaw) as Genre[]) : [];

  const parsed = createMudSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    shortDescription: formData.get("shortDescription") || undefined,
    connectionHost: formData.get("connectionHost") || undefined,
    connectionPort: formData.get("connectionPort")
      ? Number(formData.get("connectionPort"))
      : undefined,
    website: formData.get("website") || undefined,
    genres,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  // Generate slug
  let slug = generateSlug(parsed.data.name);
  const existing = await prisma.mud.findFirst({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  const mud = await prisma.mud.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
      shortDescription: parsed.data.shortDescription || null,
      connectionHost: parsed.data.connectionHost || null,
      connectionPort: parsed.data.connectionPort || null,
      website: parsed.data.website || null,
      genres: {
        create: genres.map((genre) => ({ genre })),
      },
    },
  });

  // Create activity event
  await prisma.activityEvent.create({
    data: {
      type: "MUD_CREATED",
      mudId: mud.id,
      description: `${mud.name} was added to MudListings`,
    },
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      action: "CREATE_MUD",
      userId: session.user.id,
      targetType: "Mud",
      targetId: mud.id,
    },
  });

  revalidatePath("/muds");
  return { success: true, mudId: mud.id, slug: mud.slug };
}

// Bulk import
export async function importMuds(
  muds: Array<{
    name: string;
    host?: string;
    port?: number;
    website?: string;
    description?: string;
    genres?: Genre[];
  }>
) {
  const session = await requireSiteAdmin();

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const mudData of muds) {
    try {
      let slug = generateSlug(mudData.name);
      const existing = await prisma.mud.findFirst({ where: { slug } });
      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }

      await prisma.mud.create({
        data: {
          name: mudData.name,
          slug,
          connectionHost: mudData.host || null,
          connectionPort: mudData.port || null,
          website: mudData.website || null,
          description: mudData.description || null,
          genres: mudData.genres
            ? { create: mudData.genres.map((genre) => ({ genre })) }
            : undefined,
        },
      });

      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push(`Failed to import ${mudData.name}: ${error}`);
    }
  }

  // Log audit
  await prisma.auditLog.create({
    data: {
      action: "BULK_IMPORT_MUDS",
      userId: session.user.id,
      details: { success: results.success, failed: results.failed },
    },
  });

  revalidatePath("/muds");
  return results;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
