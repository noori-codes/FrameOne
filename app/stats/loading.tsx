import { PAGE_GUTTER } from "@/lib/layout";
import { Skeleton } from "@/components/skeletons";
import { cn } from "@/lib/utils";

export default function StatsLoading() {
  return (
    <main
      className="relative flex min-h-dvh flex-1 flex-col overflow-x-hidden bg-background"
      aria-busy
      aria-label="Loading stats"
    >
      <header className="relative isolate overflow-hidden border-b border-cream/8">
        <div
          className={cn("relative w-full pt-8 pb-10 sm:pt-10 sm:pb-12", PAGE_GUTTER)}
        >
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-11 w-36 rounded-full" />
          </div>
          <Skeleton className="mt-6 h-14 w-full max-w-xl rounded-sm sm:h-20" />
          <Skeleton className="mt-4 h-4 w-full max-w-md" />
          <div className="mt-8 flex flex-wrap gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-28 rounded-2xl" />
            ))}
          </div>
        </div>
      </header>

      <div
        className={cn(
          "relative w-full flex-1 space-y-14 py-10 sm:space-y-16 sm:py-14",
          PAGE_GUTTER,
        )}
      >
        <div>
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-2 h-10 w-40" />
          <div className="mt-8 grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-12">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full rounded-xl" />
            ))}
          </div>
        </div>

        <div>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-10 w-44" />
          <Skeleton className="mt-6 h-24 w-full max-w-4xl rounded-xl" />
        </div>

        <div>
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-2 h-10 w-48" />
          <div className="mt-7 max-w-2xl space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
