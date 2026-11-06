import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type RatingStarsProps = {
  /** Personal score 1–10. Null = unrated. */
  value: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  showValue?: boolean;
};

const SIZE = {
  sm: "size-3",
  md: "size-3.5",
  lg: "size-5",
} as const;

/**
 * Maps a 1–10 score onto five stars (half-star steps), Letterboxd-style.
 */
export function RatingStars({
  value,
  size = "sm",
  className,
  showValue = false,
}: RatingStarsProps) {
  if (value == null || value <= 0) {
    return (
      <span
        className={cn(
          "text-[10px] font-medium tracking-[0.14em] text-cream/35 uppercase",
          className,
        )}
      >
        Unrated
      </span>
    );
  }

  const clamped = Math.min(10, Math.max(1, value));
  const filled = clamped / 2; // 0.5 … 5

  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      aria-label={`Rated ${clamped} out of 10`}
    >
      <span className="inline-flex items-center gap-0.5" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => {
          const starValue = i + 1;
          const full = filled >= starValue;
          const half = !full && filled >= starValue - 0.5;

          return (
            <span key={starValue} className="relative inline-flex">
              <Star
                className={cn(SIZE[size], "text-cream/20")}
                strokeWidth={1.5}
              />
              {(full || half) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={half ? { width: "50%" } : undefined}
                >
                  <Star
                    className={cn(SIZE[size], "fill-amber text-amber")}
                    strokeWidth={1.5}
                  />
                </span>
              )}
            </span>
          );
        })}
      </span>
      {showValue ? (
        <span className="text-[11px] font-medium tabular-nums text-amber/90">
          {clamped}
        </span>
      ) : null}
    </span>
  );
}
