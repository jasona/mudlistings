"use server";

import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(formData: FormData) {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { email, password, displayName } = parsed.data;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return { error: "An account with this email already exists" };
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user
  await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      displayName,
    },
  });

  // Sign in the user
  await signIn("credentials", {
    email: email.toLowerCase(),
    password,
    redirectTo: "/",
  });
}

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Invalid email or password" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("locked")) {
      return { error: "Account is locked. Please try again later." };
    }
    return { error: "Invalid email or password" };
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/" });
}

export async function loginWithDiscord() {
  await signIn("discord", { redirectTo: "/" });
}

export async function forgotPassword(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  // Always return success to prevent email enumeration
  if (!user) {
    return { success: true };
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Store token (using refreshToken table for simplicity)
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: resetToken,
      expiresAt: resetTokenExpiry,
    },
  });

  // TODO: Send email with reset link
  console.log(`Password reset link: /reset-password/${resetToken}`);

  return { success: true };
}

export async function resetPassword(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;

  if (!token || !password) {
    return { error: "Invalid request" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  // Find token
  const resetToken = await prisma.refreshToken.findFirst({
    where: {
      token,
      expiresAt: { gt: new Date() },
      isRevoked: false,
    },
    include: { user: true },
  });

  if (!resetToken) {
    return { error: "Invalid or expired reset link" };
  }

  // Update password
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash },
  });

  // Revoke token
  await prisma.refreshToken.update({
    where: { id: resetToken.id },
    data: { isRevoked: true, revokedAt: new Date() },
  });

  redirect("/login?message=Password reset successfully");
}

export async function changePassword(formData: FormData) {
  const { auth } = await import("@/lib/auth");
  const session = await auth();

  if (!session?.user) {
    return { error: "Not authenticated" };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!currentPassword || !newPassword) {
    return { error: "All fields are required" };
  }

  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || !user.passwordHash) {
    return { error: "Cannot change password for this account" };
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!isValid) {
    return { error: "Current password is incorrect" };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  revalidatePath("/profile");
  return { success: true };
}
