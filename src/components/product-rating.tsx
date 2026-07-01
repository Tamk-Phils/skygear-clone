import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductRating({
  rating = 5,
  className,
  compact,
}: {
  rating?: number;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            compact ? "size-3" : "size-3.5",
            i < Math.round(rating) ? "fill-primary text-primary" : "text-muted-foreground/30",
          )}
        />
      ))}
      {!compact && (
        <span className="ml-1 text-xs text-muted-foreground">
          Rated <span className="font-semibold text-foreground">{rating.toFixed(2)}</span> out of 5
        </span>
      )}
    </div>
  );
}

export function salePercent(price: number, compareAt: number | null) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round((1 - price / compareAt) * 100);
}
