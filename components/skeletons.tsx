import { cn } from "@/lib/utils";

/** Pulsing block used to build page skeletons. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-stage",
        className,
      )}
    />
  );
}

/** Poster-shaped placeholders in a grid (search, genres, favorites). */
export function MovieGridSkeleton({
  count = 12,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5 md:grid-cols-5 lg:grid-cols-6",
        className ?? "mt-10",
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <Skeleton className="aspect-2/3 w-full" />
          <Skeleton className="mt-2.5 h-3 w-3/4" />
        </li>
      ))}
    </ul>
  );
}

/** One horizontal row of posters (home category strips). */
export function MovieRowSkeleton() {
  return (
    <div className="px-6 sm:px-8 lg:px-10">
      <Skeleton className="h-10 w-56 rounded-sm sm:h-12 sm:w-72" />
      <ul className="mt-6 flex gap-4 overflow-hidden sm:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <li key={i} className="shrink-0 basis-34 sm:basis-39 md:basis-44">
            <Skeleton className="aspect-2/3 w-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}
