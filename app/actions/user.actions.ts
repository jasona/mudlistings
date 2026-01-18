"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50),
  bio: z.string().max(2000).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

const updatePrivacySchema = z.object({
  isProfilePublic: z.boolean(),
  showFavoritesPublicly: z.boolean(),
});

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Must be logged in" };
  }

  const parsed = updateProfileSchema.safeParse({
    displayName: formData.get("displayName"),
    bio: formData.get("bio") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      displayName: parsed.data.displayName,
      bio: parsed.data.bio || null,
      avatarUrl: parsed.data.avatarUrl || null,
    },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function updatePrivacySettings(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Must be logged in" };
  }

  const isProfilePublic = formData.get("isProfilePublic") === "true";
  const showFavoritesPublicly = formData.get("showFavoritesPublicly") === "true";

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      isProfilePublic,
      showFavoritesPublicly,
    },
  });

  revalidatePath("/profile");
  return { success: true };
}
