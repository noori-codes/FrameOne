import { MovieGridSkeleton, Skeleton } from "@/components/skeletons";

export default function SearchLoading() {
  return (
    <main
      className="relative flex min-h-dvh w-full flex-1 flex-col"
      aria-busy
      aria-label="Loading search"
    >
      <header className="w-full px-5 pt-10 pb-2 sm:px-6 sm:pt-14 lg:px-8 xl:px-10">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-3 h-14 w-48 sm:h-20 sm:w-64" />
        <Skeleton className="mt-4 h-4 w-full max-w-lg" />
      </header>
      <div className="border-b border-cream/8 px-5 py-4 sm:px-6 lg:px-8 xl:px-10">
        <Skeleton className="mx-auto h-14 w-full max-w-3xl rounded-full" />
      </div>
      <div className="w-full px-5 pt-8 sm:px-6 lg:px-8 xl:px-10">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-2 h-4 w-56" />
        <MovieGridSkeleton count={10} className="mt-7" />
      </div>
    </main>
  );
}
