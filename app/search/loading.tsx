import { MovieGridSkeleton, Skeleton } from "@/components/skeletons";

export default function SearchLoading() {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 pt-24 pb-16">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="mt-6 h-10 w-full max-w-md" />
      <Skeleton className="mt-8 h-3 w-56" />
      <MovieGridSkeleton />
    </main>
  );
}
