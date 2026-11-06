import { SearchExperience } from "@/components/search-experience";
import { parsePageParam } from "@/components/pagination-nav";
import {
  getTrendingMovies,
  searchMulti,
  type PaginatedSearch,
} from "@/lib/tmdb";

/**
 * /search?q=inception&page=2
 * Initial HTML still reflects the URL; live typing is client-debounced (no reload).
 */
type SearchPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", page: pageRaw } = await searchParams;
  const query = q.trim();
  const page = parsePageParam(pageRaw);

  const [initialData, trending] = await Promise.all([
    query
      ? searchMulti(query, page).catch((err) => {
          console.warn(`Search for "${query}" failed:`, err);
          return {
            results: [],
            page,
            totalPages: 0,
            totalResults: 0,
          } satisfies PaginatedSearch;
        })
      : Promise.resolve(null),
    getTrendingMovies("day").catch(() => []),
  ]);

  const suggestions = trending
    .map((movie) => movie.title)
    .filter(Boolean)
    .slice(0, 8);

  return (
    <main className="relative flex min-h-dvh w-full flex-1 flex-col overflow-x-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(ellipse_at_18%_0%,color-mix(in_srgb,var(--amber)_16%,transparent),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-linear-to-r from-transparent via-amber/30 to-transparent"
      />

      <header className="relative w-full px-5 pt-10 pb-2 sm:px-6 sm:pt-14 lg:px-8 xl:px-10">
        <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase sm:text-xs">
          Discover
        </p>
        <h1 className="mt-3 max-w-4xl font-display text-5xl leading-none tracking-[0.06em] text-cream uppercase sm:text-7xl md:text-8xl">
          Search
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-cream/50 sm:text-base">
          Find movies and series by title — then save favorites and build your
          watchlist.
        </p>
      </header>

      <SearchExperience
        initialQuery={query}
        initialPage={page}
        initialData={initialData}
        suggestions={suggestions}
      />
    </main>
  );
}
