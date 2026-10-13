import { Skeleton } from "@/components/skeletons";

/** Mirrors redesigned Account page: hero + settings grid. */
export default function ProfileLoading() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col">
      <section className="border-b border-cream/10 bg-stage">
        <div className="mx-auto w-full max-w-screen-2xl px-4 pt-14 pb-10 sm:px-6 sm:pt-16 lg:px-8">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-3 h-12 w-48 sm:h-16 sm:w-64" />
          <Skeleton className="mt-3 h-4 w-72 max-w-full" />
          <div className="mt-8 flex flex-col items-center gap-8 lg:flex-row lg:items-center">
            <Skeleton className="h-28 w-28 shrink-0 rounded-full sm:h-32 sm:w-32" />
            <div className="flex w-full flex-col items-center gap-3 lg:items-start">
              <Skeleton className="h-8 w-44" />
              <Skeleton className="h-4 w-56" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-24 rounded-full" />
                <Skeleton className="h-7 w-28 rounded-full" />
                <Skeleton className="h-7 w-32 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-screen-2xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-sm border border-cream/10"
            >
              <div className="border-b border-cream/10 px-5 py-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-2 h-8 w-40" />
              </div>
              <div className="space-y-3 px-5 py-5">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}