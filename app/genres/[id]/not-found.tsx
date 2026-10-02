import Link from "next/link";

export default function GenreNotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col justify-center px-6 py-24">
      <h1 className="font-display text-4xl tracking-wide text-cream">
        Genre not found
      </h1>
      <p className="mt-3 text-cream/60">That genre id isn’t in TMDB’s list.</p>
      <Link
        href="/genres"
        className="mt-8 w-fit text-sm text-amber transition-colors hover:text-cream"
      >
        ← All genres
      </Link>
    </main>
  );
}
