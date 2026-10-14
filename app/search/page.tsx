import { SearchExperience } from "@/components/search-experience";
import { parsePageParam } from "@/components/pagination-nav";
import { searchMovies } from "@/lib/tmdb";

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
  const initialData = query ? await searchMovies(query, page) : null;

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pt-8 pb-16 sm:px-8 sm:pt-10 sm:pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_srgb,var(--amber)_14%,transparent),transparent_55%)]"
      />

      <p className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.24em] text-amber/85 uppercase">
        <span className="h-px w-5 bg-amber/70" aria-hidden />
        Discover
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide text-cream uppercase sm:text-6xl">
        Search
      </h1>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-cream/50 sm:text-base">
        Find films by title — then save favorites and build your watchlist.
      </p>

      <SearchExperience
        initialQuery={query}
        initialPage={page}
        initialData={initialData}
      />
    </main>
  );
}
