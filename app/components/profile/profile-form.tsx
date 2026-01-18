"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfile } from "@/actions/user.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@prisma/client";

interface ProfileFormProps {
  user: Pick<User, "displayName" | "bio" | "avatarUrl">;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await updateProfile(formData);

    if (result?.error) {
      setError(result.error);
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={user.displayName}
          required
          minLength={2}
          maxLength={50}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Avatar URL</Label>
        <Input
          id="avatarUrl"
          name="avatarUrl"
          type="url"
          defaultValue={user.avatarUrl || ""}
          placeholder="https://example.com/avatar.jpg"
        />
        <p className="text-xs text-muted-foreground">
          Enter a URL to an image for your avatar
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={user.bio || ""}
          rows={4}
          maxLength={500}
          placeholder="Tell us about yourself..."
        />
        <p className="text-xs text-muted-foreground">
          Maximum 500 characters
        </p>
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
