import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clapperboard } from "lucide-react";
import { backdropUrl, posterUrl, type TmdbMovie } from "@/lib/tmdb";

type GenreSplitLayoutProps = {
  title: string;
  description: string;
  totalResults: number;
  selectionLabel: string;
  featuredMovie?: TmdbMovie;
  genreNav: ReactNode;
  sortNav: ReactNode;
  mobileGenreNav: ReactNode;
  children: ReactNode;
};

/**
 * Two-column genre studio — cover-backed identity rail + scrolling poster field.
 */
export function GenreSplitLayout({
  title,
  description,
  totalResults,
  selectionLabel,
  featuredMovie,
  genreNav,
  sortNav,
  mobileGenreNav,
  children,
}: GenreSplitLayoutProps) {
  const cover =
    posterUrl(featuredMovie?.poster_path ?? null, "w780") ??
    backdropUrl(featuredMovie?.backdrop_path ?? null);
  const featuredHref = featuredMovie
    ? `/movie/${featuredMovie.id}`
    : null;

  return (
    <main className="relative flex min-h-dvh w-full flex-1 flex-col bg-background">
      {/* Mobile top band with cover background */}
      <header className="relative isolate overflow-hidden border-b border-cream/8 lg:hidden">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 -z-20 object-cover object-center opacity-45"
          />
        ) : null}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-t from-background via-background/75 to-background/45"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_30%_0%,color-mix(in_srgb,var(--amber)_14%,transparent),transparent_50%)]"
        />

        <div className="relative px-5 pt-6 pb-5 sm:px-6">
          <Link
            href="/genres"
            className="inline-flex items-center gap-2 text-sm text-cream/70 transition-colors hover:text-amber"
          >
            <ArrowLeft className="size-4" aria-hidden />
            All genres
          </Link>
          <h1 className="mt-4 font-display text-5xl leading-[0.9] tracking-wide text-cream uppercase drop-shadow-[0_8px_28px_rgba(0,0,0,0.55)] sm:text-6xl">
            {title}
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-cream/70">
            {description}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-cream/55">
            <span className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-black/35 px-3 py-1.5 backdrop-blur-md">
              <Clapperboard className="size-3.5 text-amber" aria-hidden />
              {totalResults.toLocaleString()} titles
            </span>
            <span>·</span>
            <span>{selectionLabel}</span>
          </div>
          {featuredMovie && featuredHref ? (
            <Link
              href={featuredHref}
              className="mt-4 inline-flex text-[11px] font-semibold tracking-[0.16em] text-amber uppercase transition-opacity hover:opacity-80"
            >
              Featured · {featuredMovie.title}
            </Link>
          ) : null}
        </div>
        <div className="relative sticky top-14 z-20 border-t border-cream/8 bg-background/85 px-5 py-3 backdrop-blur-2xl sm:top-16 sm:px-6">
          <div className="mb-3 min-w-0">{mobileGenreNav}</div>
          <div className="flex justify-end">{sortNav}</div>
        </div>
      </header>

      <div className="relative mx-auto grid w-full flex-1 lg:grid-cols-[minmax(280px,22rem)_minmax(0,1fr)] xl:grid-cols-[minmax(300px,24rem)_minmax(0,1fr)]">
        {/* Left rail — cover as full background */}
        <aside className="relative hidden border-r border-cream/8 lg:block">
          <div className="sticky top-16 h-[calc(100dvh-4rem)] overflow-hidden">
            {cover ? (
              <Image
                src={cover}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 24rem, 22rem"
                className="absolute inset-0 object-cover object-center"
              />
            ) : (
              <div className="absolute inset-0 bg-stage" />
            )}
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-t from-background via-background/78 to-background/35"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-r from-background/40 via-transparent to-background/55"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_srgb,var(--amber)_16%,transparent),transparent_55%)]"
            />

            <div className="relative z-10 flex h-full flex-col px-6 py-8 xl:px-8 xl:py-10">
              <Link
                href="/genres"
                className="inline-flex w-fit items-center gap-2 text-sm text-cream/75 transition-colors duration-300 hover:text-amber"
              >
                <ArrowLeft className="size-4" aria-hidden />
                All genres
              </Link>

              <h1 className="mt-8 font-display text-5xl leading-[0.88] tracking-wide wrap-break-word text-cream uppercase drop-shadow-[0_10px_32px_rgba(0,0,0,0.65)] xl:text-6xl">
                {title}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-cream/75 drop-shadow-[0_4px_16px_rgba(0,0,0,0.55)]">
                {description}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-cream/60">
                <span className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-black/40 px-3 py-1.5 backdrop-blur-md">
                  <Clapperboard className="size-3.5 text-amber" aria-hidden />
                  {totalResults.toLocaleString()} titles
                </span>
                <span className="text-cream/30">·</span>
                <span className="tracking-wide">{selectionLabel}</span>
              </div>

              {featuredMovie && featuredHref ? (
                <Link
                  href={featuredHref}
                  className="mt-5 inline-flex max-w-full flex-col gap-0.5 rounded-xl border border-cream/12 bg-black/35 px-3.5 py-2.5 backdrop-blur-md transition-[border-color,background-color] duration-300 hover:border-amber/35 hover:bg-black/50"
                >
                  <span className="text-[10px] font-semibold tracking-[0.18em] text-amber uppercase">
                    Cover title
                  </span>
                  <span className="line-clamp-2 text-sm font-medium text-cream">
                    {featuredMovie.title}
                  </span>
                </Link>
              ) : null}

              <div className="mt-6 shrink-0">{sortNav}</div>

              <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:thin]">
                <p className="mb-2.5 text-[10px] font-semibold tracking-[0.2em] text-cream/45 uppercase">
                  Genres
                </p>
                <div className="rounded-2xl border border-cream/10 bg-black/35 p-1.5 backdrop-blur-md">
                  {genreNav}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right field */}
        <section className="relative min-w-0 bg-background/80 px-5 py-7 sm:px-6 sm:py-8 lg:bg-background/90 lg:px-8 lg:py-10 xl:px-10">
          {children}
        </section>
      </div>
    </main>
  );
}
