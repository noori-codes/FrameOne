"use client";

import { Loader2, Search as SearchIcon, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { MovieCard } from "@/components/movie-card";
import type { PaginatedSearch, SearchHit } from "@/lib/tmdb";

const DEBOUNCE_MS = 350;

type SearchExperienceProps = {
  initialQuery?: string;
  initialPage?: number;
  initialData?: PaginatedSearch | null;
};

function syncUrl(query: string, page: number) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  const next = qs ? `/search?${qs}` : "/search";
  window.history.replaceState(null, "", next);
}

/**
 * Live search — debounced fetch, no full page reload.
 * URL stays shareable via replaceState.
 */
export function SearchExperience({
  initialQuery = "",
  initialPage = 1,
  initialData = null,
}: SearchExperienceProps) {
  const [input, setInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery.trim());
  const [page, setPage] = useState(initialPage);
  const [results, setResults] = useState<SearchHit[]>(
    initialData?.results ?? [],
  );
  const [totalPages, setTotalPages] = useState(initialData?.totalPages ?? 0);
  const [totalResults, setTotalResults] = useState(
    initialData?.totalResults ?? 0,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const abortRef = useRef<AbortController | null>(null);
  /** Skip the first effect tick so SSR initial results aren’t immediately re-fetched. */
  const skipFirstDebounce = useRef(true);

  const fetchPage = useCallback(async (q: string, nextPage: number) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!q) {
      setResults([]);
      setTotalPages(0);
      setTotalResults(0);
      setLoading(false);
      setError(null);
      syncUrl("", 1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/search/movies?q=${encodeURIComponent(q)}&page=${nextPage}`,
        { signal: controller.signal },
      );
      if (!res.ok) throw new Error("Search failed");
      const data = (await res.json()) as PaginatedSearch;
      if (controller.signal.aborted) return;

      startTransition(() => {
        setResults(data.results);
        setTotalPages(data.totalPages);
        setTotalResults(data.totalResults);
        setPage(data.page);
      });
      syncUrl(q, data.page);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError("Couldn’t search right now. Try again.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  // Debounce typing → query
  useEffect(() => {
    const trimmed = input.trim();

    if (skipFirstDebounce.current) {
      skipFirstDebounce.current = false;
      if (trimmed === initialQuery.trim()) return;
    }

    const id = window.setTimeout(() => {
      setQuery(trimmed);
      setPage(1);
      void fetchPage(trimmed, 1);
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(id);
  }, [input, fetchPage, initialQuery]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  function goToPage(next: number) {
    if (next < 1 || next > totalPages || next === page || !query) return;
    setPage(next);
    void fetchPage(query, next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <div className="mt-7 flex w-full max-w-xl flex-col gap-3 sm:mt-9">
        <label className="relative min-w-0 w-full">
          <span className="sr-only">Title</span>
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-cream/35"
            aria-hidden
          />
          <input
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Movie or series title…"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            aria-busy={loading}
            className="w-full rounded-full border border-cream/12 bg-cream/[0.035] py-3 pr-11 pl-11 text-sm text-cream outline-none transition-[border-color,box-shadow,background-color] placeholder:text-cream/25 focus:border-amber/50 focus:bg-cream/[0.055] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--amber)_16%,transparent)]"
          />
          {input ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setInput("");
                setQuery("");
                setPage(1);
                void fetchPage("", 1);
              }}
              className="absolute top-1/2 right-3 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-cream/40 transition-colors hover:bg-cream/10 hover:text-cream/75"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
          {loading ? (
            <Loader2
              className="pointer-events-none absolute top-1/2 right-11 size-4 -translate-y-1/2 animate-spin text-amber/70"
              aria-hidden
            />
          ) : null}
        </label>
      </div>

      <div aria-live="polite">
        {error ? (
          <p className="mt-10 text-sm text-red-300" role="alert">
            {error}
          </p>
        ) : null}

        {!query ? (
          <p className="mt-14 rounded-2xl border border-cream/10 bg-cream/[0.02] px-5 py-8 text-center text-cream/50">
            Type a movie or series title to start.
          </p>
        ) : !loading && results.length === 0 ? (
          <p className="mt-14 rounded-2xl border border-cream/10 bg-cream/[0.02] px-5 py-8 text-center text-cream/50">
            No results for{" "}
            <span className="text-cream/80">&ldquo;{query}&rdquo;</span>.
          </p>
        ) : (
          <>
            <p className="mt-10 flex items-center gap-2 text-sm text-cream/55">
              {loading ? (
                <span className="inline-flex items-center gap-2 text-cream/45">
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  Searching…
                </span>
              ) : (
                <>
                  Showing page {page} for{" "}
                  <span className="text-cream/80">&ldquo;{query}&rdquo;</span>
                  {` · ${totalResults.toLocaleString()} total`}
                </>
              )}
            </p>
            <ul
              className={`mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5 md:grid-cols-5 lg:grid-cols-6 ${loading ? "opacity-60" : ""}`}
            >
              {results.map((hit) => (
                <li key={`${hit.mediaType}-${hit.id}`}>
                  <MovieCard
                    id={hit.id}
                    title={hit.title}
                    posterPath={hit.poster_path}
                    voteAverage={hit.vote_average}
                    mediaType={hit.mediaType}
                    showMediaBadge
                    showTitle
                  />
                </li>
              ))}
            </ul>

            {totalPages > 1 ? (
              <nav
                className="mt-8 flex items-center justify-between gap-2 border-t border-cream/10 pt-5 sm:mt-10 sm:gap-4 sm:pt-6"
                aria-label="Pagination"
              >
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => goToPage(page - 1)}
                  className="min-h-10 rounded-full border border-cream/20 px-3 py-1.5 text-sm text-cream transition-colors hover:border-amber hover:text-amber disabled:cursor-not-allowed disabled:opacity-30 sm:px-4"
                >
                  <span className="sm:hidden">← Prev</span>
                  <span className="hidden sm:inline">← Previous</span>
                </button>
                <p className="shrink-0 text-xs tabular-nums text-cream/50 sm:text-sm">
                  {page} / {totalPages}
                </p>
                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => goToPage(page + 1)}
                  className="min-h-10 rounded-full border border-cream/20 px-3 py-1.5 text-sm text-cream transition-colors hover:border-amber hover:text-amber disabled:cursor-not-allowed disabled:opacity-30 sm:px-4"
                >
                  <span className="sm:hidden">Next →</span>
                  <span className="hidden sm:inline">Next →</span>
                </button>
              </nav>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
