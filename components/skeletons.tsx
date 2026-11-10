import { PAGE_GUTTER } from "@/lib/layout";
import { cn } from "@/lib/utils";

export { PAGE_GUTTER };

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
  "grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

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
      <div
        className={cn(
          "flex items-end justify-between gap-3",
          PAGE_GUTTER,
        )}
      >
        <div>
          <Skeleton className="h-8 w-44 rounded-sm sm:h-10 sm:w-64" />
          <Skeleton className="mt-2 h-3 w-28 sm:w-36" />
        </div>
        <div className="mb-0.5 flex gap-2">
          <Skeleton className="size-9 rounded-full" />
          <Skeleton className="size-9 rounded-full" />
        </div>
      </div>
      <div className={cn("overflow-hidden pt-2 pb-5", PAGE_GUTTER)}>
        <ul className="flex gap-4 sm:gap-5 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <li
              key={i}
              className="min-w-0 shrink-0 grow-0 basis-36 sm:basis-44 md:basis-52 lg:basis-56"
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
    <section className="relative flex min-h-dvh w-full flex-col justify-end overflow-hidden">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className={cn("relative z-10 w-full pb-10", PAGE_GUTTER)}>
        <Skeleton className="h-7 w-36 rounded-full" />
        <Skeleton className="mt-5 h-20 w-full max-w-3xl rounded-sm sm:h-28" />
        <Skeleton className="mt-5 h-4 w-full max-w-xl" />
        <Skeleton className="mt-2 h-4 w-2/3 max-w-md" />
        <div className="mt-8 flex gap-3">
          <Skeleton className="h-12 w-36 rounded-full" />
          <Skeleton className="h-12 w-28 rounded-full" />
        </div>
      </div>
    </section>
  );
}

export function EndlessFeedSkeleton() {
  return (
    <section className="border-t border-cream/10 pt-12 sm:pt-16">
      <div className={cn("w-full", PAGE_GUTTER)}>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-10 w-56" />
        <MovieGridSkeleton count={12} className="mt-10" showTitle={false} />
      </div>
    </section>
  );
}

/** Favorites / watchlist / watched list headers + grid. */
export function ListPageSkeleton({
  label = "Loading list",
  showFeatured = true,
}: {
  label?: string;
  showFeatured?: boolean;
}) {
  return (
    <main
      className="relative flex min-h-dvh w-full flex-1 flex-col"
      aria-busy
      aria-label={label}
    >
      <header className={cn("border-b border-cream/8 pt-8 pb-8", PAGE_GUTTER)}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-14 w-56 sm:h-16 sm:w-72" />
            <div className="mt-5 flex gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-44 rounded-full" />
            <Skeleton className="h-9 w-40 rounded-full" />
          </div>
        </div>
      </header>

      <div className={cn("w-full py-8 sm:py-10", PAGE_GUTTER)}>
        {showFeatured ? (
          <Skeleton className="mb-10 h-56 w-full rounded-3xl sm:h-64" />
        ) : null}
        <MovieGridSkeleton count={12} />
      </div>
    </main>
  );
}

/** @deprecated Prefer ListPageSkeleton — kept for any leftover imports. */
export function ListPageHeaderSkeleton() {
  return (
    <div className="border-b border-cream/8 bg-stage/30">
      <div className={cn("w-full py-10 sm:py-12", PAGE_GUTTER)}>
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
      <section className="relative isolate overflow-hidden border-b border-cream/8 bg-stage">
        <div
          className={cn(
            "grid min-h-[min(52vh,420px)] w-full grid-cols-1 items-end gap-8 pb-10 pt-8 sm:min-h-[min(48vh,460px)] sm:pb-12 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(200px,14vw)] lg:items-center lg:py-14",
            PAGE_GUTTER,
          )}
        >
          <div className="relative z-10 max-w-3xl">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-6 h-16 w-full max-w-lg rounded-sm sm:mt-8 sm:h-24" />
            <Skeleton className="mt-5 h-4 w-full max-w-md" />
            <div className="mt-6 flex flex-wrap gap-3">
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>
          <Skeleton className="hidden aspect-2/3 w-full justify-self-end rounded-xl lg:block" />
        </div>
      </section>

      <section className="border-b border-cream/8 bg-background/80">
        <div
          className={cn("flex w-full flex-col gap-3 py-3.5 sm:py-4", PAGE_GUTTER)}
        >
          {genreChips ? (
            <div className="flex gap-1.5 overflow-hidden">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 shrink-0 rounded-full" />
              ))}
            </div>
          ) : null}
          <div className="flex justify-end">
            <Skeleton className="h-9 w-56 rounded-full" />
          </div>
        </div>
      </section>

      <section className={cn("w-full flex-1 py-8 sm:py-10", PAGE_GUTTER)}>
        <MovieGridSkeleton count={12} />
      </section>
    </main>
  );
}

