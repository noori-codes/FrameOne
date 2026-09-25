import Link from "next/link";

/**
 * Home page — Phase 1 UI shell only.
 * Real movie posters / TMDB data arrive in Phase 2.
 * Hero keeps a tight budget: brand, one headline, one line, one CTA group.
 */
export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col overflow-hidden">
      {/* Full-bleed atmosphere — replaced by real hero imagery when TMDB is wired */}
      <div
        aria-hidden
        className="film-grain pointer-events-none absolute inset-0"
      >
        <div className="hero-drift absolute inset-[-8%] bg-[radial-gradient(ellipse_at_70%_40%,#3a2a18_0%,transparent_55%),radial-gradient(ellipse_at_20%_80%,#1a1510_0%,transparent_50%),linear-gradient(160deg,#1c1410_0%,#0c0b0a_45%,#080706_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--vignette)_100%)]" />
        {/* Soft “screen” glow behind the copy */}
        <div className="absolute right-0 bottom-0 left-0 h-1/3 bg-linear-to-t from-background to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-6 pt-28 pb-16 sm:pb-24">
        <p className="mb-3 font-display text-sm tracking-[0.35em] text-amber uppercase">
          Frameone
        </p>
        <h1 className="max-w-xl font-display text-5xl leading-none tracking-wide text-cream sm:text-7xl">
          Movies, lit for the night
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-cream/65 sm:text-lg">
          Browse what’s playing in the culture — posters, details, and your list
          coming soon.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="#coming-soon"
            className="rounded-sm bg-amber px-5 py-2.5 text-sm font-medium text-[#1a1208] transition-colors hover:bg-(--amber-dim) hover:text-cream"
          >
            Start browsing
          </Link>
          <Link
            href="/signin"
            className="rounded-sm border border-cream/20 px-5 py-2.5 text-sm text-cream/80 transition-colors hover:border-cream/40 hover:text-cream"
          >
            Sign in
          </Link>
        </div>

        {/* Placeholder strip — Phase 2 fills this with real posters */}
        <section
          id="coming-soon"
          className="mt-16 border-t border-cream/10 pt-8"
          aria-label="Coming soon"
        >
          <p className="text-xs tracking-[0.25em] text-cream/40 uppercase">
            Coming next
          </p>
          <p className="mt-2 text-sm text-cream/55">
            Popular titles from TMDB will land in this row once we wire the API.
          </p>
          <div className="mt-6 flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-36 w-24 shrink-0 rounded-sm bg-stage ring-1 ring-cream/10 sm:h-44 sm:w-28"
                style={{ opacity: 1 - i * 0.12 }}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
