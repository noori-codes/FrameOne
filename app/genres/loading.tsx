import { Skeleton } from "@/components/skeletons";

export default function GenresLoading() {
  return (
    <main
      className="relative flex min-h-dvh w-full flex-1 flex-col"
      aria-busy
      aria-label="Loading genres"
    >
      <header className="relative isolate overflow-hidden border-b border-cream/8">
        <div className="relative mx-auto w-full max-w-screen-2xl px-3 py-10 sm:px-5 sm:py-14 lg:px-8 lg:py-16">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-14 w-48 sm:h-20 sm:w-72" />
          <Skeleton className="mt-4 h-4 w-full max-w-md" />
        </div>
      </header>
      <div className="mx-auto w-full max-w-screen-2xl flex-1 px-3 py-6 sm:px-5 sm:py-8 lg:px-8 lg:py-10">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <li key={i}>
              <Skeleton className="aspect-3/4 w-full rounded-none" />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
