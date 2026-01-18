"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "crypto";
import { Genre, VerificationMethod } from "@prisma/client";

const updateMudSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(10000).optional(),
  shortDescription: z.string().max(500).optional(),
  connectionHost: z.string().max(255).optional(),
  connectionPort: z.number().min(1).max(65535).optional(),
  webClientUrl: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  discordUrl: z.string().url().optional().or(z.literal("")),
  wikiUrl: z.string().url().optional().or(z.literal("")),
  codebase: z.string().max(200).optional(),
  language: z.string().max(50).optional(),
  genres: z.array(z.nativeEnum(Genre)).max(5),
});

export async function initiateClaim(mudId: string, method: VerificationMethod) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Must be logged in" };
  }

  const mud = await prisma.mud.findUnique({
    where: { id: mudId, isDeleted: false },
  });

  if (!mud) {
    return { error: "MUD not found" };
  }

  // Check if already claimed
  const existingClaim = await prisma.mudAdmin.findFirst({
    where: { mudId, userId: session.user.id },
  });

  if (existingClaim) {
    return { error: "You have already initiated a claim for this MUD" };
  }

  // Check if MUD already has a verified owner
  const existingOwner = await prisma.mudAdmin.findFirst({
    where: { mudId, isOwner: true, isVerified: true },
  });

  if (existingOwner) {
    return { error: "This MUD already has a verified owner" };
  }

  // Generate verification code
  const verificationCode = crypto.randomBytes(16).toString("hex");

  const claim = await prisma.mudAdmin.create({
    data: {
      mudId,
      userId: session.user.id,
      isOwner: true,
      verificationCode,
      verificationMethod: method,
    },
  });

  // Return instructions based on method
  let instructions = "";
  switch (method) {
    case "MSSP":
      instructions = `Add the following to your MSSP response: MUDLISTINGS_VERIFY=${verificationCode}`;
      break;
    case "WEBSITE_META_TAG":
      instructions = `Add this meta tag to your website: <meta name="mudlistings-verify" content="${verificationCode}">`;
      break;
    case "MANUAL_APPROVAL":
      instructions = "Your claim will be reviewed by a site administrator.";
      break;
  }

  revalidatePath(`/muds/${mud.slug}`);
  return { success: true, claimId: claim.id, verificationCode, instructions };
}

export async function verifyClaim(claimId: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Must be logged in" };
  }

  const claim = await prisma.mudAdmin.findUnique({
    where: { id: claimId },
    include: { mud: true },
  });

  if (!claim) {
    return { error: "Claim not found" };
  }

  if (claim.userId !== session.user.id) {
    return { error: "This is not your claim" };
  }

  if (claim.isVerified) {
    return { error: "Claim is already verified" };
  }

  // TODO: Actually verify based on method (MSSP check, website meta tag check)
  // For now, auto-verify

  await prisma.$transaction([
    prisma.mudAdmin.update({
      where: { id: claimId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { role: "MUD_ADMIN" },
    }),
    prisma.activityEvent.create({
      data: {
        type: "MUD_CLAIMED",
        userId: session.user.id,
        mudId: claim.mudId,
        description: `${session.user.displayName} claimed ownership of ${claim.mud.name}`,
      },
    }),
  ]);

  revalidatePath(`/muds/${claim.mud.slug}`);
  revalidatePath("/manage");
  return { success: true };
}

