import { MovieRowSkeleton, Skeleton } from "@/components/skeletons";

export default function TvLoading() {
  return (
    <main className="flex min-h-dvh w-full flex-1 flex-col">
      <section className="movie-detail-hero relative isolate flex flex-col overflow-hidden border-b border-cream/10 bg-stage">
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-r from-background/90 via-background/60 to-background/30"
        />
        <div className="relative mx-auto flex w-full max-w-screen-2xl flex-1 flex-col px-4 pb-6 pt-16 sm:px-6 sm:pb-10 sm:pt-20 lg:px-8 lg:pb-12 lg:pt-24">
          <Skeleton className="h-10 w-36 rounded-full" />
          <div className="mt-auto grid grid-cols-1 items-end gap-7 pt-8 sm:gap-10 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12 lg:pt-16">
            <div className="min-w-0 space-y-5">
              <Skeleton className="h-3 w-36 rounded-sm" />
              <Skeleton className="h-16 w-full max-w-3xl rounded-sm sm:h-24" />
              <Skeleton className="h-4 w-2/3 max-w-xl rounded-sm" />
              <div className="flex flex-wrap gap-3 pt-2">
                <Skeleton className="h-9 w-28 rounded-full" />
                <Skeleton className="h-9 w-24 rounded-full" />
              </div>
              <div className="flex gap-3 pt-2">
                <Skeleton className="h-12 w-36 rounded-full" />
              </div>
            </div>
            <Skeleton className="hidden aspect-2/3 w-full rounded-sm lg:block" />
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-screen-2xl gap-10 border-t border-cream/10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12 lg:px-8 lg:py-16">
        <div className="space-y-8">
          <Skeleton className="h-3 w-20 rounded-sm" />
          <Skeleton className="h-12 w-48 rounded-sm" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full max-w-3xl rounded-sm" />
            <Skeleton className="h-4 w-full max-w-2xl rounded-sm" />
            <Skeleton className="h-4 w-2/3 max-w-xl rounded-sm" />
          </div>
        </div>
        <div className="hidden space-y-4 border-l border-cream/10 pl-8 lg:block">
          <Skeleton className="h-3 w-24 rounded-sm" />
          <Skeleton className="h-10 w-32 rounded-sm" />
          <Skeleton className="h-px w-full rounded-none" />
          <Skeleton className="h-4 w-full rounded-sm" />
          <Skeleton className="h-4 w-full rounded-sm" />
        </div>
      </div>

      <section className="border-t border-cream/10 pt-10 pb-16 sm:pt-14 sm:pb-20">
        <MovieRowSkeleton />
      </section>
    </main>
  );
}
