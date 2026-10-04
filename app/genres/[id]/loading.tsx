import { MovieGridSkeleton, Skeleton } from "@/components/skeletons";

export default function GenreDetailLoading() {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 pt-8 pb-16">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-10 w-48" />
      <Skeleton className="mt-2 h-3 w-40" />
      <MovieGridSkeleton />
    </main>
  );
}
