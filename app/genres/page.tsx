import Image from "next/image";
import Link from "next/link";
import {
  getMovieGenres,
  getMoviesByGenre,
  mapPool,
  posterUrl,
} from "@/lib/tmdb";

/**
 * /genres — pick a category, then open /genres/[id]
 */
export default async function GenresPage() {
  const genres = await getMovieGenres();

  const pages = await mapPool(genres, 6, async (genre) => ({
    genre,
    page: await getMoviesByGenre(genre.id, 1, "popular"),
  }));

  // Popular titles span multiple genres (e.g. Spider-Man) — keep covers unique.
  const usedMovieIds = new Set<number>();
  const usedPosters = new Set<string>();

  const cards = pages.map(({ genre, page }) => {
    const lead =
      page.results.find(
        (movie) =>
          movie.poster_path &&
          !usedMovieIds.has(movie.id) &&
          !usedPosters.has(movie.poster_path),
      ) ??
      page.results.find((movie) => movie.poster_path && !usedMovieIds.has(movie.id)) ??
      page.results.find((movie) => movie.poster_path) ??
      page.results[0];

    if (lead?.id) usedMovieIds.add(lead.id);
    if (lead?.poster_path) usedPosters.add(lead.poster_path);

    return {
      genre,
      poster: posterUrl(lead?.poster_path ?? null, "w342"),
      titleCount: page.totalResults,
    };
  });

  return (
    <main className="relative flex min-h-dvh w-full flex-1 flex-col">
      <header className="relative isolate overflow-hidden border-b border-cream/8">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(47,230,200,0.1),transparent_50%)]"
        />
        <div className="relative mx-auto w-full max-w-screen-2xl px-3 py-10 sm:px-5 sm:py-14 lg:px-8 lg:py-16">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-amber uppercase sm:text-xs">
            Catalog
          </p>
          <h1 className="mt-3 font-display text-5xl leading-none tracking-[0.06em] text-cream uppercase sm:text-7xl md:text-8xl">
            Genres
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/50 sm:text-base">
            {cards.length} categories from TMDB — open one for an endless grid
            you can sort by popular, top rated, or newest.
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-screen-2xl flex-1 px-3 py-6 sm:px-5 sm:py-8 lg:px-8 lg:py-10">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {cards.map(({ genre, poster, titleCount }, index) => (
            <li key={genre.id}>
              <Link
                href={`/genres/${genre.id}`}
                className="group relative block aspect-3/4 overflow-hidden bg-stage ring-1 ring-cream/8 transition-[transform,ring-color] duration-300 hover:-translate-y-1 hover:ring-amber/40"
              >
                {poster ? (
                  <Image
                    src={poster}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                    priority={index < 6}
                    className="object-cover opacity-50 transition-[transform,opacity] duration-500 group-hover:scale-105 group-hover:opacity-70"
                  />
                ) : null}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-amber/0 transition-colors duration-300 group-hover:bg-amber/5"
                />
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-3.5">
                  <h2 className="font-display text-2xl leading-none tracking-[0.08em] text-cream uppercase transition-colors duration-300 group-hover:text-amber sm:text-3xl">
                    {genre.name}
                  </h2>
                  {titleCount > 0 ? (
                    <p className="mt-1.5 text-[11px] tracking-wide text-cream/40 tabular-nums">
                      {titleCount.toLocaleString()} titles
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
