"use client";

import { useState } from "react";
import { updatePrivacySettings } from "@/actions/user.actions";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@prisma/client";

interface PrivacySettingsFormProps {
  user: Pick<User, "isProfilePublic" | "showFavoritesPublicly">;
}

export function PrivacySettingsForm({ user }: PrivacySettingsFormProps) {
  const [isProfilePublic, setIsProfilePublic] = useState(user.isProfilePublic);
  const [showFavorites, setShowFavorites] = useState(user.showFavoritesPublicly);
  const { toast } = useToast();

  async function handleChange(field: string, value: boolean) {
    const formData = new FormData();
    formData.set(field, value.toString());

    const result = await updatePrivacySettings(formData);

    if (result?.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
      // Revert
      if (field === "isProfilePublic") setIsProfilePublic(!value);
      if (field === "showFavoritesPublicly") setShowFavorites(!value);
    } else {
      if (field === "isProfilePublic") setIsProfilePublic(value);
      if (field === "showFavoritesPublicly") setShowFavorites(value);
      toast({
        title: "Settings updated",
        description: "Your privacy settings have been updated",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="isProfilePublic">Public profile</Label>
          <p className="text-sm text-muted-foreground">
            Allow others to view your profile page
          </p>
        </div>
        <Switch
          id="isProfilePublic"
          checked={isProfilePublic}
          onCheckedChange={(checked) => handleChange("isProfilePublic", checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="showFavoritesPublicly">Show favorites</Label>
          <p className="text-sm text-muted-foreground">
            Display your favorite MUDs on your public profile
          </p>
        </div>
        <Switch
          id="showFavoritesPublicly"
          checked={showFavorites}
          onCheckedChange={(checked) =>
            handleChange("showFavoritesPublicly", checked)
          }
          disabled={!isProfilePublic}
        />
      </div>
    </div>
  );
}
