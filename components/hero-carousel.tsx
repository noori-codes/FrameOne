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
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { TrailerButton } from "@/components/trailer-button";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  id: number;
  title: string;
  categoryLabel: string;
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

  for (let wordBoundary = 1; wordBoundary < words.length; wordBoundary += 1) {
    const firstLine = words.slice(0, wordBoundary).join(" ");
    const secondLine = words.slice(wordBoundary).join(" ");
    const difference = Math.abs(firstLine.length - secondLine.length);

    if (difference < shortestDifference) {
      splitAt = wordBoundary;
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
  /** Hover / keyboard focus inside the hero — pause without flipping the Play/Pause control. */
  const interactPauseRef = useRef(false);
  const startedAtRef = useRef(0);
  const pausedAtRef = useRef<number | null>(null);
  const elapsedBeforePauseRef = useRef(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    trailerOpenRef.current = trailerOpen;
  }, [trailerOpen]);

  const setInteractPause = useCallback((next: boolean) => {
    interactPauseRef.current = next;
  }, []);

  const setBar = useCallback((ratio: number) => {
    const el = progressRef.current;
    if (el) {
      el.style.width = `${Math.min(1, Math.max(0, ratio)) * 100}%`;
    }
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
  useLayoutEffect(() => {
    resetClock();
  }, [index, resetClock]);

  useEffect(() => {
    if (count < 2) return;

    function onKey(e: KeyboardEvent) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const root = rootRef.current;
      const active = document.activeElement;
      // Only when focus is inside the carousel (not global — avoids stealing search/inputs).
      if (!root || !active || !root.contains(active)) return;
      const tag = active instanceof HTMLElement ? active.tagName : "";
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        (active instanceof HTMLElement && active.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
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
        interactPauseRef.current ||
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
      <section className="relative flex min-h-dvh w-full flex-col justify-end overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-stage" />
        <div
          aria-hidden
          className="absolute -top-20 left-1/4 size-[28rem] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--amber)_22%,transparent),transparent_68%)] blur-3xl"
        />
        <div className="relative z-10 flex w-full flex-col px-4 pb-10 pt-16 sm:px-6 sm:pb-12 lg:px-10">
          <h1 className="max-w-xl font-display text-5xl leading-none tracking-wide text-cream uppercase sm:text-7xl">
            Movies, lit for the night
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-cream/65">
            Browse what’s playing in the culture — posters, details, and your
            list.
          </p>
          <Link
            href="#trending"
            className="cta-shine group relative mt-8 inline-flex w-fit items-center gap-2 overflow-hidden rounded-full bg-amber px-5 py-2.5 text-sm font-semibold text-(--on-amber) transition-[background-color,box-shadow] hover:bg-(--amber-dim) hover:text-cream hover:shadow-[0_14px_40px_-14px_color-mix(in_srgb,var(--amber)_70%,transparent)]"
          >
            <span className="cta-shine-beam pointer-events-none absolute inset-0" />
            <span className="relative">Start browsing</span>
          </Link>
        </div>
      </section>
    );
  }

  const titleLines = splitHeroTitle(slide.title);

  return (
    <section
      ref={rootRef}
      tabIndex={0}
      className="relative flex min-h-[min(760px,100dvh)] w-full flex-col overflow-hidden outline-none sm:min-h-[min(820px,100dvh)] lg:min-h-[min(860px,100dvh)]"
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
            className="hero-backdrop object-cover object-[center_20%]"
          />
        ) : (
          <div className="absolute inset-0 bg-stage" />
        )}
        <div className="absolute inset-0 bg-background/10" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/35 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-background/85 via-background/45 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_38%,color-mix(in_srgb,var(--amber)_16%,transparent),transparent_44%)]" />
        <div className="film-grain absolute inset-0" />
      </div>

      <div className="relative z-10 mt-auto mx-auto flex w-full max-w-screen-2xl flex-col px-4 pb-7 pt-16 sm:px-6 sm:pb-10 sm:pt-20 lg:px-8 lg:pt-18">
        <div
          key={slide.id}
          className="grid w-full items-center gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.65fr)] lg:gap-12"
        >
          <div className="w-full max-w-3xl">
            <p className="hero-line hero-line-1 mb-4 inline-flex items-center gap-2 rounded-full border border-amber/30 bg-black/25 px-3 py-1.5 text-[10px] font-semibold tracking-[0.22em] text-amber uppercase shadow-[0_10px_30px_-18px_color-mix(in_srgb,var(--amber)_40%,transparent)] backdrop-blur-md sm:text-xs">
              <Sparkles className="size-3.5" aria-hidden />
              {slide.categoryLabel}
            </p>
            {slide.tagline ? (
              <p className="hero-line hero-line-2 mb-3 text-xs leading-normal tracking-[0.2em] text-cream/60 uppercase sm:text-sm">
                {slide.tagline}
              </p>
            ) : null}

            <h1
              aria-label={slide.title}
              className="hero-line hero-line-3 line-clamp-2 min-h-[1.76em] max-w-3xl font-display text-5xl leading-[0.88] tracking-wide wrap-break-word text-cream uppercase drop-shadow-[0_10px_40px_rgba(0,0,0,0.55)] sm:text-7xl md:text-8xl lg:text-[6.75rem]"
            >
              {titleLines.map((line, lineIndex) =>
                line ? (
                  <span key={lineIndex} aria-hidden="true" className="block">
                    {line}
                  </span>
                ) : null,
              )}
            </h1>

            <p className="hero-line hero-line-4 mt-5 flex min-h-10 flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-cream/75 sm:mt-6 sm:min-h-6 sm:text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/25 bg-black/30 px-2.5 py-1 text-amber backdrop-blur-sm">
                <Star className="size-3.5 fill-current" aria-hidden />
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

            <div
              className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8"
              onPointerEnter={() => setInteractPause(true)}
              onPointerLeave={() => setInteractPause(false)}
              onFocusCapture={() => setInteractPause(true)}
              onBlurCapture={(event) => {
                const next = event.relatedTarget;
                if (
                  !(next instanceof Node) ||
                  !event.currentTarget.contains(next)
                ) {
                  setInteractPause(false);
                }
              }}
            >
              <TrailerButton
                youtubeKey={slide.trailerKey}
                movieId={slide.id}
                title={slide.title}
                label="Watch trailer"
                onOpenChange={setTrailerOpen}
              />
              <Link
                href={`/movie/${slide.id}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-cream/25 bg-black/30 px-5 py-2.5 text-sm font-medium text-cream/90 backdrop-blur-md transition-[border-color,background-color,color,transform] hover:border-cream/55 hover:bg-black/45 hover:text-cream active:scale-[0.98]"
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
              onPointerEnter={() => setInteractPause(true)}
              onPointerLeave={() => setInteractPause(false)}
              onFocus={() => setInteractPause(true)}
              onBlur={() => setInteractPause(false)}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--amber)_28%,transparent),transparent_68%)] opacity-70 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
              />
              <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-stage shadow-[0_36px_90px_-24px_rgba(0,0,0,0.95)] ring-1 ring-cream/20 transition-[transform,box-shadow,ring-color] duration-500 group-hover:-translate-y-2 group-hover:rotate-1 group-hover:ring-amber/35 group-hover:shadow-[0_40px_100px_-28px_rgba(0,0,0,0.95),0_0_40px_-16px_color-mix(in_srgb,var(--amber)_40%,transparent)] motion-reduce:transition-none">
                <Image
                  src={slide.posterUrl}
                  alt=""
                  fill
                  sizes="290px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div
                  aria-hidden
                  className="movie-card-sheen pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              </div>
            </Link>
          ) : null}
        </div>

        {count > 1 ? (
          <div className="mt-9 flex w-full items-center gap-3 border-t border-cream/10 pt-5 sm:mt-12 sm:gap-5 sm:pt-6">
            <div className="flex shrink-0 items-baseline gap-1.5 font-display tracking-wide">
              <span className="text-lg leading-none text-amber sm:text-xl">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-xs text-cream/30 sm:text-sm">/</span>
              <span className="text-xs text-cream/45 sm:text-sm">
                {String(count).padStart(2, "0")}
              </span>
            </div>

            <div
              className="flex min-w-0 flex-1 items-center gap-1 sm:gap-1.5"
              role="tablist"
              aria-label="Featured slides"
            >
              {slides.map((s, i) => {
                const isCurrent = i === index;
                const isPast = i < index;

                return (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={isCurrent}
                    aria-label={`Show ${s.title}`}
                    onClick={() => goTo(i)}
                    className="group relative h-10 min-w-0 flex-1"
                  >
                    <span
                      className={cn(
                        "absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-cream/[0.14] transition-[height,background-color,filter] duration-300 group-hover:bg-cream/30",
                        isCurrent && "h-1.5 bg-cream/[0.12]",
                        isPast && "bg-amber/25",
                      )}
                    >
                      {isPast ? (
                        <span className="absolute inset-0 rounded-full bg-amber/90" />
                      ) : null}
                      {isCurrent ? (
                        <span
                          ref={progressRef}
                          className="absolute inset-y-0 left-0 w-0 rounded-full bg-amber shadow-[0_0_12px_2px_color-mix(in_srgb,var(--amber)_45%,transparent)]"
                        />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex shrink-0 items-center gap-1 rounded-full border border-cream/12 bg-black/40 p-1 shadow-[0_12px_36px_-16px_rgba(0,0,0,0.9)] backdrop-blur-xl">
              <button
                type="button"
                aria-label={
                  isPaused ? "Play featured slides" : "Pause featured slides"
                }
                aria-pressed={isPaused}
                onClick={() => setIsPaused((paused) => !paused)}
                className={cn(
                  "inline-flex size-9 items-center justify-center rounded-full text-cream/75 transition-[color,background-color,transform] duration-200 hover:bg-cream/10 hover:text-cream active:scale-95 sm:size-10",
                  isPaused &&
                    "bg-amber/15 text-amber hover:bg-amber/20 hover:text-amber",
                )}
              >
                {isPaused ? (
                  <Play className="size-3.5 fill-current" />
                ) : (
                  <Pause className="size-3.5" />
                )}
              </button>
              <span aria-hidden className="h-4 w-px bg-cream/12" />
              <button
                type="button"
                aria-label="Previous featured movie"
                onClick={() => go(-1)}
                className="inline-flex size-9 items-center justify-center rounded-full text-cream/75 transition-[color,background-color,transform] duration-200 hover:bg-cream/10 hover:text-cream active:scale-95 sm:size-10"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Next featured movie"
                onClick={() => go(1)}
                className="inline-flex size-9 items-center justify-center rounded-full text-cream/75 transition-[color,background-color,transform] duration-200 hover:bg-cream/10 hover:text-cream active:scale-95 sm:size-10"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
