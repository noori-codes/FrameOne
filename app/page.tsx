import Link from "next/link";
import { auth } from "@/auth";
import { BrandLogo } from "@/components/brand-logo";
import { MovieRow } from "@/components/movie-row";
import {
  getPopularMovies,
  getTopRatedMovies,
  getTrendingMovies,
} from "@/lib/tmdb";

/**
 * Home fetches several TMDB lists in parallel with Promise.all —
 * one round-trip wait instead of three sequential awaits.
 */
export default async function Home() {
  const [popular, trending, topRated, session] = await Promise.all([
    getPopularMovies(),
    getTrendingMovies("day"),
    getTopRatedMovies(),
    auth(),
  ]);

  const user = session?.user;
  const firstName = user?.name?.split(" ")[0] ?? user?.email?.split("@")[0];

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col overflow-x-hidden">
      <div
        aria-hidden
        className="film-grain pointer-events-none absolute inset-0 min-h-dvh"
      >
        <div className="hero-drift absolute inset-[-8%] bg-[radial-gradient(ellipse_at_70%_40%,#3a2a18_0%,transparent_55%),radial-gradient(ellipse_at_20%_80%,#1a1510_0%,transparent_50%),linear-gradient(160deg,#1c1410_0%,#0c0b0a_45%,#080706_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--vignette)_100%)]" />
        <div className="absolute right-0 bottom-0 left-0 h-1/3 bg-linear-to-t from-background to-transparent" />
      </div>

      {/* Hero — first viewport */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl min-h-dvh flex-col justify-end px-6 pt-28 pb-16 sm:pb-20">
        <BrandLogo size="md" className="mb-4" priority />
        <h1 className="max-w-xl font-display text-5xl leading-none tracking-wide text-cream sm:text-7xl">
          {firstName
            ? `Welcome back, ${firstName}`
            : "Movies, lit for the night"}
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-cream/65 sm:text-lg">
          {user
            ? "Scroll the rows below — save favorites to My list anytime."
            : "Browse what’s playing in the culture — posters, details, and your list coming soon."}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="#trending"
            className="rounded-sm bg-amber px-5 py-2.5 text-sm font-medium text-[#1a1208] transition-colors hover:bg-(--amber-dim) hover:text-cream"
          >
            Start browsing
          </Link>
          {!user ? (
            <Link
              href="/signin"
              className="rounded-sm border border-cream/20 px-5 py-2.5 text-sm text-cream/80 transition-colors hover:border-cream/40 hover:text-cream"
            >
              Sign in
            </Link>
          ) : null}
        </div>
      </div>

      {/* Category rows */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 border-t border-cream/10 px-6 pt-10 pb-20">
        <MovieRow
          id="trending"
          title="Trending today"
          subtitle="What’s moving right now on TMDB."
          movies={trending}
        />
        <MovieRow
          id="popular"
          title="Popular now"
          subtitle="Widely watched titles."
          movies={popular}
        />
        <MovieRow
          id="top-rated"
          title="Top rated"
          subtitle="Highest scores on TMDB."
          movies={topRated}
        />
      </div>
    </main>
  );
}
