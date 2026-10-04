import { Skeleton } from "@/components/skeletons";

export default function FavoritesLoading() {
  return (
    <main className="relative flex min-h-dvh w-full flex-1 flex-col">
      <div className="border-b border-cream/8 bg-stage/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
          <Skeleton className="h-12 w-48 sm:h-14 sm:w-64" />
          <Skeleton className="mt-3 h-3 w-56" />
          <div className="mt-6 flex gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <ul className="divide-y divide-cream/8 border-t border-cream/8">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex gap-4 py-5 sm:gap-6 sm:py-6">
              <Skeleton className="aspect-2/3 w-24 shrink-0 sm:w-28" />
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
