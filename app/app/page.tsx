import Link from "next/link";
import { getFeaturedMuds, getTrendingMuds } from "@/data/mud.data";
import { MudCard } from "@/components/mud/mud-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Swords,
  Drama,
  Axe,
  Wand2,
  Target,
  Moon,
  ArrowRight,
  Users,
  Star,
  Gamepad2
} from "lucide-react";

const genres = [
  { name: "PvP Combat", icon: Swords, count: 45, color: "text-red-400" },
  { name: "Roleplaying", icon: Drama, count: 89, color: "text-purple-400" },
  { name: "Hack & Slash", icon: Axe, count: 67, color: "text-orange-400" },
  { name: "Fantasy", icon: Wand2, count: 124, color: "text-blue-400" },
  { name: "Strategy", icon: Target, count: 38, color: "text-green-400" },
  { name: "Dark Fantasy", icon: Moon, count: 52, color: "text-indigo-400" },
];

export default async function HomePage() {
  const [featuredMuds, trendingMuds] = await Promise.all([
    getFeaturedMuds(4),
    getTrendingMuds(8),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

        <div className="container relative py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Discover Your Next{" "}
              <span className="bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                Adventure Awaits
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Explore hundreds of Multi-User Dungeons. Find your perfect text-based
              gaming experience.
            </p>

            {/* Search Bar */}
            <form action="/muds" method="GET" className="max-w-xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  name="q"
                  placeholder="Search for games, genres, or features..."
                  className="w-full h-14 pl-12 pr-32 text-base bg-card border-white/10 rounded-lg"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Gamepad2 className="h-4 w-4 text-primary" />
                <span>500+ Active MUDs</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-success" />
                <span>15k+ Players Online</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-warning" />
                <span>1,000+ Reviews</span>
              </div>
            </div>

            {/* CTA */}
            <Link href="/register" className="text-primary hover:text-primary/80 text-sm font-medium">
              Create a free account to save favorites and write reviews
              <ArrowRight className="inline-block ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by Genre */}
      <section className="container py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Browse by Genre</h2>
          <p className="text-muted-foreground">
            Find your perfect gaming experience across diverse categories
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {genres.map((genre) => (
            <Link key={genre.name} href={`/muds?genre=${encodeURIComponent(genre.name)}`}>
              <Card className="group h-full bg-card border-white/10 hover:border-primary/50 transition-all duration-200 hover:-translate-y-1">
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <div className={`mb-3 p-3 rounded-lg bg-white/5 ${genre.color}`}>
                    <genre.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium text-sm mb-1">{genre.name}</h3>
                  <p className="text-xs text-muted-foreground">{genre.count} MUDs</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured MUDs */}
      {featuredMuds.length > 0 && (
        <section className="container py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1">Featured MUDs</h2>
              <p className="text-muted-foreground">Discover the most popular and exciting games</p>
            </div>
            <Link href="/muds?featured=true">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredMuds.map((mud) => (
              <MudCard key={mud.id} mud={mud} />
            ))}
          </div>
        </section>
      )}

      {/* Trending MUDs */}
      {trendingMuds.length > 0 && (
        <section className="container py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1">Trending Now</h2>
              <p className="text-muted-foreground">See what&apos;s hot in the MUD community</p>
            </div>
            <Link href="/trending">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trendingMuds.slice(0, 4).map((mud) => (
              <MudCard key={mud.id} mud={mud} />
            ))}
          </div>
        </section>
      )}

      {/* MUD Staffing Opportunities */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-1">MUD Staffing Opportunities</h2>
            <p className="text-muted-foreground">Join a development team and help shape amazing worlds</p>
          </div>
          <Link href="/staffing">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              View All Positions
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-card border-white/10">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold mb-1">Creative Builder - Fantasy Zone</h3>
                  <p className="text-sm text-muted-foreground">Shadows of Isildur</p>
                </div>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">New</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Seeking creative builders to expand our world with new areas, quests, and NPCs.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-white/10">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold mb-1">Game Master - Events & Storylines</h3>
                  <p className="text-sm text-muted-foreground">Threshold RPG</p>
                </div>
                <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded">Urgent</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Looking for experienced GMs to run events and develop ongoing storylines.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-white/10">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold mb-1">Coder - Python/MOO Engine</h3>
                  <p className="text-sm text-muted-foreground">Armageddon MUD</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Development position for experienced coders to help maintain and expand game systems.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
