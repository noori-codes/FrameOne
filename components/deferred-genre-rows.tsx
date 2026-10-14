"use client";

import { useEffect, useRef, useState } from "react";
import { MovieRow } from "@/components/movie-row";
import { MovieRowSkeleton } from "@/components/skeletons";
import type { TmdbMovie } from "@/lib/tmdb";

type GenreRowPayload = {
  id: number;
  slug: string;
  title: string;
  movies: TmdbMovie[];
};

type WaveState = {
  rows: GenreRowPayload[];
  status: "idle" | "loading" | "ready" | "failed";
};

const TOTAL_WAVES = 2;
const ROWS_PER_WAVE = 4;

type DeferredGenreRowsProps = {
  favoriteIds?: number[];
};

/**
 * Loads home genre carousels in waves of 4 as the user scrolls near each batch.
 */
export function DeferredGenreRows({
  favoriteIds = [],
}: DeferredGenreRowsProps) {
  const [waves, setWaves] = useState<WaveState[]>(() =>
    Array.from({ length: TOTAL_WAVES }, () => ({
      rows: [],
      status: "idle",
    })),
  );

  function markWave(
    index: number,
    patch: Partial<WaveState> | ((prev: WaveState) => WaveState),
  ) {
    setWaves((prev) =>
      prev.map((wave, i) => {
        if (i !== index) return wave;
        return typeof patch === "function" ? patch(wave) : { ...wave, ...patch };
      }),
    );
  }

  async function loadWave(index: number) {
    markWave(index, { status: "loading" });

    try {
      const res = await fetch(`/api/home/genre-rows?wave=${index}`);
      if (!res.ok) throw new Error(`genre-rows ${res.status}`);
      const data = (await res.json()) as { rows: GenreRowPayload[] };
      markWave(index, { rows: data.rows ?? [], status: "ready" });
    } catch (error) {
      console.error(`Deferred genre wave ${index} failed:`, error);
      markWave(index, { status: "failed" });
    }
  }

  function retryWave(index: number) {
    void loadWave(index);
  }

  return (
    <div className="flex flex-col gap-14 sm:gap-24">
      {waves.map((wave, index) => {
        const previousSettled =
          index === 0 ||
          waves[index - 1]?.status === "ready" ||
          waves[index - 1]?.status === "failed";
        // Don’t mount later waves until the prior wave has settled (ready or failed).
        if (!previousSettled) return null;

        return (
          <GenreWave
            key={index}
            index={index}
            wave={wave}
            canArm={previousSettled}
            favoriteIds={favoriteIds}
            onArm={() => void loadWave(index)}
            onRetry={() => retryWave(index)}
          />
        );
      })}
    </div>
  );
}

function GenreWave({
  index,
  wave,
  canArm,
  favoriteIds,
  onArm,
  onRetry,
}: {
  index: number;
  wave: WaveState;
  canArm: boolean;
  favoriteIds: number[];
  onArm: () => void;
  onRetry: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const armedRef = useRef(false);

  useEffect(() => {
    if (!canArm || armedRef.current) return;
    if (wave.status !== "idle") return;

    const node = rootRef.current;
    if (!node) return;

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const arm = () => {
      if (armedRef.current) return;
      armedRef.current = true;
      onArm();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          arm();
          observer.disconnect();
        }
      },
      { rootMargin: index === 0 ? "400px 0px" : "280px 0px" },
    );
    observer.observe(node);

    // First wave: also arm on idle so short viewports still fill.
    if (index === 0) {
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(arm, { timeout: 2500 });
      } else {
        timeoutId = setTimeout(arm, 1800);
      }
    }

    return () => {
      observer.disconnect();
      if (idleId != null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [canArm, index, onArm, wave.status]);

  if (wave.status === "failed") {
    return (
      <div
        ref={rootRef}
        className="mx-auto flex w-full max-w-screen-2xl flex-col items-start gap-3 px-4 sm:px-6 lg:px-8"
        role="alert"
      >
        <p className="text-sm text-cream/55">
          Couldn’t load more genre rows.
        </p>
        <button
          type="button"
          onClick={() => {
            armedRef.current = true;
            onRetry();
          }}
          className="inline-flex min-h-9 items-center rounded-full border border-cream/20 bg-black/25 px-4 text-xs font-medium text-cream/85 backdrop-blur-md transition-[border-color,background-color,color] hover:border-amber/40 hover:bg-black/40 hover:text-amber"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="flex flex-col gap-14 sm:gap-24">
      {wave.status === "ready"
        ? wave.rows.map((genre) => (
            <MovieRow
              key={genre.id}
              id={genre.slug}
              title={genre.title}
              movies={genre.movies}
              href={`/genres/${genre.id}`}
              favoriteIds={favoriteIds}
            />
          ))
        : Array.from({ length: ROWS_PER_WAVE }, (_, i) => (
            <MovieRowSkeleton key={`${index}-${i}`} />
          ))}
    </div>
  );
}
