"use client";

import {
  ChevronLeft,
  ChevronRight,
  Info,
  Pause,
  Play,
  Sparkles,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { TrailerButton } from "@/components/trailer-button";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  id: number;
  title: string;
  overview: string;
  tagline: string | null;
  backdropUrl: string | null;
  posterUrl: string | null;
  meta: string;
  rating: number;
  /** YouTube key from TMDB videos (null if none). */
  trailerKey: string | null;
};

type HeroCarouselProps = {
  slides: HeroSlide[];
};

/** Every slide stays this long — progress bar and advance share the same clock. */
const AUTO_MS = 9000;

function splitHeroTitle(title: string): [string, string | null] {
  const words = title.trim().split(/\s+/);
  if (words.length < 2) return [title, null];

  let splitAt = 1;
  let shortestDifference = Infinity;

  for (let i = 1; i < words.length; i += 1) {
    const firstLine = words.slice(0, i).join(" ");
    const secondLine = words.slice(i).join(" ");
    const difference = Math.abs(firstLine.length - secondLine.length);

    if (difference < shortestDifference) {
      splitAt = i;
      shortestDifference = difference;
    }
  }

  return [words.slice(0, splitAt).join(" "), words.slice(splitAt).join(" ")];
}

/**
 * Full-bleed hero that cycles a few daily-picked movies.
 */
