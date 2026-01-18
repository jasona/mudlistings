"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

export function UserFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";

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
      params.delete("page");
      router.push(`/admin/users?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          defaultValue={search}
          onChange={(e) => updateParams({ search: e.target.value || null })}
          className="pl-9"
        />
      </div>
      <Select
        value={role}
        onValueChange={(value) => updateParams({ role: value || null })}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All roles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All roles</SelectItem>
          <SelectItem value="PLAYER">Player</SelectItem>
          <SelectItem value="MUD_ADMIN">MUD Admin</SelectItem>
          <SelectItem value="SITE_ADMIN">Site Admin</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
