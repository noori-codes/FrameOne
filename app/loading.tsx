import { HomeHeroSkeleton, MovieRowSkeleton } from "@/components/skeletons";

/**
 * Root route loading — covers navigations to `/` and any child without its
 * own loading.tsx. Nested routes that define loading.tsx keep theirs.
 */
export default function RootLoading() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col overflow-x-hidden">
      <HomeHeroSkeleton />
      <div className="relative z-10 flex min-h-[40vh] w-full flex-col gap-14 border-t border-cream/8 pt-12 pb-12 sm:gap-24 sm:pt-20 sm:pb-20">
        <div className="flex flex-col gap-14 sm:gap-24">
          <MovieRowSkeleton />
          <MovieRowSkeleton />
          <MovieRowSkeleton />
        </div>
      </div>
    </main>
  );
}
