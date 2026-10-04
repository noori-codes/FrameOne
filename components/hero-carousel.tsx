"use client";

import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { TrailerButton } from "@/components/trailer-button";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  id: number;
  title: string;
  overview: string;
  tagline: string | null;
  backdropUrl: string | null;
  meta: string;
  /** YouTube key from TMDB videos (null if none). */
  trailerKey: string | null;
};

type HeroCarouselProps = {
  slides: HeroSlide[];
};

const AUTO_MS = 9000;

/**
 * Full-bleed hero that cycles a few daily-picked movies.
 * One aligned column: copy → CTAs → progress/controls.
 */
export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const count = slides.length;
  const slide = slides[index] ?? null;

  const go = useCallback(
    (dir: -1 | 1) => {
      if (count < 2) return;
      setIndex((i) => (i + dir + count) % count);
    },
    [count],
  );

  const goTo = useCallback(
    (i: number) => {
      if (count < 2) return;
      setIndex(((i % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count < 2) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, go]);

  useEffect(() => {
    if (count < 2 || trailerOpen) return;

    let timer: ReturnType<typeof setInterval> | undefined;

    function start() {
      timer = setInterval(() => go(1), AUTO_MS);
    }

    function stop() {
      if (timer) clearInterval(timer);
    }

    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [count, go, trailerOpen, index]);

  if (!slide) {
    return (
      <section className="relative flex min-h-[calc(100dvh-3.5rem)] w-full flex-col justify-end sm:min-h-[calc(100dvh-4rem)]">
        <div aria-hidden className="absolute inset-0 bg-stage" />
        <div className="relative z-10 flex w-full flex-col px-4 pb-10 pt-16 sm:px-6 sm:pb-12 lg:px-10">
          <h1 className="max-w-xl font-display text-5xl leading-none tracking-wide text-cream sm:text-7xl">
            Movies, lit for the night
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-cream/65">
            Browse what’s playing in the culture — posters, details, and your
            list.
          </p>
          <Link
            href="#trending"
            className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-medium text-[#1a1208] transition-colors hover:bg-(--amber-dim) hover:text-cream"
          >
            Start browsing
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative flex min-h-[calc(100dvh-3.5rem)] w-full flex-col sm:min-h-[calc(100dvh-4rem)]"
      aria-roledescription="carousel"
      aria-label="Featured movies"
    >
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        {slide.backdropUrl ? (
          <Image
            key={slide.id}
            src={slide.backdropUrl}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            unoptimized
            className="hero-backdrop object-cover object-[center_20%]"
          />
        ) : (
          <div className="absolute inset-0 bg-stage" />
        )}
        <div className="absolute inset-0 bg-background/40" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-background/20" />
        <div className="absolute inset-0 bg-linear-to-r from-background/80 via-background/25 to-transparent" />
        <div className="film-grain absolute inset-0" />
      </div>

      {/* One column: copy + controls share the same left edge as the header */}
      <div className="relative z-10 mt-auto flex w-full flex-col gap-8 px-4 pb-8 pt-28 sm:gap-10 sm:px-6 sm:pb-10 lg:px-10">
        <div key={slide.id} className="w-full max-w-2xl">
          {slide.tagline ? (
            <p className="hero-line hero-line-1 mb-3 text-xs tracking-[0.28em] text-amber/80 uppercase">
              {slide.tagline}
            </p>
          ) : null}

          <h1 className="hero-line hero-line-2 font-display text-5xl leading-[0.92] tracking-wide text-cream sm:text-6xl md:text-7xl lg:text-[5.25rem]">
            {slide.title}
          </h1>

          {slide.meta ? (
            <p className="hero-line hero-line-3 mt-4 text-sm text-cream/55 sm:text-[15px]">
              {slide.meta}
            </p>
          ) : null}

          <p className="hero-line hero-line-4 mt-3 line-clamp-2 max-w-xl text-sm leading-relaxed text-cream/60 sm:text-base">
            {slide.overview}
          </p>

          <div className="hero-line hero-line-5 mt-7 flex flex-wrap items-center gap-3">
            <TrailerButton
              youtubeKey={slide.trailerKey}
              title={slide.title}
              label="Watch trailer"
              onOpenChange={setTrailerOpen}
            />
            <Link
              href={`/movie/${slide.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-cream/30 bg-black/25 px-5 py-2.5 text-sm text-cream/90 backdrop-blur-sm transition-colors hover:border-cream/50 hover:text-cream"
            >
              <Info className="h-4 w-4" aria-hidden />
              More info
            </Link>
          </div>
        </div>

        {count > 1 ? (
          <div className="flex w-full items-center gap-4 sm:gap-5">
            <div
              className="h-px min-w-0 flex-1 overflow-hidden bg-cream/15"
              aria-hidden
            >
              <div
                key={slide.id}
                className={cn(
                  "hero-progress h-full origin-left bg-amber",
                  trailerOpen && "hero-progress-paused",
                )}
              />
            </div>

            <div
              className="flex shrink-0 items-center gap-1.5"
              role="tablist"
              aria-label="Featured slides"
            >
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Show ${s.title}`}
                  onClick={() => goTo(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === index
                      ? "w-6 bg-amber"
                      : "w-1.5 bg-cream/30 hover:bg-cream/50",
                  )}
                />
              ))}
            </div>

            <span className="hidden text-xs tabular-nums text-cream/40 sm:inline">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(count).padStart(2, "0")}
            </span>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                aria-label="Previous featured movie"
                onClick={() => go(-1)}
                className="rounded-full border border-cream/25 p-2 text-cream/80 transition-colors hover:border-amber/60 hover:text-amber"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next featured movie"
                onClick={() => go(1)}
                className="rounded-full border border-cream/25 p-2 text-cream/80 transition-colors hover:border-amber/60 hover:text-amber"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
