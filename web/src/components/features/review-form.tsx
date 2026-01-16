import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RatingInput } from './star-rating';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  onSubmit: (data: { title?: string; body: string; rating: number }) => void;
  isSubmitting?: boolean;
  initialData?: {
    title?: string;
    body: string;
    rating: number;
  };
  className?: string;
}

export function ReviewForm({
  onSubmit,
  isSubmitting,
  initialData,
  className,
}: ReviewFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [body, setBody] = useState(initialData?.body || '');
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [errors, setErrors] = useState<{ rating?: string; body?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: { rating?: string; body?: string } = {};
    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }
    if (!body.trim()) {
      newErrors.body = 'Please write a review';
    } else if (body.trim().length < 20) {
      newErrors.body = 'Review must be at least 20 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({
      title: title.trim() || undefined,
      body: body.trim(),
      rating,
    });
  };

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-lg">
          {initialData ? 'Edit Your Review' : 'Write a Review'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div className="space-y-2">
            <Label>Your Rating</Label>
            <RatingInput value={rating} onChange={setRating} />
            {errors.rating && (
              <p className="text-sm text-destructive">{errors.rating}</p>
            )}
          </div>

          {/* Title (optional) */}
          <div className="space-y-2">
            <Label htmlFor="review-title">Title (optional)</Label>
            <Input
              id="review-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={100}
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="review-body">Your Review</Label>
            <Textarea
              id="review-body"
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                if (errors.body) setErrors({ ...errors, body: undefined });
              }}
              placeholder="Share your experience with this MUD. What did you enjoy? What could be improved?"
              rows={5}
              maxLength={2000}
            />
            <div className="flex justify-between">
              {errors.body && (
                <p className="text-sm text-destructive">{errors.body}</p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {body.length}/2000
              </p>
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting
              ? 'Submitting...'
              : initialData
                ? 'Update Review'
                : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