/** Movie / TV title detail shell. */
export function TitleDetailSkeleton({
  label = "Loading title",
  showCollectionRow = false,
}: {
  label?: string;
  showCollectionRow?: boolean;
}) {
  return (
    <main
      className="flex min-h-dvh w-full flex-1 flex-col"
      aria-busy
      aria-label={label}
    >
      <section className="movie-detail-hero relative isolate flex flex-col overflow-hidden border-b border-cream/10 bg-stage">
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-r from-background/90 via-background/60 to-background/30"
        />
        <div
          className={cn(
            "relative mx-auto flex w-full flex-1 flex-col pb-6 pt-16 sm:pb-10 sm:pt-20 lg:pb-12 lg:pt-24",
            PAGE_GUTTER,
          )}
        >
          <Skeleton className="h-10 w-28 rounded-full" />
          <div className="mt-auto grid grid-cols-1 items-end gap-7 pt-8 sm:gap-10 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12 lg:pt-12 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-4">
              <Skeleton className="aspect-2/3 w-[5.5rem] rounded-lg sm:w-28 lg:hidden" />
              <Skeleton className="h-3 w-36 rounded-sm" />
              <Skeleton className="h-14 w-full max-w-3xl rounded-sm sm:h-20" />
              <div className="flex flex-wrap gap-2.5 pt-1">
                <Skeleton className="h-8 w-12 rounded-sm" />
                <Skeleton className="h-8 w-14 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-full" />
              </div>
              <div className="space-y-2 pt-1">
                <Skeleton className="h-4 w-full max-w-2xl rounded-sm" />
                <Skeleton className="h-4 w-4/5 max-w-xl rounded-sm" />
                <Skeleton className="h-4 w-2/3 max-w-lg rounded-sm" />
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Skeleton className="h-12 w-40 rounded-full" />
                <Skeleton className="h-12 w-28 rounded-full" />
                <Skeleton className="h-12 w-28 rounded-full" />
              </div>
            </div>
            <Skeleton className="hidden aspect-2/3 w-full rounded-xl lg:block" />
          </div>
        </div>
      </section>

      <div
        className={cn(
          "mx-auto grid w-full gap-10 border-t border-cream/10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12 lg:py-16 xl:grid-cols-[minmax(0,1fr)_320px]",
          PAGE_GUTTER,
        )}
      >
        <div className="space-y-10">
          <div className="space-y-4">
            <Skeleton className="h-3 w-20 rounded-sm" />
            <Skeleton className="h-12 w-48 rounded-sm" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full max-w-3xl rounded-sm" />
              <Skeleton className="h-4 w-full max-w-2xl rounded-sm" />
              <Skeleton className="h-4 w-2/3 max-w-xl rounded-sm" />
            </div>
          </div>

          <div className="space-y-4 border-t border-cream/10 pt-8">
            <Skeleton className="h-3 w-24 rounded-sm" />
            <Skeleton className="h-10 w-56 rounded-sm" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="aspect-video w-64 shrink-0 rounded-xl sm:w-72"
                />
              ))}
            </div>
          </div>

          <div className="space-y-4 border-t border-cream/10 pt-8">
            <Skeleton className="h-3 w-20 rounded-sm" />
            <Skeleton className="h-12 w-32 rounded-sm" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="aspect-4/5 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        <div className="hidden space-y-4 border-l border-cream/10 pl-8 lg:block">
          <Skeleton className="h-3 w-28 rounded-sm" />
          <Skeleton className="h-10 w-40 rounded-sm" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="size-10 rounded-lg" />
            <Skeleton className="size-10 rounded-lg" />
            <Skeleton className="size-10 rounded-lg" />
          </div>
          <Skeleton className="mt-6 h-3 w-24 rounded-sm" />
          <Skeleton className="h-10 w-32 rounded-sm" />
          <Skeleton className="h-px w-full rounded-none" />
          <Skeleton className="h-4 w-full rounded-sm" />
          <Skeleton className="h-4 w-full rounded-sm" />
          <Skeleton className="h-4 w-4/5 rounded-sm" />
        </div>
      </div>

      {showCollectionRow ? (
        <section className="border-t border-cream/10 pt-10 sm:pt-14">
          <MovieRowSkeleton />
        </section>
      ) : null}
      <section className="border-t border-cream/10 pt-10 pb-16 sm:pt-14 sm:pb-20">
        <MovieRowSkeleton />
      </section>
    </main>
  );
}

