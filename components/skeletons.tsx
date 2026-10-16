import { cn } from "@/lib/utils";

/** Pulsing block used to build page skeletons. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-lg bg-stage", className)}
    />
  );
}

const MOVIE_GRID_CLASS =
  "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

export function MoviePosterSkeleton({ className }: { className?: string }) {
  return (
    <Skeleton className={cn("aspect-2/3 w-full rounded-xl", className)} />
  );
}

/** Poster-shaped placeholders in a grid (browse, search, watchlist). */
export function MovieGridSkeleton({
  count = 12,
  className,
  showTitle = true,
}: {
  count?: number;
  className?: string;
  showTitle?: boolean;
}) {
  return (
    <ul className={cn(MOVIE_GRID_CLASS, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <MoviePosterSkeleton />
          {showTitle ? <Skeleton className="mt-2.5 h-3.5 w-3/4" /> : null}
        </li>
      ))}
    </ul>
  );
}

/** One horizontal row of posters (home / similar titles). */
export function MovieRowSkeleton() {
  return (
    <section className="space-y-5 sm:space-y-6">
      <div className="flex items-end justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-44 rounded-sm sm:h-10 sm:w-64" />
        <div className="mb-0.5 flex gap-2">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="size-9 rounded-full" />
        </div>
      </div>
      <div className="overflow-hidden px-4 pt-2 pb-5 sm:px-6 lg:px-8">
        <ul className="flex gap-3.5 sm:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <li
              key={i}
              className="min-w-0 shrink-0 grow-0 basis-30 sm:basis-39 md:basis-44"
            >
              <MoviePosterSkeleton />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HomeHeroSkeleton() {
  return (
    <section className="relative flex min-h-[min(760px,100dvh)] w-full flex-col justify-end overflow-hidden sm:min-h-[min(820px,100dvh)] lg:min-h-[min(860px,100dvh)]">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-10 sm:px-6 lg:px-8">
        <Skeleton className="h-7 w-36 rounded-full" />
        <Skeleton className="mt-5 h-20 w-full max-w-2xl rounded-sm sm:h-28" />
        <Skeleton className="mt-5 h-4 w-full max-w-xl" />
        <Skeleton className="mt-2 h-4 w-2/3 max-w-md" />
        <div className="mt-8 flex gap-3">
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </div>
    </section>
  );
}

export function EndlessFeedSkeleton() {
  return (
    <section className="border-t border-cream/10 pt-12 sm:pt-16">
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-10 w-56" />
        <MovieGridSkeleton count={12} className="mt-10" showTitle={false} />
      </div>
    </section>
  );
}

/** Browse / genre collection pages (cinematic hero + grid). */
export function CollectionPageSkeleton({
  genreChips = false,
}: {
  genreChips?: boolean;
}) {
  return (
    <main
      className="relative flex min-h-dvh w-full flex-1 flex-col"
      aria-busy
      aria-label="Loading collection"
    >
      <section className="relative isolate overflow-hidden border-b border-cream/10 bg-stage">
        <div className="grid min-h-[350px] w-full grid-cols-1 items-end gap-8 px-3 pb-10 pt-8 sm:min-h-[390px] sm:px-5 sm:pb-12 sm:pt-10 lg:min-h-[430px] lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center lg:px-8 lg:py-12">
          <div className="relative z-10 max-w-3xl">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-10 h-7 w-48 rounded-full" />
            <Skeleton className="mt-4 h-[3.5rem] w-full max-w-lg rounded-sm sm:h-24" />
            <Skeleton className="mt-5 h-4 w-full max-w-md" />
            <div className="mt-6 flex flex-wrap gap-3">
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>
          <Skeleton className="hidden aspect-2/3 w-full max-w-52 justify-self-end rounded-md lg:block" />
        </div>
      </section>

      <section className="border-b border-cream/8 bg-background/80">
        <div className="w-full px-3 py-5 sm:px-5 sm:py-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
          {genreChips ? (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-cream/8 pt-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full" />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="w-full flex-1 px-3 py-8 sm:px-5 sm:py-10 lg:px-8">
        <div className="mb-7 border-b border-cream/10 pb-4 sm:mb-9 sm:pb-5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-2 h-9 w-48 sm:h-10 sm:w-56" />
        </div>
        <MovieGridSkeleton count={12} />
      </section>
    </main>
  );
}

export function ListPageHeaderSkeleton() {
  return (
    <div className="border-b border-cream/8 bg-stage/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Skeleton className="h-10 w-48 sm:h-14 sm:w-64" />
            <Skeleton className="mt-3 h-4 w-56" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
