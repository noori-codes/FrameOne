"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { TmdbMovie } from "@/lib/tmdb";
import { posterUrl } from "@/lib/tmdb";

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
    <section id={id} aria-label={title}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.25em] text-cream/40 uppercase">
            {title}
          </p>
          {subtitle ? (
            <p className="mt-2 text-sm text-cream/55">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            aria-label={`Previous ${title}`}
            disabled={!canPrev}
            onClick={() => emblaApi?.scrollPrev()}
            className="rounded-sm border border-cream/20 p-1.5 text-cream transition-colors hover:border-amber hover:text-amber disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={`Next ${title}`}
            disabled={!canNext}
            onClick={() => emblaApi?.scrollNext()}
            className="rounded-sm border border-cream/20 p-1.5 text-cream transition-colors hover:border-amber hover:text-amber disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden" ref={emblaRef}>
        <ul className="flex gap-3">
          {row.map((movie) => {
            const src = posterUrl(movie.poster_path);
            return (
              <li key={movie.id} className="min-w-0 shrink-0 grow-0 basis-28">
                <Link
                  href={`/movie/${movie.id}`}
                  className="relative block h-44 w-28 overflow-hidden rounded-sm bg-stage ring-1 ring-cream/10 transition-[box-shadow,transform] hover:scale-[1.03] hover:ring-amber/50"
                >
                  {src ? (
                    <Image
                      src={src}
                      alt={movie.title}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center p-2 text-center text-xs text-cream/40">
                      {movie.title}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
