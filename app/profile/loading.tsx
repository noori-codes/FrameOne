import { Skeleton } from "@/components/skeletons";

/** Mirrors Account page: title, avatar + identity, security form. */
export default function ProfileLoading() {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-16">
      <Skeleton className="h-9 w-40 sm:h-11 sm:w-48" />
      <Skeleton className="mt-2 h-4 w-52 sm:mt-2.5 sm:w-64" />

      <section className="relative mt-8 overflow-hidden rounded-2xl sm:mt-10">
        <div className="relative flex flex-col items-center gap-5 px-3 py-6 sm:flex-row sm:items-center sm:gap-8 sm:px-5 sm:py-8">
          <Skeleton className="h-28 w-28 shrink-0 rounded-full sm:h-32 sm:w-32" />

          <div className="flex w-full min-w-0 flex-1 flex-col items-center gap-2 sm:items-start sm:gap-3">
            <Skeleton className="h-7 w-36 sm:h-8 sm:w-44" />
            <Skeleton className="h-4 w-48 max-w-full" />
            <Skeleton className="h-3 w-36 sm:h-4 sm:w-40" />
          </div>
        </div>
      </section>

      <section className="mt-10 border-t border-cream/10 pt-8 sm:mt-14 sm:pt-10">
        <Skeleton className="h-6 w-24 sm:h-7 sm:w-28" />
        <Skeleton className="mt-2 mb-5 h-4 w-full max-w-sm sm:mb-6" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="mt-1 h-10 w-full rounded-full sm:w-40" />
        </div>
      </section>

      <div className="mt-10 border-t border-cream/10 pt-6 sm:mt-14 sm:pt-8">
        <Skeleton className="mx-auto h-4 w-16 sm:mx-0" />
      </div>
    </main>
  );
}
