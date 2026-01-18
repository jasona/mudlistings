"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { updateMud } from "@/actions/mud-admin.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Genre } from "@prisma/client";
import type { Mud, MudGenre } from "@prisma/client";

type MudWithGenres = Mud & { genres: MudGenre[] };

interface MudEditFormProps {
  mud: MudWithGenres;
}

const ALL_GENRES = Object.values(Genre);

export function MudEditForm({ mud }: MudEditFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>(
    mud.genres.map((g) => g.genre)
  );
  const { toast } = useToast();

  async function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("mudId", mud.id);
    formData.set("genres", JSON.stringify(selectedGenres));

    const result = await updateMud(formData);

    if (result?.error) {
      setError(result.error);
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "MUD updated",
        description: "Your changes have been saved",
      });
    }
  }

  function toggleGenre(genre: Genre) {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : prev.length < 5
          ? [...prev, genre]
          : prev
    );
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={mud.name}
            required
            minLength={2}
            maxLength={200}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            type="url"
            defaultValue={mud.website || ""}
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortDescription">Short Description</Label>
        <Input
          id="shortDescription"
          name="shortDescription"
          defaultValue={mud.shortDescription || ""}
          maxLength={500}
          placeholder="A brief tagline for your MUD"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={mud.description || ""}
          rows={6}
          maxLength={10000}
          placeholder="Full description of your MUD..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="connectionHost">Connection Host</Label>
          <Input
            id="connectionHost"
            name="connectionHost"
            defaultValue={mud.connectionHost || ""}
            placeholder="mud.example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="connectionPort">Connection Port</Label>
          <Input
            id="connectionPort"
            name="connectionPort"
            type="number"
            defaultValue={mud.connectionPort || ""}
            min={1}
            max={65535}
            placeholder="4000"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="webClientUrl">Web Client URL</Label>
          <Input
            id="webClientUrl"
            name="webClientUrl"
            type="url"
            defaultValue={mud.webClientUrl || ""}
            placeholder="https://play.example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="discordUrl">Discord URL</Label>
          <Input
            id="discordUrl"
            name="discordUrl"
            type="url"
            defaultValue={mud.discordUrl || ""}
            placeholder="https://discord.gg/..."
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="codebase">Codebase</Label>
          <Input
            id="codebase"
            name="codebase"
            defaultValue={mud.codebase || ""}
            placeholder="e.g., CircleMUD, DIKU, Custom"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Primary Language</Label>
          <Input
            id="language"
            name="language"
            defaultValue={mud.language || ""}
            placeholder="e.g., English"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Genres (max 5)</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ALL_GENRES.map((genre) => (
            <div key={genre} className="flex items-center space-x-2">
              <Checkbox
                id={`genre-${genre}`}
                checked={selectedGenres.includes(genre)}
                onCheckedChange={() => toggleGenre(genre)}
                disabled={
                  !selectedGenres.includes(genre) && selectedGenres.length >= 5
                }
              />
              <label
                htmlFor={`genre-${genre}`}
                className="text-sm cursor-pointer"
              >
                {genre.replace("_", " ")}
              </label>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save changes"}
    </Button>
  );
}
