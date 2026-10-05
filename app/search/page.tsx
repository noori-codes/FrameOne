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
      <h1 className="font-display text-4xl tracking-wide text-cream uppercase sm:text-6xl">
        Search
      </h1>

      <form
        action="/search"
        method="get"
        className="mt-6 flex w-full max-w-lg flex-col gap-2 sm:mt-8 sm:flex-row"
      >
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Movie title…"
          autoFocus
          className="min-w-0 flex-1 rounded-full border border-cream/15 bg-stage px-4 py-2.5 text-sm text-cream outline-none transition-[border-color,box-shadow] focus:border-amber/50 focus:ring-1 focus:ring-amber/60"
        />
        <button
          type="submit"
          className="rounded-full bg-amber px-5 py-2.5 text-sm font-medium text-[#1a1208] transition-colors hover:bg-(--amber-dim) hover:text-cream sm:shrink-0"
        >
          Search
        </button>
      </form>

      {!query ? (
        <p className="mt-14 text-cream/50">Type a title to search TMDB.</p>
      ) : results.length === 0 ? (
        <p className="mt-14 text-cream/50">
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
