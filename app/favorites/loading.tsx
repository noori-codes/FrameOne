import { ListPageHeaderSkeleton, Skeleton } from "@/components/skeletons";

export default function FavoritesLoading() {
  return (
    <main
      className="relative flex min-h-dvh w-full flex-1 flex-col"
      aria-busy
      aria-label="Loading favorites"
    >
      <ListPageHeaderSkeleton />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        <ul className="divide-y divide-cream/8 border-t border-cream/8">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex items-stretch gap-4 py-5 sm:gap-5 sm:py-6">
              <Skeleton className="aspect-2/3 w-[5.5rem] shrink-0 rounded-xl sm:w-24" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-6 w-48 max-w-full" />
                <Skeleton className="mt-3 h-4 w-24" />
                <Skeleton className="mt-3 h-4 w-full max-w-md" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
