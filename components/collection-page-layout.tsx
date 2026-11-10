import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clapperboard } from "lucide-react";
import { PAGE_GUTTER } from "@/lib/layout";
import { backdropUrl, posterUrl, type TmdbMovie } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

type CollectionPageLayoutProps = {
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
  totalResults: number;
  selectionLabel: string;
  featuredMovie?: TmdbMovie;
  /** Primary controls (sort / browse kind). */
  controls: ReactNode;
  /** Optional secondary rail (genre chips). */
  secondaryControls?: ReactNode;
  children: ReactNode;
};

/**
 * Shared cinematic collection shell — hero + one toolbar + full-bleed grid.
 */
export function CollectionPageLayout({
  title,
  description,
  backHref,
  backLabel,
  totalResults,
  selectionLabel,
  featuredMovie,
  controls,
  secondaryControls,
  children,
}: CollectionPageLayoutProps) {
  const featuredBackdrop = backdropUrl(featuredMovie?.backdrop_path ?? null);
  const featuredPoster = posterUrl(featuredMovie?.poster_path ?? null, "w500");

  return (
    <main className="relative flex min-h-dvh w-full flex-1 flex-col">
      <section className="relative isolate overflow-hidden border-b border-cream/8 bg-stage">
        {featuredBackdrop ? (
          <Image
            src={featuredBackdrop}
            alt=""
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 -z-20 object-cover object-[center_20%] opacity-45"
          />
        ) : null}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-r from-background via-background/88 to-background/40"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-t from-background via-background/25 to-background/40"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_82%_36%,color-mix(in_srgb,var(--amber)_14%,transparent),transparent_46%)]"
        />

        <div
          className={cn(
            "grid min-h-[min(52vh,420px)] w-full grid-cols-1 items-end gap-8 pb-10 pt-8 sm:min-h-[min(48vh,460px)] sm:pb-12 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(200px,14vw)] lg:items-center lg:py-14",
            PAGE_GUTTER,
          )}
        >
          <div className="relative z-10 max-w-4xl">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 text-sm text-cream/55 transition-colors duration-300 hover:text-amber"
            >
              <ArrowLeft className="size-4" aria-hidden />
              {backLabel}
            </Link>

            <h1 className="mt-6 max-w-4xl font-display text-6xl leading-[0.88] tracking-wide wrap-break-word text-cream uppercase drop-shadow-[0_8px_30px_rgba(0,0,0,0.55)] sm:mt-8 sm:text-8xl md:text-9xl">
              {title}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-cream/65 sm:mt-5 sm:text-base">
              {description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-cream/50 sm:text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-cream/12 bg-black/30 px-3 py-1.5 backdrop-blur-md">
                <Clapperboard className="size-3.5 text-amber" aria-hidden />
                {totalResults.toLocaleString()} titles
              </span>
              <span className="text-cream/25" aria-hidden>
                ·
              </span>
              <span className="tracking-wide text-cream/55">{selectionLabel}</span>
            </div>
          </div>

          {featuredMovie && featuredPoster ? (
            <Link
              href={`/movie/${featuredMovie.id}`}
              aria-label={`View ${featuredMovie.title}`}
              className="group relative hidden w-full justify-self-end lg:block"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--amber)_22%,transparent),transparent_68%)] opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
              />
              <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-stage shadow-[0_36px_80px_-24px_rgba(0,0,0,0.95)] ring-1 ring-cream/20 transition-[transform,box-shadow,ring-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5 group-hover:ring-amber/35">
                <Image
                  src={featuredPoster}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 14vw, 208px"
                  className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-amber uppercase">
                    Featured
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm font-medium text-cream">
                    {featuredMovie.title}
                  </p>
                </div>
              </div>
            </Link>
          ) : null}
        </div>
      </section>

      <section
        aria-label="Collection filters"
        className="sticky top-14 z-20 border-b border-cream/8 bg-background/80 backdrop-blur-2xl sm:top-16"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-amber/25 to-transparent"
        />
        <div
          className={cn(
            "flex w-full flex-col gap-3 py-3.5 sm:py-4",
            PAGE_GUTTER,
          )}
        >
          {secondaryControls ? (
            <div className="min-w-0">{secondaryControls}</div>
          ) : null}
          <div className="flex items-center justify-end gap-3">{controls}</div>
        </div>
      </section>

      <section className={cn("w-full flex-1 py-8 sm:py-10", PAGE_GUTTER)}>
        {children}
      </section>
    </main>
  );
}
