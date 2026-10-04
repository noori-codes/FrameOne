"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MovieCard } from "@/components/movie-card";
import type { GenreSort, PaginatedMovies, TmdbMovie } from "@/lib/tmdb";

type GenreInfiniteGridProps = {
  genreId: number;
  sort: GenreSort;
  initial: PaginatedMovies;
};

/**
 * Genre poster grid — loads the next TMDB page when the sentinel enters view.
 * Parent should pass key={`${genreId}-${sort}`} so state resets on navigation.
 */
export function GenreInfiniteGrid({
  genreId,
  sort,
  initial,
}: GenreInfiniteGridProps) {
  const [movies, setMovies] = useState(initial.results);
  const [page, setPage] = useState(initial.page);
  const [totalResults] = useState(initial.totalResults);
  const [hasMore, setHasMore] = useState(initial.page < initial.totalPages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

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
      const qs = new URLSearchParams({
        page: String(nextPage),
        sort,
      });
      const res = await fetch(`/api/genres/${genreId}/movies?${qs}`, {
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
  }, [genreId, hasMore, page, sort]);

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
      { rootMargin: "320px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (movies.length === 0) {
    return (
      <p className="mt-16 text-cream/50">No movies found for this genre.</p>
    );
  }

  return (
    <div>
      <p className="mb-6 text-sm text-cream/40" aria-live="polite">
        Showing {movies.length.toLocaleString()}
        {totalResults > 0
          ? ` of ${totalResults.toLocaleString()} titles`
          : " titles"}
      </p>

      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {movies.map((movie: TmdbMovie) => (
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
          That’s everything in this genre for now
        </p>
      ) : null}
    </div>
  );
}
