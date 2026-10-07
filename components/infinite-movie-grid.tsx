"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { MovieCard } from "@/components/movie-card";
import type { GenreSort, PaginatedMovies, TmdbMovie } from "@/lib/tmdb";

type InfiniteMovieGridProps = {
  endpoint: string;
  sort?: GenreSort;
  initial: PaginatedMovies;
};

function useGridColumns() {
  const [cols, setCols] = useState(2);

  useEffect(() => {
    const queries = [
      { mq: window.matchMedia("(min-width: 1280px)"), cols: 6 },
      { mq: window.matchMedia("(min-width: 1024px)"), cols: 5 },
      { mq: window.matchMedia("(min-width: 768px)"), cols: 4 },
      { mq: window.matchMedia("(min-width: 640px)"), cols: 3 },
    ] as const;

    function update() {
      for (const { mq, cols: n } of queries) {
        if (mq.matches) {
          setCols(n);
          return;
        }
      }
      setCols(2);
    }

    update();
    for (const { mq } of queries) {
      mq.addEventListener("change", update);
    }
    return () => {
      for (const { mq } of queries) {
        mq.removeEventListener("change", update);
      }
    };
  }, []);

  return cols;
}

/**
 * Shared poster grid for genre and browse pages.
 * Parent should key this by endpoint and sort so state resets on navigation.
 *
 * While more pages exist, incomplete last rows are held back so the grid
 * never shows empty slots that later “pop in”.
 */
export function InfiniteMovieGrid({
  endpoint,
  sort,
  initial,
}: InfiniteMovieGridProps) {
  const [movies, setMovies] = useState(initial.results);
  const [page, setPage] = useState(initial.page);
  const [totalResults] = useState(initial.totalResults);
  const [hasMore, setHasMore] = useState(initial.page < initial.totalPages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const cols = useGridColumns();

  const visibleMovies = useMemo(() => {
    if (!hasMore || cols < 2) return movies;
    const remainder = movies.length % cols;
    if (remainder === 0) return movies;
    return movies.slice(0, movies.length - remainder);
  }, [cols, hasMore, movies]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const nextPage = page + 1;
    try {
      const qs = new URLSearchParams({ page: String(nextPage) });
      if (sort) qs.set("sort", sort);
      const res = await fetch(`${endpoint}?${qs}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Couldn’t load more titles");

      const data = (await res.json()) as PaginatedMovies;
      setMovies((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const merged = [...prev];
        for (const movie of data.results) {
          if (seen.has(movie.id)) continue;
          seen.add(movie.id);
          merged.push(movie);
        }
        return merged;
      });
      setPage(data.page);
      setHasMore(data.page < data.totalPages);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Couldn’t load more titles");
    } finally {
      if (abortRef.current === controller) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, [endpoint, hasMore, page, sort]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (movies.length === 0) {
    return <p className="mt-16 text-cream/50">No movies found.</p>;
  }

  return (
    <div>
      <p className="mb-6 text-sm text-cream/40" aria-live="polite">
        Showing {visibleMovies.length.toLocaleString()}
        {totalResults > 0
          ? ` of ${totalResults.toLocaleString()} titles`
          : " titles"}
      </p>

      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {visibleMovies.map((movie: TmdbMovie) => (
          <li key={movie.id}>
            <MovieCard
              id={movie.id}
              title={movie.title}
              posterPath={movie.poster_path}
              voteAverage={movie.vote_average}
              showTitle
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 160px"
            />
          </li>
        ))}
      </ul>

      <div ref={sentinelRef} className="h-8" aria-hidden />

      <div aria-live="polite" className="sr-only">
        {loading ? "Loading more movies" : null}
      </div>

      {loading ? (
        <p className="mt-8 flex items-center justify-center gap-2 py-2 text-sm text-cream/40">
          <span
            aria-hidden
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-cream/20 border-t-amber"
          />
          <span>Loading more…</span>
        </p>
      ) : null}

      {error ? (
        <div className="mt-6 flex flex-col items-start gap-3">
          <p className="text-sm text-cream/50" role="alert">
            {error}
          </p>
          <button
            type="button"
            onClick={() => void loadMore()}
            className="rounded-full border border-cream/25 px-4 py-1.5 text-sm text-cream transition-colors hover:border-amber hover:text-amber"
          >
            Try again
          </button>
        </div>
      ) : null}

      {!hasMore && !loading ? (
        <p className="mt-10 text-center text-sm text-cream/35">
          That’s everything for now
        </p>
      ) : null}
    </div>
  );
}
