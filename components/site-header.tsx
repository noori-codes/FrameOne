import Link from "next/link";
import { Search } from "lucide-react";
import { auth, signOut } from "@/auth";
import { BrandLogo } from "@/components/brand-logo";

/**
 * Full-width sticky header. `auth()` reads the session cookie on the server.
 * Search uses a plain GET form → /search?q=... (no client JS required).
 */
export async function SiteHeader() {
  const session = await auth();

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

        <form
          action="/search"
          method="get"
          className="relative mx-4 hidden min-w-0 max-w-2xl flex-1 sm:block lg:mx-8"
        >
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-cream/35"
            aria-hidden
          />
          <input
            type="search"
            name="q"
            placeholder="Search movies…"
            className="w-full rounded-full border border-cream/10 bg-stage/70 py-1.5 pr-3 pl-9 text-sm text-cream outline-none placeholder:text-cream/35 transition-[border-color,box-shadow] focus:border-amber/50 focus:ring-1 focus:ring-amber/60"
          />
        </form>

        <nav className="ml-auto flex shrink-0 items-center gap-3 text-sm text-cream/70 md:gap-5">
          <Link
            href="/search"
            className="transition-colors hover:text-cream sm:hidden"
          >
            Search
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
                className="hidden transition-colors hover:text-cream md:inline"
              >
                Profile
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-full border border-cream/20 px-3 py-1 text-cream transition-colors hover:border-amber hover:text-amber"
                >
                  Sign out
                </button>
              </form>
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
