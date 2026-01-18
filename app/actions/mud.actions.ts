"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function incrementViewCount(mudId: string) {
  await prisma.mud.update({
    where: { id: mudId },
    data: { viewCount: { increment: 1 } },
  });
}

export async function recordMudView(mudId: string) {
  // Fire and forget - don't await
  incrementViewCount(mudId).catch(console.error);
}
