"use client";

import { useState } from "react";
import { featureMud, unfeatureMud, updateFeaturedOrder } from "@/actions/admin.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { GripVertical, Plus, X, ArrowUp, ArrowDown } from "lucide-react";
import { StatusIndicator } from "@/components/mud/status-indicator";
import type { Mud, MudGenre } from "@prisma/client";

type FeaturedMud = Mud & { genres: MudGenre[] };
type SimpleMud = { id: string; name: string; slug: string };

interface FeaturedManagerProps {
  featuredMuds: FeaturedMud[];
  allMuds: SimpleMud[];
}

export function FeaturedManager({
  featuredMuds: initialFeatured,
  allMuds,
}: FeaturedManagerProps) {
  const [featured, setFeatured] = useState(initialFeatured);
  const [selectedMud, setSelectedMud] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  async function handleAdd() {
    if (!selectedMud) return;

    setIsAdding(true);
    const result = await featureMud(selectedMud);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "MUD featured",
        description: "The MUD has been added to featured",
      });
      setSelectedMud("");
      // Reload page to get updated data
      window.location.reload();
    }
    setIsAdding(false);
  }

  async function handleRemove(mudId: string) {
    const result = await unfeatureMud(mudId);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      setFeatured((prev) => prev.filter((m) => m.id !== mudId));
      toast({
        title: "MUD unfeatured",
        description: "The MUD has been removed from featured",
      });
    }
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= featured.length) return;

    const newFeatured = [...featured];
    [newFeatured[index], newFeatured[newIndex]] = [
      newFeatured[newIndex],
      newFeatured[index],
    ];
    setFeatured(newFeatured);

    const result = await updateFeaturedOrder(newFeatured.map((m) => m.id));

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
      // Revert
      setFeatured(featured);
    }
  }

  const availableMuds = allMuds.filter(
    (m) => !featured.some((f) => f.id === m.id)
  );

  return (
    <div className="space-y-6">
      {/* Add new featured */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={selectedMud} onValueChange={setSelectedMud}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a MUD to feature..." />
              </SelectTrigger>
              <SelectContent>
                {availableMuds.map((mud) => (
                  <SelectItem key={mud.id} value={mud.id}>
                    {mud.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAdd} disabled={!selectedMud || isAdding}>
              <Plus className="h-4 w-4 mr-2" />
              Add to Featured
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Featured list */}
      {featured.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No featured MUDs yet. Add some using the selector above.
        </div>
      ) : (
        <div className="space-y-2">
          {featured.map((mud, index) => (
            <Card key={mud.id}>
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">{mud.name}</div>
                    <div className="text-sm text-muted-foreground">
                      <StatusIndicator isOnline={mud.isOnline} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMove(index, "down")}
                      disabled={index === featured.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(mud.id)}
                      className="text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
