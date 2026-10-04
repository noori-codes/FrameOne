import { Skeleton } from "@/components/skeletons";

export default function GenresLoading() {
  return (
    <main className="relative flex min-h-dvh w-full flex-1 flex-col">
      <div className="border-b border-cream/8 bg-stage/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
          <Skeleton className="h-12 w-40 sm:h-14 sm:w-52" />
          <Skeleton className="mt-3 h-4 w-80 max-w-full" />
        </div>
      </div>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 15 }).map((_, i) => (
            <li key={i}>
              <Skeleton className="aspect-4/3 w-full rounded-xl" />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
