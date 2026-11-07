import { MovieGridSkeleton, Skeleton } from "@/components/skeletons";

export default function WatchedLoading() {
  return (
    <main
      className="relative flex min-h-dvh w-full flex-1 flex-col"
      aria-busy
      aria-label="Loading watched diary"
    >
      <header className="border-b border-cream/8 px-5 pt-8 pb-8 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-14 w-52 sm:h-16 sm:w-64" />
            <div className="mt-5 flex gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-56 rounded-full" />
            <Skeleton className="h-9 w-36 rounded-full" />
          </div>
        </div>
      </header>

      <div className="w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-12 xl:px-16">
        <MovieGridSkeleton count={12} />
      </div>
    </main>
  );
}
