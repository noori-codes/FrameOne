import Image from "next/image";
import Link from "next/link";
import {
  emptyMoviesPage,
  getMovieGenres,
  getMoviesByGenre,
  mapPool,
  posterUrl,
} from "@/lib/tmdb";

/**
 * /genres — full-bleed mosaic of categories, then open /genres/[id]
 */
export default async function GenresPage() {
  const genres = await getMovieGenres();

  const pages = await mapPool(genres, 6, async (genre) => ({
    genre,
    page: await getMoviesByGenre(genre.id, 1, "popular").catch((err) => {
      console.warn(`Genre cover ${genre.id} failed:`, err);
      return emptyMoviesPage(1);
    }),
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
      page.results.find(
        (movie) => movie.poster_path && !usedMovieIds.has(movie.id),
      ) ??
      page.results.find((movie) => movie.poster_path) ??
      page.results[0];

    if (lead?.id) usedMovieIds.add(lead.id);
    if (lead?.poster_path) usedPosters.add(lead.poster_path);

    return {
      genre,
      poster: posterUrl(lead?.poster_path ?? null, "w500"),
      titleCount: page.totalResults,
    };
  });

  return (
    <main className="relative flex min-h-dvh w-full flex-1 flex-col">
      <header className="relative isolate overflow-hidden border-b border-cream/8">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_0%,color-mix(in_srgb,var(--amber)_16%,transparent),transparent_52%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-amber/35 to-transparent"
        />
        <div className="relative w-full px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20 xl:px-10">
          <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase sm:text-xs">
            Catalog
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-5xl leading-none tracking-[0.06em] text-cream uppercase sm:text-7xl md:text-8xl lg:text-9xl">
            Genres
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-cream/50 sm:text-base">
            {cards.length} categories from TMDB — open one for an endless grid
            you can sort by popular, top rated, or newest.
          </p>
        </div>
      </header>

      <div className="w-full flex-1 px-5 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-10">
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 2xl:gap-3.5">
          {cards.map(({ genre, poster, titleCount }, index) => (
            <li key={genre.id}>
              <Link
                href={`/genres/${genre.id}`}
                className="group relative block aspect-3/4 overflow-hidden rounded-xl bg-stage shadow-[0_12px_32px_-18px_rgba(0,0,0,0.75)] ring-1 ring-cream/10 transition-[transform,box-shadow,ring-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-[0_28px_48px_-20px_rgba(0,0,0,0.9),0_0_36px_-18px_color-mix(in_srgb,var(--amber)_30%,transparent)] hover:ring-amber/35"
              >
                {poster ? (
                  <Image
                    src={poster}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, (max-width: 1536px) 16vw, 14vw"
                    priority={index < 8}
                    className="object-cover opacity-55 transition-[transform,opacity] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05] group-hover:opacity-75"
                  />
                ) : null}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-t from-background via-background/55 to-transparent"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-amber/0 transition-colors duration-700 group-hover:bg-amber/8"
                />
                <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
                  <span
                    aria-hidden
                    className="mb-2 block h-0.5 w-7 origin-left scale-x-75 rounded-full bg-amber/70 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                  />
                  <h2 className="font-display text-2xl leading-none tracking-[0.08em] text-cream uppercase transition-colors duration-500 group-hover:text-amber sm:text-3xl lg:text-[2rem]">
                    {genre.name}
                  </h2>
                  {titleCount > 0 ? (
                    <p className="mt-1.5 text-[11px] tracking-wide text-cream/40 tabular-nums sm:text-xs">
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
