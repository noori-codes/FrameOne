"use client";

import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { TrailerButton } from "@/components/trailer-button";

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

/**
 * Full-bleed hero that cycles a few daily-picked movies.
 * Prev / next + dots; light auto-advance (paused when tab is hidden).
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
      timer = setInterval(() => go(1), 9000);
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
  }, [count, go, trailerOpen]);

  if (!slide) {
    return (
      <section className="relative flex min-h-dvh w-full flex-col justify-end">
        <div aria-hidden className="absolute inset-0 bg-stage" />
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-start px-6 pt-28 pb-16 sm:px-8 sm:pb-20 lg:px-10">
          <h1 className="max-w-xl font-display text-5xl leading-none tracking-wide text-cream sm:text-7xl">
            Movies, lit for the night
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-cream/65">
            Browse what’s playing in the culture — posters, details, and your
            list.
          </p>
          <Link
            href="#trending"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-medium text-[#1a1208] transition-colors hover:bg-(--amber-dim) hover:text-cream"
          >
            Start browsing
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative flex min-h-dvh w-full flex-col justify-end"
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
            className="hero-drift object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-stage" />
        )}
        <div className="absolute inset-0 bg-background/50" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/55 to-background/25" />
        <div className="absolute inset-0 bg-linear-to-r from-background/60 via-transparent to-transparent" />
        <div className="film-grain absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-start px-6 pt-28 pb-16 sm:px-8 sm:pb-20 lg:px-10">
        <div
          key={slide.id}
          className="w-full max-w-3xl animate-[heroFade_400ms_ease-out]"
        >
          {slide.tagline ? (
            <p className="mb-3 max-w-xl text-xs tracking-[0.28em] text-cream/55 uppercase">
              {slide.tagline}
            </p>
          ) : null}
          <h1 className="max-w-3xl font-display text-6xl leading-[0.9] tracking-wide text-cream sm:text-7xl md:text-8xl">
            {slide.title}
          </h1>
          {slide.meta ? (
            <p className="mt-4 max-w-xl text-sm text-cream/60 sm:text-base">
              {slide.meta}
            </p>
          ) : null}
          <p className="mt-4 line-clamp-3 max-w-lg text-sm leading-relaxed text-cream/55 sm:text-base">
            {slide.overview}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <TrailerButton
              youtubeKey={slide.trailerKey}
              title={slide.title}
              label="Watch trailer"
              onOpenChange={setTrailerOpen}
            />
            <Link
              href={`/movie/${slide.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-cream/30 bg-black/20 px-5 py-2.5 text-sm text-cream/85 backdrop-blur-sm transition-colors hover:border-cream/50 hover:text-cream"
            >
              <Info className="h-4 w-4" aria-hidden />
              More info
            </Link>
          </div>
        </div>

        {count > 1 ? (
          <div className="mt-10 flex w-full max-w-3xl items-center justify-between gap-4">
            <div className="flex items-center gap-2" role="tablist" aria-label="Hero slides">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Show ${s.title}`}
                  onClick={() => setIndex(i)}
                  className={
                    i === index
                      ? "h-1.5 w-6 rounded-full bg-amber"
                      : "h-1.5 w-1.5 rounded-full bg-cream/35 transition-colors hover:bg-cream/60"
                  }
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="mr-1 text-xs tabular-nums text-cream/40">
                {index + 1} / {count}
              </span>
              <button
                type="button"
                aria-label="Previous featured movie"
                onClick={() => go(-1)}
                className="rounded-full border border-cream/25 p-2 text-cream/80 transition-colors hover:border-cream/45 hover:text-cream"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next featured movie"
                onClick={() => go(1)}
                className="rounded-full border border-cream/25 p-2 text-cream/80 transition-colors hover:border-cream/45 hover:text-cream"
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
