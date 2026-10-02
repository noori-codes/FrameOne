import { Info, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MovieRow } from "@/components/movie-row";
import {
  backdropUrl,
  getMovie,
  getPopularMovies,
  getTopRatedMovies,
  getTrendingMovies,
} from "@/lib/tmdb";

/**
 * Home fetches TMDB lists in parallel, then hydrates the hero with full details
 * (runtime + genres) for the top trending title that has a backdrop.
 */
export default async function Home() {
  const [popular, trending, topRated] = await Promise.all([
    getPopularMovies(),
    getTrendingMovies("day"),
    getTopRatedMovies(),
  ]);

  const heroCandidate =
    trending.find((m) => m.backdrop_path) ??
    popular.find((m) => m.backdrop_path) ??
    trending[0] ??
    popular[0];

  const hero = heroCandidate ? await getMovie(heroCandidate.id) : null;
  const heroBackdrop = hero ? backdropUrl(hero.backdrop_path) : null;
  const heroYear = hero?.release_date?.slice(0, 4);
  const heroRuntime =
    hero?.runtime != null
      ? `${Math.floor(hero.runtime / 60)}h ${hero.runtime % 60}m`
      : null;
  const heroGenres = hero?.genres?.map((g) => g.name).join(" / ");
  const heroMeta = [
    heroYear,
    heroGenres,
    heroRuntime,
    hero ? `★ ${hero.vote_average.toFixed(1)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col overflow-x-hidden">
      {/* Full-bleed hero */}
      <section className="relative flex min-h-dvh w-full flex-col justify-end">
        <div aria-hidden className="absolute inset-0">
          {heroBackdrop ? (
            <Image
              src={heroBackdrop}
              alt=""
              fill
              priority
              sizes="100vw"
              className="hero-drift object-cover object-center"
            />
          ) : (
            <div className="hero-drift absolute inset-[-8%] bg-[radial-gradient(ellipse_at_70%_40%,#3a2a18_0%,transparent_55%),radial-gradient(ellipse_at_20%_80%,#1a1510_0%,transparent_50%),linear-gradient(160deg,#1c1410_0%,#0c0b0a_45%,#080706_100%)]" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/55 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-background/70 via-transparent to-transparent" />
          <div className="film-grain absolute inset-0" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-start px-6 pt-28 pb-16 sm:px-8 sm:pb-20 lg:px-10">
          {hero ? (
            <>
              {hero.tagline ? (
                <p className="mb-3 max-w-xl text-xs tracking-[0.28em] text-cream/55 uppercase">
                  {hero.tagline}
                </p>
              ) : null}
              <h1 className="max-w-3xl font-display text-6xl leading-[0.9] tracking-wide text-cream sm:text-7xl md:text-8xl">
                {hero.title}
              </h1>
              {heroMeta ? (
                <p className="mt-4 max-w-xl text-sm text-cream/60 sm:text-base">
                  {heroMeta}
                </p>
              ) : null}
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-cream/55 line-clamp-3 sm:text-base">
                {hero.overview}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={`/movie/${hero.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-medium text-[#1a1208] transition-colors hover:bg-(--amber-dim) hover:text-cream"
                >
                  <Play className="h-4 w-4 fill-current" aria-hidden />
                  Watch now
                </Link>
                <Link
                  href={`/movie/${hero.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-cream/30 bg-black/20 px-5 py-2.5 text-sm text-cream/85 backdrop-blur-sm transition-colors hover:border-cream/50 hover:text-cream"
                >
                  <Info className="h-4 w-4" aria-hidden />
                  More info
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="max-w-xl font-display text-5xl leading-none tracking-wide text-cream sm:text-7xl">
                Movies, lit for the night
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-cream/65">
                Browse what’s playing in the culture — posters, details, and
                your list.
              </p>
              <div className="mt-8">
                <Link
                  href="#trending"
                  className="inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-medium text-[#1a1208] transition-colors hover:bg-(--amber-dim) hover:text-cream"
                >
                  Start browsing
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Category rows — edge-to-edge with generous vertical rhythm */}
      <div className="relative z-10 flex w-full flex-col gap-20 border-t border-cream/8 pt-16 pb-24 sm:gap-24 sm:pt-20 sm:pb-28">
        <MovieRow id="trending" title="Trending now" movies={trending} />
        <MovieRow id="popular" title="Popular now" movies={popular} />
        <MovieRow id="top-rated" title="Top rated" movies={topRated} />
      </div>
    </main>
  );
}
