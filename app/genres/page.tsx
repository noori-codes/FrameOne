import Link from "next/link";
import { getMovieGenres } from "@/lib/tmdb";

/**
 * /genres — pick a category, then open /genres/[id]
 */
export default async function GenresPage() {
  const genres = await getMovieGenres();

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 pt-10 pb-20 sm:px-8">
      <h1 className="font-display text-5xl tracking-wide text-cream uppercase sm:text-6xl">
        Genres
      </h1>
      <p className="mt-3 max-w-md text-cream/55">
        Browse TMDB categories — each chip loads popular titles in that genre.
      </p>

      <ul className="mt-12 flex flex-wrap gap-3">
        {genres.map((genre) => (
          <li key={genre.id}>
            <Link
              href={`/genres/${genre.id}`}
              className="inline-flex rounded-full border border-cream/15 bg-stage/50 px-4 py-2 text-sm text-cream/75 transition-colors hover:border-amber hover:text-amber"
            >
              {genre.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
