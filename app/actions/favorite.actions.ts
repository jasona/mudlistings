"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(mudId: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Must be logged in to favorite" };
  }

  const mud = await prisma.mud.findUnique({
    where: { id: mudId, isDeleted: false },
  });

  if (!mud) {
    return { error: "MUD not found" };
  }

  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      userId_mudId: { userId: session.user.id, mudId },
    },
  });

  if (existingFavorite) {
    // Remove favorite
    await prisma.$transaction([
      prisma.favorite.delete({
        where: { userId_mudId: { userId: session.user.id, mudId } },
      }),
      prisma.mud.update({
        where: { id: mudId },
        data: { favoriteCount: { decrement: 1 } },
      }),
    ]);

    revalidatePath(`/muds/${mud.slug}`);
    revalidatePath("/favorites");
    return { success: true, isFavorited: false };
  } else {
    // Add favorite
    await prisma.$transaction([
      prisma.favorite.create({
        data: { userId: session.user.id, mudId },
      }),
      prisma.mud.update({
        where: { id: mudId },
        data: { favoriteCount: { increment: 1 } },
      }),
    ]);

    revalidatePath(`/muds/${mud.slug}`);
    revalidatePath("/favorites");
    return { success: true, isFavorited: true };
  }
}
