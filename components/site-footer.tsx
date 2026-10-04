import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

/**
 * Site-wide footer — brand, key links, TMDB attribution.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-auto border-t border-cream/10 bg-stage/40">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 sm:px-8 sm:py-14">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm space-y-3">
            <Link
              href="/"
              className="inline-flex transition-opacity hover:opacity-90"
              aria-label="FrameOne home"
            >
              <BrandLogo size="sm" withWordmark />
            </Link>
            <p className="text-sm leading-relaxed text-cream/45">
              Discover movies with a cinematic UI — browse, save favorites, and
              build your watchlist.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-cream/55"
          >
            <Link href="/" className="transition-colors hover:text-amber">
              Browse
            </Link>
            <Link href="/genres" className="transition-colors hover:text-amber">
              Genres
            </Link>
            <Link href="/search" className="transition-colors hover:text-amber">
              Search
            </Link>
            <Link
              href="/favorites"
              className="transition-colors hover:text-amber"
            >
              Favorites
            </Link>
            <Link
              href="/watchlist"
              className="transition-colors hover:text-amber"
            >
              Watchlist
            </Link>
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-cream/8 pt-6 text-xs text-cream/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} FrameOne</p>
          <p>
            This product uses the{" "}
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/50 underline-offset-2 transition-colors hover:text-amber hover:underline"
            >
              TMDB
            </a>{" "}
            API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>
    </footer>
  );
}
