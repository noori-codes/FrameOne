import Link from "next/link";

/**
 * Shared top bar for every page (via root layout).
 * Sign in is a placeholder route — we build real auth in a later phase.
 */
export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-display text-xl tracking-[0.2em] text-cream uppercase"
        >
          Frameone
        </Link>

        <nav className="flex items-center gap-6 text-sm text-cream/70">
          <Link href="/" className="transition-colors hover:text-cream">
            Browse
          </Link>
          <Link
            href="/signin"
            className="rounded-sm border border-cream/25 px-3 py-1.5 text-cream transition-colors hover:border-amber hover:text-amber"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
