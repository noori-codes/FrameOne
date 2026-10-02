import { MovieRowSkeleton, Skeleton } from "@/components/skeletons";

/** Shown while the home page fetches TMDB lists. */
export default function HomeLoading() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col overflow-x-hidden">
      <section className="relative flex min-h-dvh w-full flex-col justify-end px-6 pb-16 sm:px-8 sm:pb-20 lg:px-10">
        <Skeleton className="absolute inset-0 rounded-none" />
        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <Skeleton className="h-3 w-40 rounded-sm" />
          <Skeleton className="mt-4 h-16 w-72 max-w-full rounded-sm sm:h-20 sm:w-[28rem]" />
          <Skeleton className="mt-4 h-4 w-full max-w-md" />
          <Skeleton className="mt-2 h-4 w-2/3 max-w-sm" />
          <div className="mt-8 flex gap-3">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-20 pt-16 pb-24 sm:gap-24 sm:pt-20">
        <MovieRowSkeleton />
        <MovieRowSkeleton />
        <MovieRowSkeleton />
      </div>
    </main>
  );
}
