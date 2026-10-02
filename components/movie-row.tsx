"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { MovieCard } from "@/components/movie-card";
import type { TmdbMovie } from "@/lib/tmdb";

type MovieRowProps = {
  id: string;
  title: string;
  subtitle?: string;
  movies: TmdbMovie[];
};

/**
 * Horizontal poster row powered by Embla.
 * `"use client"` is required so Embla can attach to the DOM and handle drag/buttons.
 * Data still comes from the Server Component parent (home page).
 */
export function MovieRow({ id, title, subtitle, movies }: MovieRowProps) {
  const row = movies.slice(0, 12);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
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

  return (
    <section id={id} aria-label={title} className="space-y-6">
      <div className="flex items-end justify-between gap-4 px-6 sm:px-8 lg:px-10">
        <div>
          <h2 className="font-display text-4xl tracking-wide text-cream uppercase sm:text-5xl md:text-[3.25rem]">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1.5 text-sm text-cream/50 sm:text-base">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="mb-1 flex shrink-0 items-center gap-2">
          <span
            aria-hidden
            className="hidden h-px w-10 bg-amber/70 sm:block"
          />
          <button
            type="button"
            aria-label={`Previous ${title}`}
            disabled={!canPrev}
            onClick={() => emblaApi?.scrollPrev()}
            className="rounded-full border border-cream/20 p-2 text-cream transition-colors hover:border-amber hover:text-amber disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={`Next ${title}`}
            disabled={!canNext}
            onClick={() => emblaApi?.scrollNext()}
            className="rounded-full border border-cream/20 p-2 text-cream transition-colors hover:border-amber hover:text-amber disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden px-6 sm:px-8 lg:px-10" ref={emblaRef}>
        <ul className="flex gap-4 sm:gap-5">
          {row.map((movie) => (
            <li
              key={movie.id}
              className="min-w-0 shrink-0 grow-0 basis-34 sm:basis-39 md:basis-44"
            >
              <MovieCard
                id={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
                voteAverage={movie.vote_average}
                sizes="(max-width: 640px) 136px, (max-width: 768px) 156px, 176px"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
