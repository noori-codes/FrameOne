import { MovieGridSkeleton, Skeleton } from "@/components/skeletons";

export default function FavoritesLoading() {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 pt-24 pb-16">
      <Skeleton className="h-10 w-32" />
      <Skeleton className="mt-2 h-4 w-64 max-w-full" />
      <MovieGridSkeleton count={8} />
    </main>
  );
}
