import Image from "next/image";
import Link from "next/link";
import { getPopularMovies, posterUrl } from "@/lib/tmdb";

/**
 * Home is an async Server Component: it can await fetches on the server.
 * The API key never reaches the browser — only HTML + image URLs do.
 */
export default async function Home() {
  const movies = await getPopularMovies();
  const row = movies.slice(0, 12);

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="film-grain pointer-events-none absolute inset-0"
      >
        <div className="hero-drift absolute inset-[-8%] bg-[radial-gradient(ellipse_at_70%_40%,#3a2a18_0%,transparent_55%),radial-gradient(ellipse_at_20%_80%,#1a1510_0%,transparent_50%),linear-gradient(160deg,#1c1410_0%,#0c0b0a_45%,#080706_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--vignette)_100%)]" />
        <div className="absolute right-0 bottom-0 left-0 h-1/3 bg-linear-to-t from-background to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-6 pt-28 pb-16 sm:pb-24">
        <p className="mb-3 font-display text-sm tracking-[0.35em] text-amber uppercase">
          Frameone
        </p>
        <h1 className="max-w-xl font-display text-5xl leading-none tracking-wide text-cream sm:text-7xl">
          Movies, lit for the night
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-cream/65 sm:text-lg">
          Browse what’s playing in the culture — posters, details, and your list
          coming soon.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="#popular"
            className="rounded-sm bg-amber px-5 py-2.5 text-sm font-medium text-[#1a1208] transition-colors hover:bg-(--amber-dim) hover:text-cream"
          >
            Start browsing
          </Link>
          <Link
            href="/signin"
            className="rounded-sm border border-cream/20 px-5 py-2.5 text-sm text-cream/80 transition-colors hover:border-cream/40 hover:text-cream"
          >
            Sign in
          </Link>
        </div>

        <section
          id="popular"
          className="mt-16 border-t border-cream/10 pt-8"
          aria-label="Popular movies"
        >
          <p className="text-xs tracking-[0.25em] text-cream/40 uppercase">
            Popular now
          </p>
          <p className="mt-2 text-sm text-cream/55">
            Live from TMDB — fetched on the server when this page loads.
          </p>

          <ul className="mt-6 flex gap-3 overflow-x-auto pb-2">
            {row.map((movie) => {
              const src = posterUrl(movie.poster_path);
              return (
                <li
                  key={movie.id}
                  className="relative h-44 w-28 shrink-0 overflow-hidden rounded-sm bg-stage ring-1 ring-cream/10"
                >
                  {src ? (
                    <Image
                      src={src}
                      alt={movie.title}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center p-2 text-center text-xs text-cream/40">
                      {movie.title}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}
