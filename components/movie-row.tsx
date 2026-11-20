"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
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
  /** Mount favorite hearts (signed-in only). */
  showFavorite?: boolean;
};

/**
 * Horizontal poster row — CSS scroll-snap with prev/next.
 * Scrollbar is hidden; browse with trackpad/touch or the arrows.
 */
export function MovieRow({
  id,
  title,
  subtitle,
  movies,
  href,
  mediaType = "movie",
  favoriteIds,
  showFavorite = false,
}: MovieRowProps) {
  const row = movies;
  const favoriteSet =
    favoriteIds && favoriteIds.length > 0 ? new Set(favoriteIds) : null;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateButtons = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < max - 8);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateButtons();
    el.addEventListener("scroll", updateButtons, { passive: true });
    const ro = new ResizeObserver(updateButtons);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateButtons);
      ro.disconnect();
    };
  }, [updateButtons, row.length]);

  const scrollPage = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = Math.max(el.clientWidth * 0.85, 280) * dir;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }, []);

  if (row.length === 0) return null;

  const navBtn =
    "inline-flex size-9 items-center justify-center rounded-full border border-cream/15 bg-cream/[0.03] text-cream/80 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.8)] backdrop-blur-md transition-[border-color,color,background-color,box-shadow,transform] hover:border-amber/45 hover:bg-amber/10 hover:text-amber hover:shadow-[0_10px_28px_-14px_color-mix(in_srgb,var(--amber)_45%,transparent)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:border-cream/15 disabled:hover:bg-cream/[0.03] disabled:hover:text-cream/80 disabled:hover:shadow-none";

  return (
    <section
      id={id}
      aria-label={title}
      className="row-reveal scroll-mt-24 space-y-5 sm:space-y-6"
    >
      <div className="flex items-end justify-between gap-3 px-5 sm:gap-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="min-w-0">
          <h2 className="font-display text-2xl tracking-tight text-cream sm:text-3xl md:text-4xl">
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
        ref={scrollerRef}
        className="movie-row-scroller overflow-x-auto overscroll-x-contain px-5 pt-2 pb-5 sm:px-8 lg:px-12 xl:px-16"
      >
        <ul className="flex snap-x snap-mandatory gap-3 sm:gap-3.5 lg:gap-4">
          {row.map((movie) => (
            <li
              key={movie.id}
              className={cn(
                "min-w-0 shrink-0 grow-0 basis-[9.75rem] snap-start sm:basis-48 md:basis-56 lg:basis-[15.5rem] xl:basis-[17rem]",
              )}
            >
              <MovieCard
                id={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
                voteAverage={movie.vote_average}
                mediaType={mediaType}
                showFavorite={showFavorite}
                initialFavorite={favoriteSet?.has(movie.id) ?? false}
                sizes="(max-width: 640px) 156px, (max-width: 768px) 192px, (max-width: 1024px) 224px, (max-width: 1280px) 248px, 272px"
              />
            </li>
          ))}
          <li
            aria-hidden
            className="w-3 shrink-0 grow-0 basis-3 sm:w-5 sm:basis-5"
          />
        </ul>
      </div>
    </section>
  );
}
