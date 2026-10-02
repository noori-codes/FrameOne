import Link from "next/link";
import { Search } from "lucide-react";
import { auth, signOut } from "@/auth";
import { BrandLogo } from "@/components/brand-logo";

/**
 * Floating glass header. `auth()` reads the session cookie on the server.
 * Search uses a plain GET form → /search?q=... (no client JS required).
 */
export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 px-4 pt-4 sm:px-6 sm:pt-5">
      <div className="pointer-events-auto mx-auto flex h-12 max-w-6xl items-center gap-3 rounded-full border border-cream/10 bg-background/45 px-3 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:h-14 sm:gap-4 sm:px-5">
        <Link
          href="/"
          className="shrink-0 transition-opacity hover:opacity-90"
          aria-label="FrameOne home"
        >
          <BrandLogo size="sm" withWordmark priority />
        </Link>

        <form
          action="/search"
          method="get"
          className="relative mx-auto hidden min-w-0 max-w-md flex-1 sm:block"
        >
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-cream/35"
            aria-hidden
          />
          <input
            type="search"
            name="q"
            placeholder="Search movies, actors, directors…"
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
                My list
              </Link>
              <Link
                href="/profile"
                className="hidden transition-colors hover:text-cream sm:inline"
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
