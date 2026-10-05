import { MovieRowSkeleton, Skeleton } from "@/components/skeletons";

export default function MovieLoading() {
  return (
    <main className="relative flex min-h-dvh w-full flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-8 pb-12 sm:flex-row sm:items-end sm:gap-8 sm:px-8 sm:pt-10">
        <Skeleton className="mx-auto aspect-2/3 w-40 shrink-0 sm:mx-0 sm:w-56" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-3 h-10 w-3/4 max-w-lg sm:h-12" />
          <Skeleton className="mt-3 h-3 w-48" />
          <Skeleton className="mt-6 h-4 w-full max-w-2xl" />
          <Skeleton className="mt-2 h-4 w-full max-w-xl" />
          <Skeleton className="mt-2 h-4 w-2/3 max-w-md" />
          <Skeleton className="mt-6 h-9 w-36" />
        </div>
      </div>
      <div className="border-t border-cream/8 pt-12 pb-16">
        <MovieRowSkeleton />
      </div>
    </main>
  );
}
