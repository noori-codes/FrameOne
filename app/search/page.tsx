import { Search as SearchIcon } from "lucide-react";
import { PaginationNav, parsePageParam } from "@/components/pagination-nav";
import { MovieCard } from "@/components/movie-card";
import { searchMovies } from "@/lib/tmdb";

/**
 * /search?q=inception&page=2
 * `searchParams` comes from the URL query string (Promise in App Router).
 */
type SearchPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", page: pageRaw } = await searchParams;
  const query = q.trim();
  const page = parsePageParam(pageRaw);
  const data = query ? await searchMovies(query, page) : null;
  const results = data?.results ?? [];
  const totalPages = data?.totalPages ?? 0;

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

      <form
        action="/search"
        method="get"
        className="mt-7 flex w-full max-w-xl flex-col gap-3 sm:mt-9 sm:flex-row sm:items-stretch"
      >
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Movie title</span>
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-cream/35"
            aria-hidden
          />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Movie title…"
            autoFocus
            className="w-full rounded-full border border-cream/12 bg-cream/[0.035] py-3 pr-4 pl-11 text-sm text-cream outline-none transition-[border-color,box-shadow,background-color] placeholder:text-cream/25 focus:border-amber/50 focus:bg-cream/[0.055] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--amber)_16%,transparent)]"
          />
        </label>
        <button
          type="submit"
          className="cta-shine group relative overflow-hidden rounded-full bg-amber px-6 py-3 text-sm font-semibold text-[color:var(--on-amber)] transition-[background-color,box-shadow,transform] hover:bg-(--amber-dim) hover:text-cream hover:shadow-[0_14px_40px_-14px_color-mix(in_srgb,var(--amber)_70%,transparent)] active:scale-[0.98] sm:shrink-0"
        >
          <span className="cta-shine-beam pointer-events-none absolute inset-0" />
          <span className="relative">Search</span>
        </button>
      </form>

      {!query ? (
        <p className="mt-14 rounded-2xl border border-cream/10 bg-cream/[0.02] px-5 py-8 text-center text-cream/50">
          Type a title to search TMDB.
        </p>
      ) : results.length === 0 ? (
        <p className="mt-14 rounded-2xl border border-cream/10 bg-cream/[0.02] px-5 py-8 text-center text-cream/50">
          No results for{" "}
          <span className="text-cream/80">&ldquo;{query}&rdquo;</span>.
        </p>
      ) : (
        <>
          <p className="mt-10 text-sm text-cream/55">
            Showing page {page} for{" "}
            <span className="text-cream/80">&ldquo;{query}&rdquo;</span>
            {data ? ` · ${data.totalResults.toLocaleString()} total` : null}
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5 md:grid-cols-5 lg:grid-cols-6">
            {results.map((movie) => (
              <li key={movie.id}>
                <MovieCard
                  id={movie.id}
                  title={movie.title}
                  posterPath={movie.poster_path}
                  voteAverage={movie.vote_average}
                  showTitle
                />
              </li>
            ))}
          </ul>

          <PaginationNav
            page={page}
            totalPages={totalPages}
            prevHref={
              page > 1
                ? `/search?q=${encodeURIComponent(query)}&page=${page - 1}`
                : null
            }
            nextHref={
              page < totalPages
                ? `/search?q=${encodeURIComponent(query)}&page=${page + 1}`
                : null
            }
          />
        </>
      )}
    </main>
  );
}
