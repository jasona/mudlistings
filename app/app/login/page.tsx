import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad2 } from "lucide-react";

export const metadata = {
  title: "Log In - MudListings",
  description: "Log in to your MudListings account",
};

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center py-12 px-4">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-hero-gradient pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20 mb-3">
            <Gamepad2 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold">MUDListings</h1>
          <p className="text-sm text-muted-foreground">Your MUD Community Hub</p>
        </div>

        {/* Welcome text */}
        <p className="text-center text-muted-foreground mb-6">
          Welcome back! Sign in to your account
        </p>

        {/* Card */}
        <Card className="bg-card border-white/10">
          <CardContent className="pt-6">
            <LoginForm />
          </CardContent>
        </Card>

        {/* Sign up link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:text-primary/80 font-medium">
            Sign up for free
          </Link>
        </p>

        {/* Back to home */}
        <Link
          href="/"
          className="block text-center text-sm text-muted-foreground hover:text-foreground mt-4"
        >
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}
