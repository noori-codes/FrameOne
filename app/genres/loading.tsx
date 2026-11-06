import { Skeleton } from "@/components/skeletons";

export default function GenresLoading() {
  return (
    <main
      className="relative flex min-h-dvh w-full flex-1 flex-col"
      aria-busy
      aria-label="Loading genres"
    >
      <header className="relative isolate overflow-hidden border-b border-cream/8">
        <div className="relative w-full px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20 xl:px-10">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-14 w-48 sm:h-20 sm:w-72 lg:h-28 lg:w-96" />
          <Skeleton className="mt-5 h-4 w-full max-w-md" />
        </div>
      </header>
      <div className="w-full flex-1 px-5 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-10">
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 2xl:gap-3.5">
          {Array.from({ length: 18 }).map((_, i) => (
            <li key={i}>
              <Skeleton className="aspect-3/4 w-full rounded-xl" />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
