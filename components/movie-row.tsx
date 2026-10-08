"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MovieCard } from "@/components/movie-card";
import type { MediaKind, TmdbMovie } from "@/lib/tmdb";

type MovieRowProps = {
  id: string;
  title: string;
  subtitle?: string;
  movies: TmdbMovie[];
  /** Optional “See all” link (e.g. /genres/35). */
  href?: string;
  /** Defaults to movie; use `tv` for series rows. */
  mediaType?: MediaKind;
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
}: MovieRowProps) {
  const row = movies;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    // Snappy pages feel better for Next than dragFree one-card steps
    dragFree: false,
    // Lower = faster scroll animation (Embla default is 25)
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

  /** Jump by almost a full row of visible posters. */
  const scrollPage = useCallback(
    (dir: -1 | 1) => {
      if (!emblaApi) return;

      const current = emblaApi.selectedScrollSnap();
      const visible = emblaApi.slidesInView().length;
      // Leave one card of overlap so the move feels continuous
      const step = Math.max(visible > 1 ? visible - 1 : 4, 3);
      const last = emblaApi.scrollSnapList().length - 1;
      const next = Math.min(Math.max(current + dir * step, 0), last);
      emblaApi.scrollTo(next);
    },
    [emblaApi],
  );

  if (row.length === 0) return null;

  return (
    <section id={id} aria-label={title} className="space-y-6">
      <div className="flex items-end justify-between gap-3 px-4 sm:gap-4 sm:px-6 lg:px-10">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight text-cream sm:text-3xl md:text-4xl">
            {href ? (
              <Link
                href={href}
                className="group inline-flex max-w-full items-center gap-1 text-cream transition-colors duration-200 hover:text-amber"
              >
                <span className="truncate">{title}</span>
                <ChevronRight
                  aria-hidden
                  strokeWidth={2.5}
                  className="size-[0.85em] shrink-0 text-cream/35 transition-colors duration-200 group-hover:text-amber"
                />
              </Link>
            ) : (
              title
            )}
          </h2>
          {subtitle ? (
            <p className="mt-1.5 text-sm text-cream/50 sm:text-base">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="mb-0.5 flex shrink-0 items-center gap-1.5 sm:mb-1 sm:gap-2">
          <span
            aria-hidden
            className="hidden h-px w-10 bg-amber/70 sm:block"
          />
          <button
            type="button"
            aria-label={`Previous ${title}`}
            disabled={!canPrev}
            onClick={() => scrollPage(-1)}
            className="rounded-full border border-cream/20 p-2 text-cream transition-colors hover:border-amber hover:text-amber disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={`Next ${title}`}
            disabled={!canNext}
            onClick={() => scrollPage(1)}
            className="rounded-full border border-cream/20 p-2 text-cream transition-colors hover:border-amber hover:text-amber disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className="overflow-hidden px-4 pt-2 pb-4 sm:px-6 lg:px-10"
        ref={emblaRef}
      >
        <ul className="flex gap-3 sm:gap-5">
          {row.map((movie) => (
            <li
              key={movie.id}
              className="min-w-0 shrink-0 grow-0 basis-30 sm:basis-39 md:basis-44"
            >
              <MovieCard
                id={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
                voteAverage={movie.vote_average}
                mediaType={mediaType}
                sizes="(max-width: 640px) 120px, (max-width: 768px) 156px, 176px"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
