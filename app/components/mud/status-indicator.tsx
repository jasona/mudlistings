import { cn } from "@/lib/utils";
import { Wifi, WifiOff } from "lucide-react";

interface StatusIndicatorProps {
  isOnline: boolean;
  showLabel?: boolean;
  className?: string;
}

export function StatusIndicator({
  isOnline,
  showLabel = true,
  className,
}: StatusIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "relative flex h-2.5 w-2.5",
          isOnline && "animate-pulse"
        )}
      >
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-75",
            isOnline ? "bg-green-500" : "bg-muted-foreground"
          )}
        />
        <span
          className={cn(
            "relative inline-flex rounded-full h-2.5 w-2.5",
            isOnline ? "bg-green-500" : "bg-muted-foreground"
          )}
        />
      </span>
      {showLabel && (
        <span
          className={cn(
            "text-sm",
            isOnline ? "text-green-500" : "text-muted-foreground"
          )}
        >
          {isOnline ? "Online" : "Offline"}
        </span>
      )}
    </div>
  );
}

export function StatusIndicatorWithIcon({
  isOnline,
  className,
}: {
  isOnline: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        isOnline ? "text-green-500" : "text-muted-foreground",
        className
      )}
    >
      {isOnline ? (
        <Wifi className="h-4 w-4" />
      ) : (
        <WifiOff className="h-4 w-4" />
      )}
      <span className="text-sm">{isOnline ? "Online" : "Offline"}</span>
    </div>
  );
}
