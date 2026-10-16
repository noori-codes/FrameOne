import { MovieGridSkeleton, Skeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <main
      className="flex min-h-dvh flex-1 flex-col"
      aria-busy
      aria-label="Loading person"
    >
      <section className="relative isolate flex min-h-0 flex-col overflow-hidden border-b border-cream/10 bg-stage">
        <div className="relative mx-auto flex w-full max-w-screen-2xl flex-col px-4 pb-6 pt-14 sm:px-6 sm:pb-8 sm:pt-16 lg:px-8 lg:pb-10 lg:pt-18">
          <Skeleton className="h-9 w-36 rounded-full" />
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

      <div className="relative mx-auto w-full max-w-screen-2xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-20">
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
          <div className="hidden space-y-4 lg:block">
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
