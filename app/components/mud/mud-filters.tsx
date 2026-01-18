"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { Genre } from "@prisma/client";

const GENRES = Object.values(Genre);

interface MudFiltersProps {
  genres?: { genre: Genre; count: number }[];
}

export function MudFilters({ genres }: MudFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") || "";
  const selectedGenre = searchParams.get("genre") || "";
  const status = searchParams.get("status") || "";
  const sort = searchParams.get("sort") || "trending";

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      // Reset to page 1 when filters change
      params.delete("page");
      router.push(`/muds?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = () => {
    router.push("/muds");
  };

  const hasActiveFilters = query || selectedGenre || status;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search MUDs..."
            defaultValue={query}
            onChange={(e) => updateParams({ q: e.target.value || null })}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedGenre}
            onValueChange={(value) => updateParams({ genre: value || null })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Genres</SelectItem>
              {(genres || GENRES.map((g) => ({ genre: g, count: 0 }))).map(
                ({ genre, count }) => (
                  <SelectItem key={genre} value={genre}>
                    {genre.replace("_", " ")} {count > 0 && `(${count})`}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(value) => updateParams({ status: value || null })}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sort}
            onValueChange={(value) => updateParams({ sort: value })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="reviews">Most Reviews</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {query && (
            <Badge variant="secondary" className="gap-1">
              Search: {query}
              <button
                onClick={() => updateParams({ q: null })}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedGenre && (
            <Badge variant="secondary" className="gap-1">
              {selectedGenre.replace("_", " ")}
              <button
                onClick={() => updateParams({ genre: null })}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {status && (
            <Badge variant="secondary" className="gap-1">
              {status}
              <button
                onClick={() => updateParams({ status: null })}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