export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const count = slides.length;
  const slide = slides[index] ?? null;

  const trailerOpenRef = useRef(trailerOpen);
  const startedAtRef = useRef(0);
  const pausedAtRef = useRef<number | null>(null);
  const elapsedBeforePauseRef = useRef(0);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trailerOpenRef.current = trailerOpen;
  }, [trailerOpen]);

  const setBar = useCallback((ratio: number) => {
    const el = progressRef.current;
    if (el) el.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
  }, []);

  const resetClock = useCallback(
    (now = performance.now()) => {
      startedAtRef.current = now;
      elapsedBeforePauseRef.current = 0;
      pausedAtRef.current = null;
      setBar(0);
    },
    [setBar],
  );

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

  // Restart the shared clock whenever the slide changes (auto or manual).
  useEffect(() => {
    resetClock();
  }, [index, resetClock]);

  useEffect(() => {
    if (count < 2) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, go]);

  // Single rAF clock — progress fill + slide advance stay locked together.
  useEffect(() => {
    if (count < 2) return;

    let raf = 0;

    function tick(now: number) {
      const paused =
        isPaused ||
        trailerOpenRef.current ||
        (typeof document !== "undefined" && document.hidden);

      if (paused) {
        if (pausedAtRef.current == null) {
          pausedAtRef.current = now;
          elapsedBeforePauseRef.current = Math.min(
            AUTO_MS,
            Math.max(0, now - startedAtRef.current),
          );
        }
        setBar(elapsedBeforePauseRef.current / AUTO_MS);
        raf = requestAnimationFrame(tick);
        return;
      }

      if (pausedAtRef.current != null) {
        startedAtRef.current = now - elapsedBeforePauseRef.current;
        pausedAtRef.current = null;
      }

      const elapsed = now - startedAtRef.current;

      if (elapsed >= AUTO_MS) {
        resetClock(now);
        setIndex((i) => (i + 1) % count);
        raf = requestAnimationFrame(tick);
        return;
      }

      setBar(elapsed / AUTO_MS);
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [count, isPaused, resetClock, setBar]);

  if (!slide) {
    return (
      <section className="relative flex min-h-dvh w-full flex-col justify-end">
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
            className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-sm font-medium text-(--on-amber) transition-colors hover:bg-(--amber-dim) hover:text-cream"
          >
            Start browsing
          </Link>
        </div>
      </section>
    );
  }

  const titleLines = splitHeroTitle(slide.title);

  return (
    <section
      className="relative flex min-h-[min(760px,100dvh)] w-full flex-col overflow-hidden sm:min-h-[min(820px,100dvh)] lg:min-h-[min(860px,100dvh)]"
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
        <div className="absolute inset-0 bg-background/10" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/30 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-background/80 via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_76%_42%,rgba(47,230,200,0.12),transparent_42%)]" />
        <div className="film-grain absolute inset-0" />
      </div>

      <div className="relative z-10 mt-auto mx-auto flex w-full max-w-screen-2xl flex-col px-4 pb-7 pt-16 sm:px-6 sm:pb-10 sm:pt-20 lg:px-8 lg:pt-18">
        <div
          key={slide.id}
          className="grid w-full items-center gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.65fr)] lg:gap-12"
        >
          <div className="w-full max-w-3xl">
            <p className="hero-line hero-line-1 mb-4 inline-flex items-center gap-2 rounded-full border border-amber/30 bg-background/30 px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] text-amber uppercase backdrop-blur-sm sm:text-xs">
              <Sparkles className="size-3.5" aria-hidden />
              Today’s featured film
            </p>
            <p className="hero-line hero-line-2 mb-3 min-h-[1.5em] text-xs leading-normal tracking-[0.2em] text-cream/60 uppercase sm:text-sm">
              {slide.tagline}
            </p>

            <h1
              aria-label={slide.title}
              className="hero-line hero-line-3 line-clamp-2 min-h-[1.76em] max-w-3xl font-display text-5xl leading-[0.88] tracking-wide wrap-break-word text-cream uppercase drop-shadow-[0_8px_30px_rgba(0,0,0,0.5)] sm:text-7xl md:text-8xl lg:text-[6.75rem]"
            >
              {titleLines.map((line, i) =>
                line ? (
                  <span key={i} aria-hidden="true" className="block">
                    {line}
                  </span>
                ) : null,
              )}
            </h1>

            <p className="hero-line hero-line-4 mt-5 flex min-h-10 flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-cream/75 sm:mt-6 sm:min-h-6 sm:text-sm">
              <span className="inline-flex items-center gap-1.5 text-amber">
                <Star className="size-4 fill-current" aria-hidden />
                {slide.rating.toFixed(1)}
              </span>
              {slide.meta
                ? slide.meta.split(" · ").map((item, i) => (
                    <span
                      key={`${item}-${i}`}
                      className="inline-flex items-center gap-2.5"
                    >
                      <span aria-hidden className="text-cream/30">
                        ·
                      </span>
                      {item}
                    </span>
                  ))
                : null}
            </p>

            <p className="hero-line hero-line-5 mt-4 line-clamp-3 min-h-18 max-w-xl text-sm leading-relaxed text-cream/75 sm:mt-5 sm:min-h-21 sm:text-base sm:leading-7">
              {slide.overview}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
              <TrailerButton
                youtubeKey={slide.trailerKey}
                title={slide.title}
                label="Watch trailer"
                onOpenChange={setTrailerOpen}
                className="shadow-[0_10px_30px_-12px_rgba(47,230,200,0.6)]"
              />
              <Link
                href={`/movie/${slide.id}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-cream/30 bg-black/25 px-5 py-2.5 text-sm text-cream/90 backdrop-blur-sm transition-[border-color,background-color,color] hover:border-cream/60 hover:bg-black/40 hover:text-cream"
              >
                <Info className="h-4 w-4" aria-hidden />
                More info
              </Link>
            </div>
          </div>

          {slide.posterUrl ? (
            <Link
              href={`/movie/${slide.id}`}
              aria-label={`View details for ${slide.title}`}
              className="group relative mx-auto hidden w-full max-w-64 justify-self-center lg:block"
            >
              <div className="relative aspect-2/3 overflow-hidden rounded-sm bg-stage shadow-[0_32px_90px_-24px_rgba(0,0,0,0.9)] ring-1 ring-white/25 transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-1 motion-reduce:transition-none">
                <Image
                  src={slide.posterUrl}
                  alt=""
                  fill
                  sizes="290px"
                  unoptimized
                  className="object-cover"
                />
              </div>
            </Link>
          ) : null}
        </div>

        {count > 1 ? (
          <div className="mt-9 flex w-full items-center gap-4 border-t border-cream/15 pt-5 sm:mt-12 sm:gap-6 sm:pt-6">
            <span className="shrink-0 text-xs font-medium tracking-[0.18em] text-cream/65 uppercase">
              <span className="text-amber">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="mx-2 text-cream/30">/</span>
              {String(count).padStart(2, "0")}
            </span>
            <div
              className="flex min-w-0 flex-1 items-center gap-2.5"
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
                  className={cn("group relative h-8 min-w-0 flex-1")}
                >
                  <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-cream/20 transition-colors group-hover:bg-cream/40">
                    {i === index ? (
                      <span
                        ref={progressRef}
                        className="absolute inset-0 origin-left scale-x-0 bg-amber"
                      />
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                aria-label={
                  isPaused ? "Play featured slides" : "Pause featured slides"
                }
                aria-pressed={isPaused}
                onClick={() => setIsPaused((paused) => !paused)}
                className="inline-flex size-11 items-center justify-center rounded-full border border-cream/25 bg-background/20 text-cream/80 backdrop-blur-sm transition-colors hover:border-amber/60 hover:text-amber"
              >
                {isPaused ? (
                  <Play className="size-4" />
                ) : (
                  <Pause className="size-4" />
                )}
              </button>
              <button
                type="button"
                aria-label="Previous featured movie"
                onClick={() => go(-1)}
                className="inline-flex size-11 items-center justify-center rounded-full border border-cream/25 bg-background/20 text-cream/80 backdrop-blur-sm transition-colors hover:border-amber/60 hover:text-amber"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next featured movie"
                onClick={() => go(1)}
                className="inline-flex size-11 items-center justify-center rounded-full border border-cream/25 bg-background/20 text-cream/80 backdrop-blur-sm transition-colors hover:border-amber/60 hover:text-amber"
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
