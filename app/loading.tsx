import { MovieRowSkeleton, Skeleton } from "@/components/skeletons";

/** Shown while the home page fetches TMDB lists. */
export default function HomeLoading() {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 pt-28 pb-20">
      <Skeleton className="h-12 w-12 rounded-sm" />
      <Skeleton className="mt-4 h-12 w-72 max-w-full sm:h-16 sm:w-96" />
      <Skeleton className="mt-4 h-4 w-full max-w-md" />
      <Skeleton className="mt-2 h-4 w-2/3 max-w-sm" />
      <div className="mt-8 flex gap-3">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="mt-16 flex flex-col gap-12 border-t border-cream/10 pt-10">
        <MovieRowSkeleton />
        <MovieRowSkeleton />
        <MovieRowSkeleton />
      </div>
    </main>
  );
}
