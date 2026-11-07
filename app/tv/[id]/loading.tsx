import { MovieRowSkeleton, Skeleton } from "@/components/skeletons";

export default function TvLoading() {
  return (
    <main
      className="flex min-h-dvh w-full flex-1 flex-col"
      aria-busy
      aria-label="Loading series"
    >
      <section className="movie-detail-hero relative isolate flex flex-col overflow-hidden border-b border-cream/10 bg-stage">
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-r from-background/90 via-background/60 to-background/30"
        />
        <div className="relative mx-auto flex w-full flex-1 flex-col px-5 pb-6 pt-16 sm:px-8 sm:pb-10 sm:pt-20 lg:px-12 lg:pb-12 lg:pt-24 xl:px-16">
          <Skeleton className="h-10 w-28 rounded-full" />
          <div className="mt-auto grid grid-cols-1 items-end gap-7 pt-8 sm:gap-10 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12 lg:pt-12 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-4">
              <Skeleton className="aspect-2/3 w-[5.5rem] rounded-lg sm:w-28 lg:hidden" />
              <Skeleton className="h-3 w-36 rounded-sm" />
              <Skeleton className="h-14 w-full max-w-3xl rounded-sm sm:h-20" />
              <div className="flex flex-wrap gap-2.5 pt-1">
                <Skeleton className="h-8 w-14 rounded-sm" />
                <Skeleton className="h-8 w-14 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
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

      <div className="mx-auto grid w-full gap-10 border-t border-cream/10 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12 lg:px-12 lg:py-16 xl:grid-cols-[minmax(0,1fr)_320px] xl:px-16">
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
              {Array.from({ length: 5 }).map((_, skeletonIndex) => (
                <Skeleton
                  key={skeletonIndex}
                  className="aspect-4/5 w-full rounded-xl"
                />
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

      <section className="border-t border-cream/10 pt-10 pb-16 sm:pt-14 sm:pb-20">
        <MovieRowSkeleton />
      </section>
    </main>
  );
}
