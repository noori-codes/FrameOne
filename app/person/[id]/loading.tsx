import { Skeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <main className="flex min-h-dvh flex-1 flex-col">
      <section className="relative flex flex-col overflow-hidden border-b border-cream/10 bg-stage">
        <div className="relative mx-auto flex w-full max-w-screen-2xl flex-col px-4 pb-6 pt-14 sm:px-6 sm:pb-8 sm:pt-16 lg:px-8">
          <Skeleton className="h-4 w-28" />
          <div className="mt-6 grid grid-cols-1 items-center gap-6 sm:mt-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
            <Skeleton className="mx-auto aspect-3/4 w-full max-w-[180px] rounded-sm lg:mx-0 lg:max-w-none" />
            <div className="space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-2/3 max-w-md" />
              <Skeleton className="h-12 w-1/2 max-w-sm" />
              <div className="grid grid-cols-3 gap-2 pt-1">
                <Skeleton className="h-14 rounded-sm" />
                <Skeleton className="h-14 rounded-sm" />
                <Skeleton className="h-14 rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-3 h-10 w-48" />
        <Skeleton className="mt-6 h-24 w-full max-w-3xl" />
      </div>
    </main>
  );
}
