import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col justify-center px-6 py-24">
      <h1 className="font-display text-4xl tracking-tight text-cream">
        Movie not found
      </h1>
      <p className="mt-3 text-cream/60">
        That id isn’t in TMDB, or the request failed.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/#trending"
          className="w-fit text-sm text-amber transition-colors hover:text-cream"
        >
          ← Back to trending
        </Link>
        <Link
          href="/search"
          className="w-fit text-sm text-cream/55 transition-colors hover:text-amber"
        >
          Search instead
        </Link>
      </div>
    </main>
  );
}
