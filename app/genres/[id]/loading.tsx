import { MovieGridSkeleton, Skeleton } from "@/components/skeletons";

export default function GenreDetailLoading() {
  return (
    <main className="relative flex min-h-dvh w-full flex-1 flex-col">
      <div className="border-b border-cream/8 bg-stage/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-5 h-12 w-56 sm:h-14 sm:w-72" />
          <Skeleton className="mt-3 h-3 w-48" />
          <div className="mt-6 flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
          <div className="mt-8 flex gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <MovieGridSkeleton count={12} />
      </div>
    </main>
  );
}
