import {
  ListPageHeaderSkeleton,
  MovieGridSkeleton,
} from "@/components/skeletons";

export default function WatchlistLoading() {
  return (
    <main
      className="relative flex min-h-dvh w-full flex-1 flex-col"
      aria-busy
      aria-label="Loading watchlist"
    >
      <ListPageHeaderSkeleton />
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        <MovieGridSkeleton count={12} />
      </div>
    </main>
  );
}
