import Link from "next/link";
import { Search } from "lucide-react";
import { auth } from "@/auth";
import { BrandLogo } from "@/components/brand-logo";

/**
 * Full-width sticky header. `auth()` reads the session cookie on the server.
 * Search is icon-only → /search (query lives on that page).
 */
function userInitial(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "?";
  return source.charAt(0).toUpperCase();
}

export async function SiteHeader() {
  const session = await auth();
  const initial = userInitial(session?.user?.name, session?.user?.email);

  return (
    <header className="sticky top-0 z-30 border-b border-cream/10 bg-background/90 backdrop-blur-md">
      <div className="flex h-14 w-full items-center gap-4 px-4 sm:h-16 sm:gap-6 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="inline-flex h-full shrink-0 items-center transition-opacity hover:opacity-90"
          aria-label="FrameOne home"
        >
          <BrandLogo size="sm" withWordmark priority />
        </Link>

        <nav className="ml-auto flex shrink-0 items-center gap-3 text-sm text-cream/70 md:gap-5">
          <Link
            href="/search"
            aria-label="Search movies"
            className="rounded-full p-2 text-cream/70 transition-colors hover:bg-cream/5 hover:text-cream"
          >
            <Search className="h-5 w-5" strokeWidth={1.75} />
          </Link>
          <Link href="/" className="transition-colors hover:text-cream">
            Browse
          </Link>
          <Link href="/genres" className="transition-colors hover:text-cream">
            Genres
          </Link>

          {session?.user ? (
            <div className="flex items-center gap-2.5 md:gap-3">
              <Link
                href="/favorites"
                className="transition-colors hover:text-cream"
              >
                Favorites
              </Link>
              <Link
                href="/watchlist"
                className="hidden transition-colors hover:text-cream sm:inline"
              >
                Watchlist
              </Link>
              <Link
                href="/profile"
                aria-label="Profile"
                title={session.user.name ?? session.user.email ?? "Profile"}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-cream/20 bg-stage text-sm font-medium text-cream transition-colors hover:border-amber hover:text-amber"
              >
                {/* Swap for profile image later */}
                {initial}
              </Link>
            </div>
          ) : (
            <Link
              href="/signin"
              className="rounded-full border border-cream/20 px-3 py-1 text-cream transition-colors hover:border-amber hover:text-amber"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
