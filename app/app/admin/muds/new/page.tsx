"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { createMud } from "@/actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Genre } from "@prisma/client";
import { Plus } from "lucide-react";

const ALL_GENRES = Object.values(Genre);

export default function NewMudPage() {
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("genres", JSON.stringify(selectedGenres));

    const result = await createMud(formData);

    if (result.error) {
      setError(result.error);
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.slug) {
      toast({
        title: "MUD created",
        description: "The MUD has been added successfully",
      });
      router.push(`/muds/${result.slug}`);
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
    <div className="container py-8 max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Plus className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Add New MUD</h1>
        </div>
        <p className="text-muted-foreground">
          Create a new MUD listing
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>MUD Details</CardTitle>
          <CardDescription>
            Enter the information for the new MUD
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                required
                minLength={2}
                maxLength={200}
                placeholder="MUD Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                name="shortDescription"
                maxLength={500}
                placeholder="A brief tagline for the MUD"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={6}
                maxLength={10000}
                placeholder="Full description of the MUD..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="connectionHost">Connection Host</Label>
                <Input
                  id="connectionHost"
                  name="connectionHost"
                  placeholder="mud.example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="connectionPort">Connection Port</Label>
                <Input
                  id="connectionPort"
                  name="connectionPort"
                  type="number"
                  min={1}
                  max={65535}
                  placeholder="4000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                placeholder="https://example.com"
              />
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
                        !selectedGenres.includes(genre) &&
                        selectedGenres.length >= 5
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
        </CardContent>
      </Card>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Creating..." : "Create MUD"}
    </Button>
  );
}
