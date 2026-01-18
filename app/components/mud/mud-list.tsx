import { MudCard } from "./mud-card";
import type { Mud, MudGenre } from "@prisma/client";

type MudWithGenres = Mud & {
  genres: MudGenre[];
};

interface MudListProps {
  muds: MudWithGenres[];
  emptyMessage?: string;
}

export function MudList({ muds, emptyMessage = "No MUDs found." }: MudListProps) {
  if (muds.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {muds.map((mud) => (
        <MudCard key={mud.id} mud={mud} />
      ))}
    </div>
  );
}
