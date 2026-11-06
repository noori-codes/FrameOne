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

function syncUrl(query: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  const qs = params.toString();
  const next = qs ? `/search?${qs}` : "/search";
  window.history.replaceState(null, "", next);
}

function hitKey(hit: SearchHit) {
  return `${hit.mediaType}-${hit.id}`;
}

/**
 * Live search with infinite scroll — debounced query, append pages on scroll.
 */
export function SearchExperience({
  initialQuery = "",
  initialPage = 1,
  initialData = null,
  suggestions = [],
}: SearchExperienceProps) {
  const [input, setInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery.trim());
  const [page, setPage] = useState(initialData?.page ?? initialPage);
  const [results, setResults] = useState<SearchHit[]>(
    initialData?.results ?? [],
  );
  const [totalPages, setTotalPages] = useState(initialData?.totalPages ?? 0);
  const [totalResults, setTotalResults] = useState(
    initialData?.totalResults ?? 0,
  );
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);
  const pausedRef = useRef(false);
  const skipFirstDebounce = useRef(true);
  const queryRef = useRef(query);
  const pageRef = useRef(page);
  const totalPagesRef = useRef(totalPages);

  useEffect(() => {
    queryRef.current = query;
  }, [query]);
  useEffect(() => {
    pageRef.current = page;
  }, [page]);
  useEffect(() => {
    totalPagesRef.current = totalPages;
  }, [totalPages]);

  const hasMore = page < totalPages;

  const runSearch = useCallback(async (q: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    pausedRef.current = false;
    loadingMoreRef.current = false;

    if (!q) {
      setResults([]);
      setTotalPages(0);
      setTotalResults(0);
      setPage(1);
      setSearching(false);
      setLoadingMore(false);
      setError(null);
      syncUrl("");
      return;
    }

    setSearching(true);
    setLoadingMore(false);
    setError(null);

    try {
      const res = await fetch(
        `/api/search/movies?q=${encodeURIComponent(q)}&page=1`,
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
      syncUrl(q);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError("Couldn’t search right now. Try again.");
      setResults([]);
      setTotalPages(0);
      setTotalResults(0);
      setPage(1);
    } finally {
      if (!controller.signal.aborted) setSearching(false);
    }
  }, []);

  const loadMore = useCallback(async (opts?: { resume?: boolean }) => {
    if (opts?.resume) pausedRef.current = false;
    const q = queryRef.current;
    const currentPage = pageRef.current;
    const pages = totalPagesRef.current;
    if (
      !q ||
      loadingMoreRef.current ||
      pausedRef.current ||
      currentPage >= pages
    ) {
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);
    setError(null);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const nextPage = currentPage + 1;
    try {
      const res = await fetch(
        `/api/search/movies?q=${encodeURIComponent(q)}&page=${nextPage}`,
        { signal: controller.signal },
      );
      if (!res.ok) throw new Error("Couldn’t load more titles");
      const data = (await res.json()) as PaginatedSearch;
      if (controller.signal.aborted) return;

      setResults((prev) => {
        const seen = new Set(prev.map(hitKey));
        const merged = [...prev];
        for (const hit of data.results) {
          const key = hitKey(hit);
          if (seen.has(key)) continue;
          seen.add(key);
          merged.push(hit);
        }
        return merged;
      });
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotalResults(data.totalResults);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      pausedRef.current = true;
      setError(
        err instanceof Error ? err.message : "Couldn’t load more titles",
      );
    } finally {
      if (abortRef.current === controller) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
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
      void runSearch(trimmed);
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(id);
  }, [input, runSearch, initialQuery]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !query || !hasMore || searching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "500px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [query, hasMore, searching, loadMore, results.length]);

  function applySuggestion(title: string) {
    setInput(title);
    setQuery(title);
    void runSearch(title);
    inputRef.current?.focus();
  }

  function clearSearch() {
    setInput("");
    setQuery("");
    void runSearch("");
    inputRef.current?.focus();
  }

  const busy = searching || loadingMore;

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
              aria-busy={busy}
              className={cn(
                "search-field w-full rounded-full border border-cream/12 bg-cream/[0.04] py-4 pl-14 text-base text-cream outline-none transition-[border-color,box-shadow,background-color] duration-300 placeholder:text-cream/28 focus:border-amber/45 focus:bg-cream/[0.06] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--amber)_14%,transparent),0_18px_48px_-24px_rgba(0,0,0,0.7)] sm:text-[15px]",
                input || searching ? "pr-14" : "pr-5",
              )}
            />
            <span className="pointer-events-none absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1">
              {searching ? (
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

      <div className="w-full flex-1 px-5 pt-8 pb-16 sm:px-6 sm:pt-10 sm:pb-20 lg:px-8 xl:px-10">
        {error && results.length === 0 ? (
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
                Search any movie or series title. Keep scrolling for more
                matches.
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
        ) : searching && results.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-cream/45">
            <Loader2 className="size-4 animate-spin text-amber/80" aria-hidden />
            Searching…
          </div>
        ) : !searching && results.length === 0 ? (
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
            <div className="mb-7">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-amber uppercase">
                Results
              </p>
              <p className="mt-1 text-sm tracking-wide text-cream/55" aria-live="polite">
                {searching ? (
                  <span className="inline-flex items-center gap-2 text-cream/45">
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                    Searching…
                  </span>
                ) : (
                  <>
                    <span className="text-cream/80">&ldquo;{query}&rdquo;</span>
                    {` · showing ${results.length.toLocaleString()}`}
                    {totalResults > 0
                      ? ` of ${totalResults.toLocaleString()} titles`
                      : " titles"}
                  </>
                )}
              </p>
            </div>

            <ul
              className={cn(
                "grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
                searching && "opacity-70 transition-opacity duration-300",
              )}
            >
              {results.map((hit) => (
                <li key={hitKey(hit)}>
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

            <div ref={sentinelRef} className="h-10" aria-hidden />

            <div aria-live="polite" className="sr-only">
              {loadingMore ? "Loading more results" : null}
            </div>

            {loadingMore ? (
              <p className="mt-6 flex items-center justify-center gap-2 py-2 text-sm text-cream/40">
                <span
                  aria-hidden
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-cream/20 border-t-amber"
                />
                Loading more…
              </p>
            ) : null}

            {error && results.length > 0 ? (
              <div className="mt-6 flex flex-col items-start gap-3">
                <p className="text-sm text-cream/50" role="alert">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => void loadMore({ resume: true })}
                  className="rounded-full border border-cream/25 px-4 py-1.5 text-sm text-cream transition-colors hover:border-amber hover:text-amber"
                >
                  Try again
                </button>
              </div>
            ) : null}

            {!hasMore && !loadingMore && !searching && results.length > 0 ? (
              <p className="mt-10 text-center text-sm text-cream/35">
                That’s everything for this search
              </p>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
