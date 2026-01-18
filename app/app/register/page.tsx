import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad2, Check } from "lucide-react";

export const metadata = {
  title: "Sign Up - MudListings",
  description: "Create a MudListings account",
};

const benefits = [
  "Save your favorite MUDs",
  "Write reviews and ratings",
  "Participate in community discussions",
  "Get personalized recommendations",
];

export default async function RegisterPage() {
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
        <div className="flex flex-col items-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20 mb-3">
            <Gamepad2 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold">MUDListings</h1>
          <p className="text-sm text-muted-foreground">Your MUD Community Hub</p>
        </div>

        {/* Welcome text */}
        <p className="text-center text-muted-foreground mb-6">
          Join the community and start your adventure
        </p>

        {/* Card */}
        <Card className="bg-card border-white/10">
          <CardContent className="pt-6">
            <RegisterForm />

            {/* Benefits */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-sm font-medium mb-3">What you&apos;ll get:</p>
              <ul className="space-y-2">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-success shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Sign in link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
            Sign in
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
