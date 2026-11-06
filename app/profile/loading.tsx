import { Skeleton } from "@/components/skeletons";

export default function ProfileLoading() {
  return (
    <main
      className="relative flex min-h-dvh flex-1 flex-col overflow-x-hidden"
      aria-busy
      aria-label="Loading account"
    >
      <header className="border-b border-cream/8 px-5 pt-10 pb-10 sm:px-8 lg:px-12 xl:px-16">
        <Skeleton className="mx-auto h-3 w-28 lg:mx-0" />
        <div className="mt-8 flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
          <Skeleton className="size-32 shrink-0 rounded-full sm:size-40 lg:size-44" />
          <div className="flex w-full flex-col items-center gap-4 lg:items-start">
            <Skeleton className="h-12 w-56 sm:h-14 sm:w-72" />
            <Skeleton className="h-4 w-64 max-w-full" />
            <div className="flex gap-3">
              <Skeleton className="h-20 w-28 rounded-2xl" />
              <Skeleton className="h-20 w-28 rounded-2xl" />
              <Skeleton className="h-20 w-28 rounded-2xl" />
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-12 px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
        {Array.from({ length: 2 }, (_, section) => (
          <div key={section}>
            <div className="flex items-end justify-between">
              <div>
                <Skeleton className="h-8 w-36" />
                <Skeleton className="mt-2 h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="mt-5 flex gap-3 overflow-hidden">
              {Array.from({ length: 7 }, (_, i) => (
                <Skeleton
                  key={i}
                  className="aspect-2/3 w-32 shrink-0 rounded-xl"
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-cream/8 px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-2 h-9 w-40" />
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    </main>
  );
}
