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

/**
 * Loads home genre carousels only when the user scrolls near them
 * (or after a short idle delay) so the initial HTML stream stays light.
 */
export function DeferredGenreRows() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [rows, setRows] = useState<GenreRowPayload[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const arm = () => setShouldLoad(true);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          arm();
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);

    // Fallback so rows still appear without scrolling on short viewports.
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(arm, { timeout: 2500 });
    } else {
      timeoutId = setTimeout(arm, 1800);
    }

    return () => {
      observer.disconnect();
      if (idleId != null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!shouldLoad || rows || failed) return;

    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/home/genre-rows");
        if (!res.ok) throw new Error(`genre-rows ${res.status}`);
        const data = (await res.json()) as { rows: GenreRowPayload[] };
        if (!cancelled) setRows(data.rows ?? []);
      } catch (error) {
        console.error("Deferred genre rows failed:", error);
        if (!cancelled) setFailed(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [shouldLoad, rows, failed]);

  return (
    <div ref={rootRef} className="flex flex-col gap-14 sm:gap-24">
      {rows
        ? rows.map((genre) => (
            <MovieRow
              key={genre.id}
              id={genre.slug}
              title={genre.title}
              movies={genre.movies}
              href={`/genres/${genre.id}`}
            />
          ))
        : failed
          ? null
          : Array.from({ length: 4 }, (_, i) => <MovieRowSkeleton key={i} />)}
    </div>
  );
}