export async function updateMud(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Must be logged in" };
  }

  const mudId = formData.get("mudId") as string;
  if (!mudId) {
    return { error: "MUD ID is required" };
  }

  // Parse genres from form data
  const genresRaw = formData.get("genres") as string;
  const genres = genresRaw ? (JSON.parse(genresRaw) as Genre[]) : [];

  const parsed = updateMudSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    shortDescription: formData.get("shortDescription") || undefined,
    connectionHost: formData.get("connectionHost") || undefined,
    connectionPort: formData.get("connectionPort")
      ? Number(formData.get("connectionPort"))
      : undefined,
    webClientUrl: formData.get("webClientUrl") || undefined,
    website: formData.get("website") || undefined,
    discordUrl: formData.get("discordUrl") || undefined,
    wikiUrl: formData.get("wikiUrl") || undefined,
    codebase: formData.get("codebase") || undefined,
    language: formData.get("language") || undefined,
    genres,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  // Check if user is admin of this MUD
  const isAdmin = await checkMudAdmin(session.user.id, mudId);
  if (!isAdmin) {
    return { error: "You are not an admin of this MUD" };
  }

  const mud = await prisma.mud.findUnique({
    where: { id: mudId },
  });

  if (!mud) {
    return { error: "MUD not found" };
  }

  // Generate new slug if name changed
  let slug = mud.slug;
  if (parsed.data.name !== mud.name) {
    slug = generateSlug(parsed.data.name);
    // Ensure unique
    const existing = await prisma.mud.findFirst({
      where: { slug, id: { not: mudId } },
    });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }
  }

  // Update MUD
  await prisma.$transaction([
    prisma.mud.update({
      where: { id: mudId },
      data: {
        name: parsed.data.name,
        slug,
        description: parsed.data.description || null,
        shortDescription: parsed.data.shortDescription || null,
        connectionHost: parsed.data.connectionHost || null,
        connectionPort: parsed.data.connectionPort || null,
        webClientUrl: parsed.data.webClientUrl || null,
        website: parsed.data.website || null,
        discordUrl: parsed.data.discordUrl || null,
        wikiUrl: parsed.data.wikiUrl || null,
        codebase: parsed.data.codebase || null,
        language: parsed.data.language || null,
      },
    }),
    // Update genres
    prisma.mudGenre.deleteMany({ where: { mudId } }),
    ...parsed.data.genres.map((genre) =>
      prisma.mudGenre.create({ data: { mudId, genre } })
    ),
  ]);

  revalidatePath(`/muds/${slug}`);
  revalidatePath("/manage");
  return { success: true, slug };
}

export async function inviteAdmin(mudId: string, email: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Must be logged in" };
  }

  // Check if user is owner of this MUD
  const isOwner = await checkMudOwner(session.user.id, mudId);
  if (!isOwner) {
    return { error: "Only MUD owners can invite admins" };
  }

  // Find user by email
  const invitee = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!invitee) {
    return { error: "No user found with that email" };
  }

  // Check if already admin
  const existing = await prisma.mudAdmin.findFirst({
    where: { mudId, userId: invitee.id },
  });

  if (existing) {
    return { error: "This user is already an admin" };
  }

  await prisma.mudAdmin.create({
    data: {
      mudId,
      userId: invitee.id,
      isOwner: false,
      isVerified: true,
      verifiedAt: new Date(),
      invitedAt: new Date(),
      invitedByUserId: session.user.id,
    },
  });

  // Update invitee role if needed
  if (invitee.role === "PLAYER") {
    await prisma.user.update({
      where: { id: invitee.id },
      data: { role: "MUD_ADMIN" },
    });
  }

  revalidatePath("/manage");
  return { success: true };
}

export async function removeAdmin(mudId: string, adminId: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Must be logged in" };
  }

  // Check if user is owner of this MUD
  const isOwner = await checkMudOwner(session.user.id, mudId);
  if (!isOwner) {
    return { error: "Only MUD owners can remove admins" };
  }

  const admin = await prisma.mudAdmin.findUnique({
    where: { id: adminId },
  });

  if (!admin || admin.mudId !== mudId) {
    return { error: "Admin not found" };
  }

  if (admin.isOwner) {
    return { error: "Cannot remove the owner" };
  }

  await prisma.mudAdmin.delete({
    where: { id: adminId },
  });

  revalidatePath("/manage");
  return { success: true };
}

export async function transferOwnership(mudId: string, newOwnerId: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Must be logged in" };
  }

  // Check if user is owner of this MUD
  const currentOwner = await prisma.mudAdmin.findFirst({
    where: { mudId, userId: session.user.id, isOwner: true, isVerified: true },
  });

  if (!currentOwner) {
    return { error: "Only the current owner can transfer ownership" };
  }

  // Check new owner is an admin
  const newOwner = await prisma.mudAdmin.findFirst({
    where: { mudId, userId: newOwnerId, isVerified: true },
  });

  if (!newOwner) {
    return { error: "New owner must be a verified admin first" };
  }

  await prisma.$transaction([
    prisma.mudAdmin.update({
      where: { id: currentOwner.id },
      data: { isOwner: false },
    }),
    prisma.mudAdmin.update({
      where: { id: newOwner.id },
      data: { isOwner: true },
    }),
  ]);

  revalidatePath("/manage");
  return { success: true };
}

// Helper functions
async function checkMudAdmin(userId: string, mudId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role === "SITE_ADMIN") return true;

  const admin = await prisma.mudAdmin.findFirst({
    where: { mudId, userId, isVerified: true },
  });
  return !!admin;
}

async function checkMudOwner(userId: string, mudId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role === "SITE_ADMIN") return true;

  const admin = await prisma.mudAdmin.findFirst({
    where: { mudId, userId, isOwner: true, isVerified: true },
  });
  return !!admin;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
