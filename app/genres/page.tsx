import Link from "next/link";
import { getMovieGenres } from "@/lib/tmdb";

/**
 * /genres — pick a category, then open /genres/[id]
 */
export default async function GenresPage() {
  const genres = await getMovieGenres();

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 pt-24 pb-16">
      <h1 className="font-display text-4xl tracking-wide text-cream sm:text-5xl">
        Genres
      </h1>
      <p className="mt-2 max-w-md text-cream/60">
        Browse TMDB categories — each link loads popular titles in that genre.
      </p>

      <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {genres.map((genre) => (
          <li key={genre.id}>
            <Link
              href={`/genres/${genre.id}`}
              className="block rounded-sm border border-cream/15 bg-stage/60 px-4 py-3 text-sm text-cream/80 transition-colors hover:border-amber/50 hover:text-amber"
            >
              {genre.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
