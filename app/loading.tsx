import {
  EndlessFeedSkeleton,
  HomeHeroSkeleton,
  MovieRowSkeleton,
} from "@/components/skeletons";

/** Shown while the home page fetches TMDB lists. */
export default function HomeLoading() {
  return (
    <main
      className="relative flex min-h-dvh flex-1 flex-col overflow-x-hidden"
      aria-busy
      aria-label="Loading home"
    >
      <HomeHeroSkeleton />
      <div className="relative z-10 flex w-full flex-col gap-14 border-t border-cream/8 pt-12 pb-12 sm:gap-24 sm:pt-20 sm:pb-20">
        {Array.from({ length: 4 }).map((_, i) => (
          <MovieRowSkeleton key={i} />
        ))}
        <EndlessFeedSkeleton />
      </div>
    </main>
  );
}
