import { Skeleton } from "@/components/skeletons";

export default function MovieLoading() {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-8 px-6 pt-24 pb-16 sm:flex-row sm:items-end">
      <Skeleton className="mx-auto aspect-2/3 w-48 shrink-0 sm:mx-0 sm:w-56" />
      <div className="min-w-0 flex-1">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-3 h-12 w-3/4 max-w-lg" />
        <Skeleton className="mt-3 h-3 w-48" />
        <Skeleton className="mt-6 h-4 w-full max-w-2xl" />
        <Skeleton className="mt-2 h-4 w-full max-w-xl" />
        <Skeleton className="mt-2 h-4 w-2/3 max-w-md" />
        <Skeleton className="mt-6 h-9 w-36" />
      </div>
    </main>
  );
}
