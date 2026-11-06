import { Skeleton } from "@/components/skeletons";

export default function GenreDetailLoading() {
  return (
    <main
      className="relative flex min-h-dvh w-full flex-1 flex-col"
      aria-busy
      aria-label="Loading genre"
    >
      <header className="border-b border-cream/8 px-5 pt-6 pb-5 lg:hidden">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-4 h-12 w-48" />
        <Skeleton className="mt-3 h-4 w-full max-w-md" />
      </header>

      <div className="grid w-full flex-1 lg:grid-cols-[minmax(280px,22rem)_minmax(0,1fr)]">
        <aside className="hidden border-r border-cream/8 px-6 py-8 lg:block xl:px-8">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-8 h-16 w-40" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-48" />
          <Skeleton className="mt-7 aspect-2/3 w-36 rounded-xl" />
          <Skeleton className="mt-8 h-9 w-full rounded-full" />
          <div className="mt-6 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-xl" />
            ))}
          </div>
        </aside>
        <section className="px-5 py-7 sm:px-6 lg:px-8 xl:px-10">
          <Skeleton className="mb-7 h-4 w-40" />
          <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <li key={i}>
                <Skeleton className="aspect-2/3 w-full rounded-xl" />
                <Skeleton className="mt-2.5 h-4 w-28" />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
