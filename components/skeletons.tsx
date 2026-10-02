import { cn } from "@/lib/utils";

/** Pulsing block used to build page skeletons. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-sm bg-cream/10",
        className,
      )}
    />
  );
}

/** Poster-shaped placeholders in a grid (search, genres, favorites). */
export function MovieGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <Skeleton className="aspect-2/3 w-full" />
          <Skeleton className="mt-2 h-3 w-3/4" />
        </li>
      ))}
    </ul>
  );
}

/** One horizontal row of posters (home category strips). */
export function MovieRowSkeleton() {
  return (
    <div>
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-2 h-3 w-48" />
      <ul className="mt-6 flex gap-3 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <li key={i} className="shrink-0">
            <Skeleton className="h-44 w-28" />
          </li>
        ))}
      </ul>
    </div>
  );
}
