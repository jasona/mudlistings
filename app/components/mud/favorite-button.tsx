"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFavorite } from "@/actions/favorite.actions";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface FavoriteButtonProps {
  mudId: string;
  isFavorited: boolean;
  isLoggedIn: boolean;
  className?: string;
}

export function FavoriteButton({
  mudId,
  isFavorited: initialFavorited,
  isLoggedIn,
  className,
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  function handleClick() {
    if (!isLoggedIn) {
      toast({
        title: "Login required",
        description: "You must be logged in to save favorites",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    // Optimistic update
    setIsFavorited(!isFavorited);

    startTransition(async () => {
      const result = await toggleFavorite(mudId);
      if (result.error) {
        // Revert on error
        setIsFavorited(isFavorited);
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      disabled={isPending}
      className={cn(className)}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          isFavorited && "fill-red-500 text-red-500"
        )}
      />
    </Button>
  );
}
