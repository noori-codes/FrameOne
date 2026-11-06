"use client";

import { Loader2, Search as SearchIcon, Sparkles, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { MovieCard } from "@/components/movie-card";
import type { PaginatedSearch, SearchHit } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 350;

type SearchExperienceProps = {
  initialQuery?: string;
  initialPage?: number;
  initialData?: PaginatedSearch | null;
  /** Trending titles for empty-state chips. */
  suggestions?: string[];
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
  suggestions = [],
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
  const inputRef = useRef<HTMLInputElement>(null);
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

  function applySuggestion(title: string) {
    setInput(title);
    setQuery(title);
    setPage(1);
    void fetchPage(title, 1);
    inputRef.current?.focus();
  }

  function clearSearch() {
    setInput("");
    setQuery("");
    setPage(1);
    void fetchPage("", 1);
    inputRef.current?.focus();
  }

  return (
    <>
      <div className="sticky top-14 z-20 border-b border-cream/8 bg-background/80 backdrop-blur-2xl sm:top-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-amber/25 to-transparent"
        />
        <div className="w-full px-5 py-4 sm:px-6 sm:py-5 lg:px-8 xl:px-10">
          <label className="relative mx-auto block w-full max-w-3xl">
            <span className="sr-only">Search titles</span>
            <SearchIcon
              className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-cream/35"
              aria-hidden
            />
            <input
              ref={inputRef}
              type="search"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search movies & series…"
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="search"
              aria-busy={loading}
              className={cn(
                "search-field w-full rounded-full border border-cream/12 bg-cream/[0.04] py-4 pl-14 text-base text-cream outline-none transition-[border-color,box-shadow,background-color] duration-300 placeholder:text-cream/28 focus:border-amber/45 focus:bg-cream/[0.06] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--amber)_14%,transparent),0_18px_48px_-24px_rgba(0,0,0,0.7)] sm:text-[15px]",
                input || loading ? "pr-14" : "pr-5",
              )}
            />
            <span className="pointer-events-none absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1">
              {loading ? (
                <Loader2
                  className="size-4 animate-spin text-amber/80"
                  aria-hidden
                />
              ) : null}
              {input ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={clearSearch}
                  className="pointer-events-auto flex size-9 items-center justify-center rounded-full text-cream/40 transition-[color,background-color] hover:bg-cream/10 hover:text-cream/80"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </span>
          </label>
        </div>
      </div>

      <div
        className="w-full flex-1 px-5 pt-8 pb-16 sm:px-6 sm:pt-10 sm:pb-20 lg:px-8 xl:px-10"
        aria-live="polite"
      >
        {error ? (
          <p
            className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm text-red-300"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {!query ? (
          <div className="mx-auto max-w-3xl">
            <div className="rounded-3xl border border-cream/10 bg-cream/[0.025] px-6 py-10 text-center sm:px-10 sm:py-12">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-amber/25 bg-amber/10 text-amber">
                <Sparkles className="size-5" aria-hidden />
              </div>
              <p className="mt-5 font-display text-3xl tracking-wide text-cream uppercase sm:text-4xl">
                Start typing
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-cream/50">
                Search any movie or series title. Results update as you type.
              </p>

              {suggestions.length > 0 ? (
                <div className="mt-8">
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-cream/35 uppercase">
                    Trending now
                  </p>
                  <ul className="mt-3 flex flex-wrap justify-center gap-2">
                    {suggestions.map((title) => (
                      <li key={title}>
                        <button
                          type="button"
                          onClick={() => applySuggestion(title)}
                          className="rounded-full border border-cream/12 bg-cream/[0.03] px-3.5 py-1.5 text-[13px] font-medium tracking-wide text-cream/65 transition-[border-color,background-color,color] duration-300 hover:border-amber/40 hover:bg-amber/10 hover:text-amber"
                        >
                          {title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        ) : !loading && results.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-cream/10 bg-cream/[0.025] px-6 py-10 text-center sm:px-8">
            <p className="font-display text-3xl tracking-wide text-cream uppercase">
              No matches
            </p>
            <p className="mt-3 text-sm text-cream/50">
              Nothing found for{" "}
              <span className="text-cream/80">&ldquo;{query}&rdquo;</span>. Try
              another title.
            </p>
            <button
              type="button"
              onClick={clearSearch}
              className="mt-6 inline-flex rounded-full border border-cream/15 px-4 py-2 text-sm text-cream/70 transition-colors hover:border-amber/40 hover:text-amber"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-amber uppercase">
                  Results
                </p>
                <p className="mt-1 text-sm tracking-wide text-cream/55">
                  {loading ? (
                    <span className="inline-flex items-center gap-2 text-cream/45">
                      <Loader2 className="size-3.5 animate-spin" aria-hidden />
                      Searching…
                    </span>
                  ) : (
                    <>
                      <span className="text-cream/80">&ldquo;{query}&rdquo;</span>
                      {` · ${totalResults.toLocaleString()} titles`}
                      {totalPages > 1 ? ` · page ${page}` : null}
                    </>
                  )}
                </p>
              </div>
            </div>

            <ul
              className={cn(
                "grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
                loading && "opacity-60 transition-opacity duration-300",
              )}
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
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, (max-width: 1280px) 22vw, 18vw"
                  />
                </li>
              ))}
            </ul>

            {totalPages > 1 ? (
              <nav
                className="mt-10 flex items-center justify-between gap-3 border-t border-cream/10 pt-6 sm:mt-12"
                aria-label="Pagination"
              >
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => goToPage(page - 1)}
                  className="min-h-10 rounded-full border border-cream/15 bg-cream/[0.03] px-4 py-2 text-sm text-cream/80 transition-[border-color,color,background-color] hover:border-amber/40 hover:bg-amber/10 hover:text-amber disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ← Previous
                </button>
                <p className="shrink-0 rounded-full border border-cream/10 bg-cream/[0.03] px-3.5 py-1.5 text-xs tabular-nums text-cream/50 sm:text-sm">
                  {page} / {totalPages}
                </p>
                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => goToPage(page + 1)}
                  className="min-h-10 rounded-full border border-cream/15 bg-cream/[0.03] px-4 py-2 text-sm text-cream/80 transition-[border-color,color,background-color] hover:border-amber/40 hover:bg-amber/10 hover:text-amber disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Next →
                </button>
              </nav>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
