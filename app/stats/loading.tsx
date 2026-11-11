import { Skeleton } from "@/components/skeletons";
import { PAGE_GUTTER } from "@/lib/layout";
import { cn } from "@/lib/utils";

export default function StatsLoading() {
  return (
    <main
      className="relative flex min-h-dvh w-full flex-1 flex-col overflow-x-hidden bg-background"
      aria-busy
      aria-label="Loading stats"
    >
      <header className="relative isolate overflow-hidden border-b border-cream/8 bg-stage/40">
        <div
          className={cn(
            "relative w-full pt-8 pb-8 sm:pt-10 sm:pb-10",
            PAGE_GUTTER,
          )}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Skeleton className="h-3 w-36" />
              <Skeleton className="mt-2 h-14 w-40 sm:h-16 sm:w-52" />
              <Skeleton className="mt-4 h-4 w-full max-w-xl" />
            </div>
            <Skeleton className="h-11 w-36 rounded-full" />
          </div>
        </div>
      </header>

      <div
        className={cn(
          "relative w-full flex-1 space-y-12 py-8 sm:space-y-14 sm:py-10",
          PAGE_GUTTER,
        )}
      >
        <div>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-10 w-56" />
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className={cn(
                  "min-h-[7.5rem] w-full rounded-2xl sm:min-h-[8.5rem]",
                  i === 0 && "col-span-2 sm:col-span-1 lg:col-span-2",
                )}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-8 border-t border-cream/8 pt-10 lg:grid-cols-2">
          <div className="space-y-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-3 w-full rounded-full" />
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-10 w-40" />
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-full rounded-full" />
            ))}
          </div>
        </div>

        <div className="border-t border-cream/8 pt-10">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-10 w-40" />
          <div className="mt-7 space-y-2.5">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-full rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
