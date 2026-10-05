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

  const cards = await mapPool(genres, 6, async (genre) => {
    const page = await getMoviesByGenre(genre.id, 1, "popular");
    const lead = page.results.find((m) => m.poster_path) ?? page.results[0];
    return {
      genre,
      poster: posterUrl(lead?.poster_path ?? null, "w342"),
      titleCount: page.totalResults,
    };
  });

  return (
    <main className="relative flex min-h-dvh w-full flex-1 flex-col">
      <div className="border-b border-cream/8 bg-stage/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10">
          <h1 className="text-3xl font-semibold tracking-tight text-cream sm:text-5xl md:text-6xl">
            Genres
          </h1>
          <p className="mt-3 max-w-lg text-sm text-cream/50 sm:text-base">
            Browse TMDB categories — open any genre for an endless grid you can
            sort by popular, top rated, or newest.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
          {cards.map(({ genre, poster, titleCount }) => (
            <li key={genre.id}>
              <Link
                href={`/genres/${genre.id}`}
                className="group relative block aspect-4/3 overflow-hidden rounded-xl bg-stage ring-1 ring-cream/10 transition-[transform,ring-color] duration-300 hover:-translate-y-0.5 hover:ring-amber/40"
              >
                {poster ? (
                  <Image
                    src={poster}
                    alt=""
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                    className="object-cover opacity-55 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-70"
                  />
                ) : null}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-t from-background via-background/55 to-background/15"
                />
                <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
                  <h2 className="text-lg font-semibold tracking-tight text-cream sm:text-xl">
                    {genre.name}
                  </h2>
                  {titleCount > 0 ? (
                    <p className="mt-0.5 text-xs text-cream/45">
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
