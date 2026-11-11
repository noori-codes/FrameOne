"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2, Search as SearchIcon, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { MovieCard } from "@/components/movie-card";
import {
  backdropUrl,
  mediaPath,
  posterUrl,
  type PaginatedSearch,
  type SearchHit,
  type TmdbGenre,
  type TmdbMovie,
} from "@/lib/tmdb";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 350;

type SearchTasteProps = {
  seedTitle: string;
  reason: "rated" | "watched";
  mediaType: "movie" | "tv";
  movies: TmdbMovie[];
};

type SearchExperienceProps = {
  initialQuery?: string;
  initialPage?: number;
  initialData?: PaginatedSearch | null;
  trending?: TmdbMovie[];
  genres?: TmdbGenre[];
  taste?: SearchTasteProps | null;
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
 * Full-bleed search — sticky field, browseable idle state, infinite results.
 * Pattern mirrors Netflix / Disney+ / Prime: never leave an empty void.
 */
export function SearchExperience({
  initialQuery = "",
  initialPage = 1,
  initialData = null,
  trending = [],
  genres = [],
  taste = null,
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
  const featured = results[0] ?? null;

  const atmosphere = useMemo(() => {
    if (featured?.backdrop_path) {
      return backdropUrl(featured.backdrop_path, "w1280");
    }
    if (featured?.poster_path) {
      return posterUrl(featured.poster_path, "w780");
    }
    const lead = trending.find((m) => m.backdrop_path || m.poster_path);
    return (
      backdropUrl(lead?.backdrop_path ?? null, "w1280") ??
      posterUrl(lead?.poster_path ?? null, "w780")
    );
  }, [featured, trending]);

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

  function clearSearch() {
    setInput("");
    setQuery("");
    void runSearch("");
    inputRef.current?.focus();
  }

  function applySuggestion(title: string) {
    setInput(title);
    setQuery(title);
    void runSearch(title);
    inputRef.current?.focus();
  }

  const gridClass =
    "grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7";

  return (
    <main className="relative flex min-h-dvh w-full flex-1 flex-col bg-background">
      {/* Atmosphere + sticky search */}
      <header className="relative isolate overflow-hidden border-b border-cream/8">
        {atmosphere ? (
          <Image
            src={atmosphere}
            alt=""
            fill
            priority
            sizes="100vw"
            className="absolute inset-0 -z-20 object-cover object-[center_22%] opacity-35"
          />
        ) : null}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-b from-background/55 via-background/85 to-background"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_srgb,var(--amber)_14%,transparent),transparent_55%)]"
        />

        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-5 pt-8 pb-7 text-center sm:px-8 sm:pt-10 sm:pb-9 lg:px-12 xl:px-16">
          <p className="text-[10px] font-semibold tracking-[0.24em] text-amber uppercase">
            Discover
          </p>
          <h1 className="mt-2 font-display text-5xl leading-[0.9] tracking-tight text-cream sm:text-6xl lg:text-7xl">
            Search
          </h1>

          <label className="relative mt-6 block w-full sm:mt-8">
            <span className="sr-only">Search titles</span>
            <SearchIcon
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-cream/40 sm:left-5 sm:size-5"
              aria-hidden
            />
            <input
              ref={inputRef}
              type="search"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Titles, shows, anything…"
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="search"
              aria-busy={searching || loadingMore}
              className={cn(
                "search-field w-full rounded-full border border-cream/15 bg-black/45 py-3.5 pl-11 text-left text-sm text-cream outline-none backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-300 placeholder:text-cream/30 focus:border-amber/45 focus:bg-black/55 focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--amber)_14%,transparent)] sm:py-4 sm:pl-14 sm:text-base",
                input || searching ? "pr-14" : "pr-5",
              )}
            />
            <span className="pointer-events-none absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center gap-1 sm:right-3">
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
                  className="pointer-events-auto flex size-9 items-center justify-center rounded-full text-cream/45 transition-[color,background-color] hover:bg-cream/10 hover:text-cream/85"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </span>
          </label>

          {!query && genres.length > 0 ? (
            <nav
              aria-label="Browse genres"
              className="mt-5 flex flex-wrap justify-center gap-2 sm:mt-6"
            >
              {genres.map((genre, i) => (
                <Link
                  key={genre.id}
                  href={`/genres/${genre.id}`}
                  className={cn(
                    "rounded-md border px-3.5 py-1.5 text-[12px] font-medium tracking-wide backdrop-blur-md transition-[border-color,background-color,color,transform] duration-300 hover:-translate-y-0.5",
                    i % 3 === 0
                      ? "border-amber/25 bg-amber/10 text-amber/90 hover:border-amber/45 hover:bg-amber/15"
                      : i % 3 === 1
                        ? "border-cream/18 bg-cream/[0.06] text-cream/80 hover:border-cream/35 hover:text-cream"
                        : "border-cream/12 bg-black/40 text-cream/70 hover:border-amber/35 hover:text-amber",
                  )}
                >
                  {genre.name}
                </Link>
              ))}
            </nav>
          ) : null}

          {query ? (
            <p className="mt-5 text-sm text-cream/55">
              {searching && results.length === 0 ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  Searching…
                </span>
              ) : totalResults > 0 ? (
                <>
                  <span className="text-cream/80">
                    {results.length.toLocaleString()}
                  </span>
                  {` of ${totalResults.toLocaleString()} matches for `}
                  <span className="text-cream/85">&ldquo;{query}&rdquo;</span>
                </>
              ) : !searching ? (
                <>
                  No matches for{" "}
                  <span className="text-cream/85">&ldquo;{query}&rdquo;</span>
                </>
              ) : null}
            </p>
          ) : null}
        </div>
      </header>

      <div className="relative w-full flex-1 px-5 py-8 sm:px-8 sm:py-10 lg:px-12 xl:px-16">
        {error && results.length === 0 && query ? (
          <p
            className="mb-8 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm text-red-300"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {/* Idle — one spotlight + horizontal rails (not twin poster dumps) */}
        {!query ? (
          <div className="flex flex-col gap-12 sm:gap-14">
            {(() => {
              const spotlight =
                taste?.movies[0] ?? trending[0] ?? null;
              const spotlightKind = taste?.movies[0]
                ? "taste"
                : spotlight
                  ? "trending"
                  : null;
              if (!spotlight) {
                return (
                  <p className="text-sm text-cream/45">
                    Start typing to find movies and series.
                  </p>
                );
              }
              const spotlightHref = mediaPath(
                spotlightKind === "taste" && taste?.mediaType === "tv"
                  ? "tv"
                  : "movie",
                spotlight.id,
              );
              const spotlightPoster = posterUrl(spotlight.poster_path, "w500");
              const spotlightBackdrop = backdropUrl(spotlight.backdrop_path);
              return (
                <section
                  aria-labelledby="search-spotlight-heading"
                  className="relative overflow-hidden rounded-2xl border border-cream/10 bg-stage"
                >
                  <div className="relative min-h-[16rem] sm:min-h-[18rem]">
                    {spotlightBackdrop ? (
                      <Image
                        src={spotlightBackdrop}
                        alt=""
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover object-center opacity-55"
                      />
                    ) : null}
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-linear-to-r from-background via-background/75 to-background/20"
                    />
                    <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-end sm:gap-8 sm:p-8">
                      {spotlightPoster ? (
                        <Link
                          href={spotlightHref}
                          className="relative aspect-2/3 w-28 shrink-0 overflow-hidden rounded-lg ring-1 ring-cream/20 sm:w-36"
                        >
                          <Image
                            src={spotlightPoster}
                            alt=""
                            fill
                            sizes="144px"
                            className="object-cover"
                            priority
                          />
                        </Link>
                      ) : null}
                      <div className="min-w-0 pb-1">
                        <p className="text-[10px] font-semibold tracking-[0.22em] text-amber uppercase">
                          {spotlightKind === "taste" ? "For you" : "Spotlight"}
                        </p>
                        <h2
                          id="search-spotlight-heading"
                          className="mt-2 font-display text-4xl leading-none tracking-tight text-cream sm:text-5xl"
                        >
                          <Link
                            href={spotlightHref}
                            className="transition-colors hover:text-amber"
                          >
                            {spotlight.title}
                          </Link>
                        </h2>
                        <p className="mt-3 max-w-lg text-sm text-cream/55">
                          {spotlightKind === "taste" && taste
                            ? taste.reason === "rated"
                              ? `Because you rated ${taste.seedTitle}`
                              : `Because you watched ${taste.seedTitle}`
                            : "Trending on TMDB today — tap search or open the title."}
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2.5">
                          <Link
                            href={spotlightHref}
                            className="inline-flex min-h-10 items-center rounded-md bg-amber px-4 text-sm font-semibold text-[color:var(--on-amber)] transition-colors hover:bg-(--amber-dim) hover:text-cream"
                          >
                            Open title
                          </Link>
                          <button
                            type="button"
                            onClick={() => applySuggestion(spotlight.title)}
                            className="inline-flex min-h-10 items-center rounded-md border border-cream/20 bg-black/35 px-4 text-sm text-cream/80 transition-colors hover:border-cream/40 hover:text-cream"
                          >
                            Search “{spotlight.title}”
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })()}

            {taste && taste.movies.length > 1 ? (
              <section aria-labelledby="taste-heading">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-amber uppercase">
                    For you
                  </p>
                  <h2
                    id="taste-heading"
                    className="mt-1 font-display text-3xl tracking-tight text-cream sm:text-4xl"
                  >
                    {taste.reason === "rated"
                      ? `Because you rated ${taste.seedTitle}`
                      : `Because you watched ${taste.seedTitle}`}
                  </h2>
                </div>
                <ul className="mt-6 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-3.5 [&::-webkit-scrollbar]:hidden">
                  {taste.movies.slice(1, 13).map((movie, i) => (
                    <li
                      key={`taste-${movie.id}`}
                      className="w-[9.5rem] shrink-0 sm:w-44"
                    >
                      <MovieCard
                        id={movie.id}
                        title={movie.title}
                        posterPath={movie.poster_path}
                        voteAverage={movie.vote_average}
                        mediaType={taste.mediaType}
                        priority={i < 4}
                        showTitle
                        sizes="176px"
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section aria-labelledby="trending-heading">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-amber uppercase">
                    Today
                  </p>
                  <h2
                    id="trending-heading"
                    className="mt-1 font-display text-3xl tracking-tight text-cream sm:text-4xl"
                  >
                    Trending now
                  </h2>
                </div>
              </div>

              {trending.length > 0 ? (
                <ul className="mt-6 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-3.5 [&::-webkit-scrollbar]:hidden">
                  {trending.slice(0, 14).map((movie, i) => (
                    <li
                      key={movie.id}
                      className="w-[9.5rem] shrink-0 sm:w-44"
                    >
                      <MovieCard
                        id={movie.id}
                        title={movie.title}
                        posterPath={movie.poster_path}
                        voteAverage={movie.vote_average}
                        priority={i < 4 && !(taste && taste.movies.length > 0)}
                        showTitle
                        sizes="176px"
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          </div>
        ) : searching && results.length === 0 ? (
          <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-cream/45">
            <Loader2 className="size-4 animate-spin text-amber/80" aria-hidden />
            Searching…
          </div>
        ) : !searching && results.length === 0 ? (
          <section>
            <div className="max-w-xl">
              <p className="font-display text-3xl tracking-tight text-cream sm:text-4xl">
                No matches
              </p>
              <p className="mt-3 text-sm leading-relaxed text-cream/50">
                Nothing turned up for that title. Try another spelling, or browse
                what’s trending.
              </p>
              <button
                type="button"
                onClick={clearSearch}
                className="mt-6 inline-flex rounded-full border border-cream/15 px-4 py-2 text-sm text-cream/70 transition-colors hover:border-amber/40 hover:text-amber"
              >
                Clear search
              </button>
            </div>

            {taste && taste.movies.length > 0 ? (
              <div className="mt-14">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-amber uppercase">
                  Instead
                </p>
                <h2 className="mt-1 font-display text-2xl tracking-tight text-cream sm:text-3xl">
                  {taste.reason === "rated"
                    ? `Because you rated ${taste.seedTitle}`
                    : `Because you watched ${taste.seedTitle}`}
                </h2>
                <ul className={cn("mt-6", gridClass)}>
                  {taste.movies.map((movie) => (
                    <li key={`empty-taste-${movie.id}`}>
                      <MovieCard
                        id={movie.id}
                        title={movie.title}
                        posterPath={movie.poster_path}
                        voteAverage={movie.vote_average}
                        mediaType={taste.mediaType}
                        showTitle
                        sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, (max-width: 1280px) 16vw, 12vw"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : trending.length > 0 ? (
              <div className="mt-14">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-amber uppercase">
                  Instead
                </p>
                <h2 className="mt-1 font-display text-2xl tracking-tight text-cream sm:text-3xl">
                  Trending now
                </h2>
                <ul className={cn("mt-6", gridClass)}>
                  {trending.slice(0, 12).map((movie) => (
                    <li key={movie.id}>
                      <MovieCard
                        id={movie.id}
                        title={movie.title}
                        posterPath={movie.poster_path}
                        voteAverage={movie.vote_average}
                        showTitle
                        sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, (max-width: 1280px) 16vw, 12vw"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : (
          <>
            {/* Top match spotlight */}
            {featured ? (
              <Link
                href={mediaPath(featured.mediaType, featured.id)}
                className="group relative mb-10 flex min-h-[12rem] overflow-hidden rounded-2xl border border-cream/10 sm:min-h-[14rem] lg:min-h-[16rem]"
              >
                {(featured.backdrop_path || featured.poster_path) && (
                  <Image
                    src={
                      backdropUrl(featured.backdrop_path, "w1280") ??
                      posterUrl(featured.poster_path, "w780")!
                    }
                    alt=""
                    fill
                    sizes="100vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                )}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-r from-background via-background/75 to-background/25"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-t from-background/90 via-transparent to-transparent"
                />
                <div className="relative z-10 flex w-full flex-col justify-end gap-3 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7 lg:p-8">
                  <div className="min-w-0 max-w-2xl">
                    <p className="text-[10px] font-semibold tracking-[0.2em] text-amber uppercase">
                      Top match
                    </p>
                    <p className="mt-1.5 font-display text-3xl leading-none tracking-tight text-cream sm:text-4xl lg:text-5xl">
                      {featured.title}
                    </p>
                    {featured.overview ? (
                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-cream/65 sm:line-clamp-3">
                        {featured.overview}
                      </p>
                    ) : null}
                  </div>
                  <span className="inline-flex shrink-0 items-center rounded-full border border-cream/20 bg-black/40 px-4 py-2 text-sm text-cream/80 backdrop-blur-md transition-[border-color,color] group-hover:border-amber/45 group-hover:text-amber">
                    Open title
                  </span>
                </div>
              </Link>
            ) : null}

            <ul
              className={cn(
                gridClass,
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
                    sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, (max-width: 1280px) 16vw, 12vw"
                  />
                </li>
              ))}
            </ul>

            <div ref={sentinelRef} className="h-10" aria-hidden />

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
    </main>
  );
}
