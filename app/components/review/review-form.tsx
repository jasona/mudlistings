"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createReview } from "@/actions/review.actions";
import { StarRatingInput } from "./rating-display";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ReviewFormProps {
  mudId: string;
  mudSlug: string;
}

export function ReviewForm({ mudId, mudSlug }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleSubmit(formData: FormData) {
    setError(null);

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    formData.set("rating", rating.toString());
    const result = await createReview(formData);

    if (result.error) {
      setError(result.error);
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
      });
      setRating(0);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="mudId" value={mudId} />

      <div className="space-y-2">
        <Label>Rating</Label>
        <StarRatingInput name="rating" value={rating} onChange={setRating} />
        {error && rating === 0 && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title (optional)</Label>
        <Input
          id="title"
          name="title"
          placeholder="Sum up your experience"
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Review</Label>
        <Textarea
          id="body"
          name="body"
          placeholder="Share your experience with this MUD..."
          rows={4}
          required
          minLength={10}
          maxLength={10000}
        />
      </div>

      {error && rating > 0 && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Submitting..." : "Submit Review"}
    </Button>
  );
}
