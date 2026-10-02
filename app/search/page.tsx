import Image from "next/image";
import Link from "next/link";
import { posterUrl, searchMovies } from "@/lib/tmdb";

/**
 * /search?q=inception
 * `searchParams` comes from the URL query string (Promise in App Router).
 */
type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const results = query ? await searchMovies(query) : [];

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 pt-24 pb-16">
      <h1 className="font-display text-4xl tracking-wide text-cream sm:text-5xl">
        Search
      </h1>

      {/* Same GET form pattern as the header — works without JavaScript */}
      <form action="/search" method="get" className="mt-6 flex max-w-md gap-2">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Movie title…"
          autoFocus
          className="min-w-0 flex-1 rounded-sm border border-cream/20 bg-stage px-3 py-2 text-sm text-cream outline-none focus:border-amber"
        />
        <button
          type="submit"
          className="rounded-sm bg-amber px-4 py-2 text-sm font-medium text-[#1a1208] transition-colors hover:bg-(--amber-dim) hover:text-cream"
        >
          Search
        </button>
      </form>

      {!query ? (
        <p className="mt-12 text-cream/50">Type a title to search TMDB.</p>
      ) : results.length === 0 ? (
        <p className="mt-12 text-cream/50">
          No results for{" "}
          <span className="text-cream/80">&ldquo;{query}&rdquo;</span>.
        </p>
      ) : (
        <>
          <p className="mt-8 text-sm text-cream/55">
            {results.length} result{results.length === 1 ? "" : "s"} for{" "}
            <span className="text-cream/80">&ldquo;{query}&rdquo;</span>
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {results.map((movie) => {
              const src = posterUrl(movie.poster_path);
              return (
                <li key={movie.id}>
                  <Link href={`/movie/${movie.id}`} className="group block">
                    <div className="relative aspect-2/3 overflow-hidden rounded-sm bg-stage ring-1 ring-cream/10 transition-[box-shadow,transform] group-hover:scale-[1.03] group-hover:ring-amber/50">
                      {src ? (
                        <Image
                          src={src}
                          alt={movie.title}
                          fill
                          sizes="160px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center p-2 text-center text-xs text-cream/40">
                          {movie.title}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-cream/70 group-hover:text-cream">
                      {movie.title}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </main>
  );
}
