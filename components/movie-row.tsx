"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MovieCard } from "@/components/movie-card";
import type { MediaKind, TmdbMovie } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

type MovieRowProps = {
  id: string;
  title: string;
  subtitle?: string;
  movies: TmdbMovie[];
  /** Optional “See all” link (e.g. /genres/35). */
  href?: string;
  /** Defaults to movie; use `tv` for series rows. */
  mediaType?: MediaKind;
  favoriteIds?: number[];
};

/**
 * Horizontal poster row powered by Embla.
 * Next/prev jump by roughly a full “page” of posters (not one card at a time).
 */
export function MovieRow({
  id,
  title,
  subtitle,
  movies,
  href,
  mediaType = "movie",
  favoriteIds,
}: MovieRowProps) {
  const row = movies;
  const favoriteSet =
    favoriteIds && favoriteIds.length > 0 ? new Set(favoriteIds) : null;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
    duration: 18,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;

    function updateButtons() {
      setCanPrev(emblaApi!.canScrollPrev());
      setCanNext(emblaApi!.canScrollNext());
    }

    updateButtons();
    emblaApi.on("select", updateButtons);
    emblaApi.on("reInit", updateButtons);

    return () => {
      emblaApi.off("select", updateButtons);
      emblaApi.off("reInit", updateButtons);
    };
  }, [emblaApi]);

  const scrollPage = useCallback(
    (dir: -1 | 1) => {
      if (!emblaApi) return;

      const current = emblaApi.selectedScrollSnap();
      const visible = emblaApi.slidesInView().length;
      const step = Math.max(visible > 1 ? visible - 1 : 4, 3);
      const last = emblaApi.scrollSnapList().length - 1;
      const next = Math.min(Math.max(current + dir * step, 0), last);
      emblaApi.scrollTo(next);
    },
    [emblaApi],
  );

  if (row.length === 0) return null;

  const navBtn =
    "inline-flex size-9 items-center justify-center rounded-full border border-cream/15 bg-cream/[0.03] text-cream/80 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.8)] backdrop-blur-md transition-[border-color,color,background-color,box-shadow,transform] hover:border-amber/45 hover:bg-amber/10 hover:text-amber hover:shadow-[0_10px_28px_-14px_color-mix(in_srgb,var(--amber)_45%,transparent)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:border-cream/15 disabled:hover:bg-cream/[0.03] disabled:hover:text-cream/80 disabled:hover:shadow-none";

  return (
    <section id={id} aria-label={title} className="space-y-5 sm:space-y-6">
      <div className="flex items-end justify-between gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <h2 className="font-display text-2xl tracking-[0.04em] text-cream uppercase sm:text-3xl md:text-4xl">
            {href ? (
              <Link
                href={href}
                className="group inline-flex max-w-full items-center gap-1.5 text-cream transition-colors duration-200 hover:text-amber"
              >
                <span className="truncate">{title}</span>
                <ChevronRight
                  aria-hidden
                  strokeWidth={2.5}
                  className="size-[0.7em] shrink-0 text-cream/30 transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-amber"
                />
              </Link>
            ) : (
              title
            )}
          </h2>
          {subtitle ? (
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-cream/45 sm:text-[15px]">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="mb-0.5 flex shrink-0 items-center gap-2 sm:mb-1">
          <span
            aria-hidden
            className="hidden h-px w-8 bg-linear-to-r from-transparent to-amber/70 sm:block"
          />
          <button
            type="button"
            aria-label={`Previous ${title}`}
            disabled={!canPrev}
            onClick={() => scrollPage(-1)}
            className={navBtn}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={`Next ${title}`}
            disabled={!canNext}
            onClick={() => scrollPage(1)}
            className={navBtn}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className="overflow-hidden px-4 pt-2 pb-5 sm:px-6 lg:px-8"
        ref={emblaRef}
      >
        <ul className="flex gap-3.5 sm:gap-5">
          {row.map((movie) => (
            <li
              key={movie.id}
              className={cn(
                "min-w-0 shrink-0 grow-0 basis-30 sm:basis-39 md:basis-44",
              )}
            >
              <MovieCard
                id={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
                voteAverage={movie.vote_average}
                mediaType={mediaType}
                initialFavorite={favoriteSet?.has(movie.id) ?? false}
                sizes="(max-width: 640px) 120px, (max-width: 768px) 156px, 176px"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
