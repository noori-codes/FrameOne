import { MovieGridSkeleton, Skeleton } from "@/components/skeletons";

export default function SearchLoading() {
  return (
    <main
      className="relative flex min-h-dvh w-full flex-1 flex-col"
      aria-busy
      aria-label="Loading search"
    >
      <header className="border-b border-cream/8 px-5 pt-8 pb-7 sm:px-8 lg:px-12 xl:px-16">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-2 h-14 w-48 sm:h-16 sm:w-56" />
        <Skeleton className="mt-6 h-12 w-full rounded-full sm:h-14" />
        <div className="mt-5 flex gap-2 overflow-hidden">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 shrink-0 rounded-full" />
          ))}
        </div>
      </header>

      <div className="w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-12 xl:px-16">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="mt-2 h-9 w-52" />
        <div className="mt-7">
          <MovieGridSkeleton count={12} />
        </div>
      </div>
    </main>
  );
}