export function SearchPageSkeleton() {
  return (
    <main
      className="relative flex min-h-dvh w-full flex-1 flex-col"
      aria-busy
      aria-label="Loading search"
    >
      <header
        className={cn(
          "border-b border-cream/8 pt-8 pb-7 sm:pt-10 sm:pb-9",
          PAGE_GUTTER,
        )}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-14 w-48 sm:h-16 sm:w-56" />
          <Skeleton className="mt-6 h-12 w-full rounded-full sm:h-14" />
          <div className="mt-5 flex w-full justify-center gap-2 overflow-hidden">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 shrink-0 rounded-full" />
            ))}
          </div>
        </div>
      </header>

      <div className={cn("w-full py-8 sm:py-10", PAGE_GUTTER)}>
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-2 h-9 w-52" />
        <div className="mt-7">
          <MovieGridSkeleton count={12} />
        </div>
      </div>
    </main>
  );
}

export function ProfilePageSkeleton() {
  return (
    <main
      className="relative flex min-h-dvh flex-1 flex-col overflow-x-hidden"
      aria-busy
      aria-label="Loading account"
    >
      <header className={cn("border-b border-cream/8 pt-10 pb-10", PAGE_GUTTER)}>
        <Skeleton className="mx-auto h-3 w-28 lg:mx-0" />
        <div className="mt-8 flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
          <Skeleton className="size-32 shrink-0 rounded-full sm:size-40 lg:size-44" />
          <div className="flex w-full flex-col items-center gap-4 lg:items-start">
            <Skeleton className="h-12 w-56 sm:h-14 sm:w-72" />
            <Skeleton className="h-4 w-64 max-w-full" />
            <div className="flex gap-3">
              <Skeleton className="h-20 w-28 rounded-2xl" />
              <Skeleton className="h-20 w-28 rounded-2xl" />
              <Skeleton className="h-20 w-28 rounded-2xl" />
            </div>
          </div>
        </div>
      </header>

      <div className={cn("space-y-12 py-10", PAGE_GUTTER)}>
        {Array.from({ length: 2 }, (_, section) => (
          <div key={section}>
            <div className="flex items-end justify-between">
              <div>
                <Skeleton className="h-8 w-36" />
                <Skeleton className="mt-2 h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="mt-5 flex gap-3 overflow-hidden">
              {Array.from({ length: 7 }, (_, i) => (
                <Skeleton
                  key={i}
                  className="aspect-2/3 w-32 shrink-0 rounded-xl sm:w-36"
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={cn("border-t border-cream/8 py-10", PAGE_GUTTER)}>
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-2 h-9 w-40" />
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    </main>
  );
}

export function GenresIndexSkeleton() {
  return (
    <main
      className="relative flex min-h-dvh w-full flex-1 flex-col"
      aria-busy
      aria-label="Loading genres"
    >
      <header className="relative isolate overflow-hidden border-b border-cream/8">
        <div className={cn("relative w-full py-12 sm:py-16 lg:py-20", PAGE_GUTTER)}>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-14 w-48 sm:h-20 sm:w-72 lg:h-28 lg:w-96" />
          <Skeleton className="mt-5 h-4 w-full max-w-md" />
        </div>
      </header>
      <div className={cn("w-full flex-1 py-6 sm:py-8 lg:py-10", PAGE_GUTTER)}>
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
          {Array.from({ length: 18 }).map((_, i) => (
            <li key={i}>
              <Skeleton className="aspect-3/4 w-full rounded-xl" />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export function GenreDetailSkeleton() {
  return (
    <main
      className="relative flex min-h-dvh w-full flex-1 flex-col"
      aria-busy
      aria-label="Loading genre"
    >
      <header className={cn("border-b border-cream/8 pt-6 pb-5 lg:hidden", PAGE_GUTTER)}>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-4 h-12 w-48" />
        <Skeleton className="mt-3 h-4 w-full max-w-md" />
      </header>

      <div className="grid w-full flex-1 lg:grid-cols-[minmax(280px,22rem)_minmax(0,1fr)]">
        <aside className="hidden border-r border-cream/8 px-6 py-8 lg:block xl:px-8">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-8 h-16 w-40" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-48" />
          <Skeleton className="mt-7 aspect-2/3 w-36 rounded-xl" />
          <Skeleton className="mt-8 h-9 w-full rounded-full" />
          <div className="mt-6 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-xl" />
            ))}
          </div>
        </aside>
        <section className={cn("py-7 sm:py-8", PAGE_GUTTER)}>
          <Skeleton className="mb-7 h-4 w-40" />
          <MovieGridSkeleton count={10} />
        </section>
      </div>
    </main>
  );
}

export function PersonPageSkeleton() {
  return (
    <main
      className="flex min-h-dvh flex-1 flex-col"
      aria-busy
      aria-label="Loading person"
    >
      <section className="relative isolate flex min-h-0 flex-col overflow-hidden border-b border-cream/10 bg-stage">
        <div
          className={cn(
            "relative mx-auto flex w-full flex-col pb-6 pt-14 sm:pb-8 sm:pt-16 lg:pb-10 lg:pt-20",
            PAGE_GUTTER,
          )}
        >
          <Skeleton className="h-10 w-28 rounded-full" />
          <div className="mt-6 grid grid-cols-1 items-center gap-6 sm:mt-8 sm:gap-8 lg:grid-cols-[minmax(160px,220px)_minmax(0,1fr)] lg:gap-12">
            <Skeleton className="mx-auto aspect-3/4 w-full max-w-[180px] rounded-xl sm:max-w-[200px] lg:mx-0 lg:max-w-none" />
            <div className="min-w-0 space-y-3">
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="h-12 w-2/3 max-w-md sm:h-16" />
              <Skeleton className="h-10 w-1/2 max-w-sm" />
              <div className="grid grid-cols-2 gap-2 pt-2 sm:grid-cols-3">
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Skeleton className="h-10 w-20 rounded-full" />
                <Skeleton className="h-10 w-24 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        className={cn(
          "relative mx-auto w-full py-12 sm:py-16 lg:py-20",
          PAGE_GUTTER,
        )}
      >
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16 xl:gap-20">
          <div className="min-w-0 space-y-16">
            <div>
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-2 h-10 w-48" />
              <Skeleton className="mt-8 h-8 w-full max-w-3xl" />
              <Skeleton className="mt-4 h-4 w-full max-w-2xl" />
              <Skeleton className="mt-2 h-4 w-2/3 max-w-xl" />
            </div>
            <div>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-10 w-40" />
              <MovieGridSkeleton count={12} className="mt-8" />
            </div>
          </div>
          <div className="hidden space-y-4 border-l border-cream/10 pl-8 lg:block">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
