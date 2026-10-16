import { MovieGridSkeleton, Skeleton } from "@/components/skeletons";

export default function SearchLoading() {
  return (
    <main
      className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pt-8 pb-16 sm:px-8 sm:pt-10 sm:pb-20"
      aria-busy
      aria-label="Loading search"
    >
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-2 h-12 w-40 sm:h-16 sm:w-52" />
      <Skeleton className="mt-3 h-4 w-full max-w-lg" />
      <Skeleton className="mt-7 h-12 w-full max-w-xl rounded-full sm:mt-9" />
      <Skeleton className="mt-8 h-3 w-56" />
      <MovieGridSkeleton count={12} className="mt-6" />
    </main>
  );
}
