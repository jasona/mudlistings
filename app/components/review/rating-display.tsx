import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingDisplayProps {
  rating: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

export function RatingDisplay({
  rating,
  count,
  size = "md",
  showCount = true,
}: RatingDisplayProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className="flex items-center gap-1">
      <Star
        className={cn(
          sizeClasses[size],
          "fill-yellow-500 text-yellow-500"
        )}
      />
      <span className={cn(textClasses[size], "font-medium")}>
        {rating.toFixed(1)}
      </span>
      {showCount && count !== undefined && (
        <span className={cn(textClasses[size], "text-muted-foreground")}>
          ({count})
        </span>
      )}
    </div>
  );
}

interface StarRatingInputProps {
  name: string;
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

export function StarRatingInput({
  name,
  value = 0,
  onChange,
  disabled,
}: StarRatingInputProps) {
  return (
    <div className="flex items-center gap-1">
      <input type="hidden" name={name} value={value} />
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange?.(star)}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded disabled:cursor-not-allowed"
        >
          <Star
            className={cn(
              "h-6 w-6 transition-colors",
              star <= value
                ? "fill-yellow-500 text-yellow-500"
                : "text-muted-foreground hover:text-yellow-500"
            )}
          />
        </button>
      ))}
    </div>
  );
}
