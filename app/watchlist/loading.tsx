import { ListPageNav } from "@/components/list-page-nav";
import { MovieGridSkeleton, Skeleton } from "@/components/skeletons";

export default function WatchlistLoading() {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 pt-10 pb-20 sm:px-8">
      <Skeleton className="h-12 w-48" />
      <Skeleton className="mt-3 h-4 w-72 max-w-full" />
      <div className="mt-6">
        <ListPageNav active="watchlist" />
      </div>
      <MovieGridSkeleton count={8} />
    </main>
  );
}
