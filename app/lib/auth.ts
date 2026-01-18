import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        // Check if account is locked
        if (user.lockoutEnd && user.lockoutEnd > new Date()) {
          throw new Error("Account is locked. Please try again later.");
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
          // Increment failed attempts
          const failedCount = user.accessFailedCount + 1;
          const lockoutEnd = failedCount >= 5
            ? new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
            : null;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              accessFailedCount: failedCount,
              lockoutEnd,
            },
          });

          return null;
        }

        // Reset failed attempts on successful login
        await prisma.user.update({
          where: { id: user.id },
          data: {
            accessFailedCount: 0,
            lockoutEnd: null,
            lastLoginAt: new Date(),
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          image: user.avatarUrl,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Initial sign in
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { id: true, role: true, displayName: true },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.displayName = dbUser.displayName;
        }
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token.displayName = session.displayName;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.displayName = token.displayName as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      // For OAuth providers, create user if doesn't exist
      if (account?.provider !== "credentials" && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              displayName: user.name || user.email.split("@")[0],
              avatarUrl: user.image,
              emailVerified: new Date(),
            },
          });
        }
      }
      return true;
    },
  },
  events: {
    async linkAccount({ user }) {
      // Update emailVerified when OAuth account is linked
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
});

// Type augmentation for session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      displayName: string;
    };
  }
}
