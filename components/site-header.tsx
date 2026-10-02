import Link from "next/link";
import { auth, signOut } from "@/auth";
import { BrandLogo } from "@/components/brand-logo";

/**
 * Shared top bar. `auth()` reads the session cookie on the server.
 * Search uses a plain GET form → /search?q=... (no client JS required).
 */
export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-6">
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
          className="mx-auto hidden min-w-0 max-w-xs flex-1 sm:block md:max-w-sm"
        >
          <input
            type="search"
            name="q"
            placeholder="Search movies…"
            className="w-full rounded-sm border border-cream/15 bg-stage/80 px-3 py-1.5 text-sm text-cream outline-none placeholder:text-cream/35 focus:border-amber/60"
          />
        </form>

        <nav className="ml-auto flex shrink-0 items-center gap-4 text-sm text-cream/70 md:gap-6">
          <Link
            href="/search"
            className="transition-colors hover:text-cream sm:hidden"
          >
            Search
          </Link>
          <Link href="/" className="transition-colors hover:text-cream">
            Browse
          </Link>

          {session?.user ? (
            <div className="flex items-center gap-3 md:gap-4">
              <Link
                href="/favorites"
                className="transition-colors hover:text-cream"
              >
                My list
              </Link>
              <span className="hidden text-cream/50 lg:inline">
                {session.user.email}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-sm border border-cream/25 px-3 py-1.5 text-cream transition-colors hover:border-amber hover:text-amber"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/signin"
              className="rounded-sm border border-cream/25 px-3 py-1.5 text-cream transition-colors hover:border-amber hover:text-amber"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
