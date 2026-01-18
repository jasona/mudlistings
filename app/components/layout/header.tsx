"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logout } from "@/actions/auth.actions";
import { Search, User, Settings, Heart, LogOut, Shield, Menu, Gamepad2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/muds?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
            <Gamepad2 className="h-5 w-5 text-primary" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-lg">MUDListings</span>
            <span className="hidden lg:block text-xs text-muted-foreground">Your MUD Community Hub</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/muds">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Browse
            </Button>
          </Link>
          <Link href="/trending">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Reviews
            </Button>
          </Link>
          <Link href="/genres">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Resources
            </Button>
          </Link>
          <Link href="/manage">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Staffing
            </Button>
          </Link>
        </nav>

        {/* Right side - Search and Auth */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search MUDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-64 pl-9 h-9 bg-card border-white/10 focus:border-primary"
              />
            </div>
          </form>

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={session.user.image || undefined}
                      alt={session.user.displayName}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {session.user.displayName?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{session.user.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/favorites" className="cursor-pointer">
                    <Heart className="mr-2 h-4 w-4" />
                    Favorites
                  </Link>
                </DropdownMenuItem>
                {(session.user.role === "MUD_ADMIN" ||
                  session.user.role === "SITE_ADMIN") && (
                  <DropdownMenuItem asChild>
                    <Link href="/manage" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Manage MUDs
                    </Link>
                  </DropdownMenuItem>
                )}
                {session.user.role === "SITE_ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Login
              </Button>
            </Link>
          )}

          {/* Mobile menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/muds">Browse</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/trending">Reviews</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/genres">Resources</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/manage">Staffing</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
