import { createHash } from "node:crypto";
import { getRedisClient } from "@/lib/redis";

/**
 * TMDB client (server-only for now).
 *
 * Why this lives in `lib/`: reusable data helpers, not React components.
 * Why we read the key here: `TMDB_API_KEY` stays on the server.
 * Never import this into a Client Component (`"use client"`) or the key can leak.
 */

function getBaseUrl() {
  return process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";
}

function getImageBase() {
  return process.env.TMDB_IMAGE_BASE_URL ?? "https://image.tmdb.org/t/p";
}

export type TmdbMovie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  /** Present on list/discover results — used to pick a home-row genre. */
  genre_ids?: number[];
};

type TmdbVideo = {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
};

/** Extra fields returned by GET /movie/{id} */
export type TmdbMovieDetails = TmdbMovie & {
  runtime: number | null;
  tagline: string | null;
  genres: { id: number; name: string }[];
  videos?: { results: TmdbVideo[] };
  original_title?: string;
  original_language?: string;
  status?: string;
  vote_count?: number;
  popularity?: number;
  budget?: number;
  revenue?: number;
  homepage?: string;
  imdb_id?: string | null;
  production_companies?: {
    id: number;
    name: string;
    origin_country: string;
  }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  spoken_languages?: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  credits?: {
    cast: TmdbCastMember[];
    crew: TmdbCrewMember[];
  };
};

export type TmdbCastMember = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
};

export type TmdbCrewMember = {
  id: number;
  name: string;
  job: string;
  department: string;
};

export type TmdbGenre = {
  id: number;
  name: string;
};

type PaginatedMoviesResponse = {
  page: number;
  results: TmdbMovie[];
  total_pages: number;
  total_results: number;
};

/** Friendly shape for UI pagination (camelCase). */
export type PaginatedMovies = {
  results: TmdbMovie[];
  page: number;
  totalPages: number;
  totalResults: number;
};

function toPaginated(data: PaginatedMoviesResponse): PaginatedMovies {
  return {
    results: data.results,
    page: data.page,
    // TMDB can report huge total_pages; cap keeps UI sane
    totalPages: Math.min(data.total_pages, 500),
    totalResults: data.total_results,
  };
}

const EMPTY_PAGE: PaginatedMovies = {
  results: [],
  page: 1,
  totalPages: 0,
  totalResults: 0,
};

function getApiKey() {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error(
      "Missing TMDB_API_KEY. Add it to .env.local and restart `npm run dev`.",
    );
  }
  return key;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type CachedTmdbResponse = {
  status: number;
  statusText: string;
  body: string;
};

type MemoryCacheEntry = {
  value: CachedTmdbResponse;
  /** Fresh until this time — served without hitting network. */
  freshUntil: number;
  /** After fresh expires, still usable as fallback until this time. */
  staleUntil: number;
};

const REDIS_READ_TIMEOUT_MS = 200;
const REDIS_FAIL_THRESHOLD = 2;
const REDIS_COOLDOWN_MS = 60_000;
const TMDB_FETCH_TIMEOUT_MS = 4_000;
const MEMORY_CACHE_MAX = 250;
const STALE_FALLBACK_MS = 24 * 60 * 60 * 1000;

const memoryCache = new Map<string, MemoryCacheEntry>();

let redisFailStreak = 0;
let redisCircuitOpenUntil = 0;

function redisReadsAllowed() {
  return Date.now() >= redisCircuitOpenUntil;
}

function noteRedisSuccess() {
  redisFailStreak = 0;
}

function noteRedisFailure() {
  redisFailStreak += 1;
  if (redisFailStreak < REDIS_FAIL_THRESHOLD) return;
  redisCircuitOpenUntil = Date.now() + REDIS_COOLDOWN_MS;
  redisFailStreak = 0;
  console.warn(
    `TMDB Redis circuit open for ${REDIS_COOLDOWN_MS}ms (Upstash too slow)`,
  );
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error(`Redis read timed out after ${timeoutMs}ms`)),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function getTmdbCacheKey(url: string) {
  const cacheUrl = new URL(url);
  cacheUrl.searchParams.delete("api_key");
  const hash = createHash("sha256").update(cacheUrl.toString()).digest("hex");
  return `frameone:tmdb:v1:${hash}`;
}

function responseFromCache(cached: CachedTmdbResponse) {
  return new Response(cached.body, {
    status: cached.status,
    statusText: cached.statusText,
    headers: { "Content-Type": "application/json" },
  });
}

function memoryGet(cacheKey: string, { allowStale = false } = {}) {
  const entry = memoryCache.get(cacheKey);
  if (!entry) return null;
  const now = Date.now();
  if (entry.freshUntil > now) return entry.value;
  if (allowStale && entry.staleUntil > now) return entry.value;
  if (entry.staleUntil <= now) memoryCache.delete(cacheKey);
  return null;
}

function memorySet(
  cacheKey: string,
  value: CachedTmdbResponse,
  revalidate: number | false,
) {
  const ttlSec = revalidate === false ? 86_400 : Math.max(1, revalidate);
  if (memoryCache.size >= MEMORY_CACHE_MAX) {
    const oldest = memoryCache.keys().next().value;
    if (oldest) memoryCache.delete(oldest);
  }
  memoryCache.set(cacheKey, {
    value,
    freshUntil: Date.now() + ttlSec * 1000,
    staleUntil: Date.now() + Math.max(ttlSec * 1000, STALE_FALLBACK_MS),
  });
}

function writeThroughCaches(
  cacheKey: string,
  cached: CachedTmdbResponse,
  revalidate: number | false,
) {
  memorySet(cacheKey, cached, revalidate);

  const redis = getRedisClient();
  if (!redis || revalidate === 0) return;

  void redis
    .set(
      cacheKey,
      cached,
      revalidate === false ? {} : { ex: Math.max(1, revalidate) },
    )
    .catch(() => {
      // Non-blocking; Next + memory cache still serve the hot path.
    });
}

/**
 * TMDB fetch with memory cache, Redis (circuit-breaker), and short retries.
 * Slow Upstash must not sit on the critical path; stale memory is preferred
 * over a hard failure when TMDB is unreachable.
 */
async function tmdbFetch(
  url: string,
  revalidate: number | false = 3600,
): Promise<Response> {
  const cacheKey = getTmdbCacheKey(url);

  if (revalidate !== 0) {
    const hot = memoryGet(cacheKey);
    if (hot) return responseFromCache(hot);
  }

  const redis = getRedisClient();
  if (redis && revalidate !== 0 && redisReadsAllowed()) {
    try {
      const cached = await withTimeout(
        redis.get<CachedTmdbResponse>(cacheKey),
        REDIS_READ_TIMEOUT_MS,
      );
      if (cached) {
        noteRedisSuccess();
        memorySet(cacheKey, cached, revalidate);
        return responseFromCache(cached);
      }
      noteRedisSuccess();
    } catch {
      noteRedisFailure();
    }
  }

  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        next: { revalidate },
        signal: AbortSignal.timeout(TMDB_FETCH_TIMEOUT_MS),
      });

      if ((res.status === 429 || res.status >= 500) && attempt < 1) {
        await sleep(300 * (attempt + 1));
        continue;
      }

      if (revalidate !== 0 && res.ok) {
        const cached: CachedTmdbResponse = {
          status: res.status,
          statusText: res.statusText,
          body: await res.clone().text(),
        };
        writeThroughCaches(cacheKey, cached, revalidate);
      }

      return res;
    } catch (err) {
      lastError = err;
      if (attempt < 1) await sleep(250 * (attempt + 1));
    }
  }

  const stale = revalidate !== 0 ? memoryGet(cacheKey, { allowStale: true }) : null;
  if (stale) {
    console.warn("TMDB unreachable; serving stale memory cache for", cacheKey);
    return responseFromCache(stale);
  }

  throw lastError instanceof Error ? lastError : new Error("TMDB fetch failed");
}

/** Run async work with a concurrency cap (avoids blasting TMDB). */
export async function mapPool<T, R>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) return [];

  const results = new Array<R>(items.length);
  let next = 0;

  async function run() {
    while (next < items.length) {
      const i = next;
      next += 1;
      results[i] = await worker(items[i]!, i);
    }
  }

  const n = Math.min(Math.max(1, concurrency), items.length);
  await Promise.all(Array.from({ length: n }, () => run()));
  return results;
}

/**
 * TMDB returns paths like `/abc.jpg`, not full URLs.
 * `size` examples: w185, w342, w500, original
 */
export function posterUrl(
  posterPath: string | null,
  size: "w185" | "w342" | "w500" = "w342",
) {
  if (!posterPath) return null;
  return `${getImageBase()}/${size}${posterPath}`;
}

export function profileUrl(profilePath: string | null) {
  if (!profilePath) return null;
  return `${getImageBase()}/w185${profilePath}`;
}

export function backdropUrl(
  backdropPath: string | null,
  size: "w780" | "w1280" | "original" = "w1280",
) {
  if (!backdropPath) return null;
  return `${getImageBase()}/${size}${backdropPath}`;
}

/** Popular movies from TMDB (page 1 by default). */
export async function getPopularMoviesPage(page = 1): Promise<PaginatedMovies> {
  const url = new URL(`${getBaseUrl()}/movie/popular`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("page", String(page));

  const res = await tmdbFetch(url.toString(), 3600);

  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  }

  return toPaginated((await res.json()) as PaginatedMoviesResponse);
}

export async function getPopularMovies(page = 1): Promise<TmdbMovie[]> {
  return (await getPopularMoviesPage(page)).results;
}

/**
 * Movies trending today (or this week).
 * TMDB: GET /trending/movie/{day|week}
 */
export async function getTrendingMoviesPage(
  window: "day" | "week" = "day",
  page = 1,
): Promise<PaginatedMovies> {
  const url = new URL(`${getBaseUrl()}/trending/movie/${window}`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("page", String(page));

  const res = await tmdbFetch(url.toString(), 1800);

  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  }

  return toPaginated((await res.json()) as PaginatedMoviesResponse);
}

export async function getTrendingMovies(
  window: "day" | "week" = "day",
  page = 1,
): Promise<TmdbMovie[]> {
  return (await getTrendingMoviesPage(window, page)).results;
}

/** Recently released movies, newest first. */
export async function getLatestMovies(page = 1): Promise<TmdbMovie[]> {
  const url = new URL(`${getBaseUrl()}/discover/movie`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("page", String(page));
  url.searchParams.set("sort_by", "primary_release_date.desc");
  url.searchParams.set(
    "primary_release_date.lte",
    new Date().toISOString().slice(0, 10),
  );
  url.searchParams.set("vote_count.gte", "10");
  url.searchParams.set("include_adult", "false");

  const res = await tmdbFetch(url.toString(), 3600);

  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  }

  return toPaginated((await res.json()) as PaginatedMoviesResponse).results;
}

/**
 * Highest-rated movies (all time, TMDB ranking).
 * TMDB: GET /movie/top_rated
 */
export async function getTopRatedMoviesPage(
  page = 1,
): Promise<PaginatedMovies> {
  const url = new URL(`${getBaseUrl()}/movie/top_rated`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("page", String(page));

  const res = await tmdbFetch(url.toString(), 3600);

  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  }

  return toPaginated((await res.json()) as PaginatedMoviesResponse);
}

export async function getTopRatedMovies(page = 1): Promise<TmdbMovie[]> {
  return (await getTopRatedMoviesPage(page)).results;
}

/**
 * Search movies by title text.
 * Returns results + page info so the UI can build Next/Previous links.
 * Empty query → empty page (no network call).
 */
export async function searchMovies(
  query: string,
  page = 1,
): Promise<PaginatedMovies> {
  const q = query.trim();
  if (!q) return EMPTY_PAGE;

  const url = new URL(`${getBaseUrl()}/search/movie`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("query", q);
  url.searchParams.set("page", String(page));
  url.searchParams.set("include_adult", "false");

  const res = await tmdbFetch(url.toString(), 60);

  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as PaginatedMoviesResponse;
  return toPaginated(data);
}

/** Single movie by id. Returns null when TMDB says 404. */
export async function getMovie(
  id: string | number,
  options: { appendToResponse?: ("credits" | "videos")[] } = {},
): Promise<TmdbMovieDetails | null> {
  const url = new URL(`${getBaseUrl()}/movie/${id}`);
  url.searchParams.set("api_key", getApiKey());
  const appendToResponse = options.appendToResponse ?? ["credits"];
  if (appendToResponse.length > 0) {
    url.searchParams.set("append_to_response", appendToResponse.join(","));
  }

  const res = await tmdbFetch(url.toString(), 3600);

  if (res.status === 404) return null;

  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as TmdbMovieDetails;
}

export function getMovieTrailerKeyFromVideos(
  videos: TmdbVideo[] | undefined,
): string | null {
  if (!videos) return null;
  const youtube = videos.filter((v) => v.site === "YouTube" && v.key);

  const pick =
    youtube.find((v) => v.type === "Trailer" && v.official) ??
    youtube.find((v) => v.type === "Trailer") ??
    youtube.find((v) => v.type === "Teaser") ??
    youtube[0];

  return pick?.key ?? null;
}

/**
 * Best YouTube trailer key for a movie, or null if TMDB has none.
 * TMDB: GET /movie/{id}/videos
 * Prefers official Trailer → any Trailer → Teaser.
 */
export async function getMovieTrailerKey(
  id: string | number,
): Promise<string | null> {
  const url = new URL(`${getBaseUrl()}/movie/${id}/videos`);
  url.searchParams.set("api_key", getApiKey());

  const res = await tmdbFetch(url.toString(), 86400);

  if (res.status === 404) return null;

  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { results: TmdbVideo[] };
  return getMovieTrailerKeyFromVideos(data.results);
}

/**
 * Movies similar to a title (TMDB “similar”).
 * Falls back to recommendations when similar is empty.
 * TMDB: GET /movie/{id}/similar · GET /movie/{id}/recommendations
 */
export async function getSimilarMovies(
  id: string | number,
  limit = 20,
): Promise<TmdbMovie[]> {
  const movieId = Number(id);

  async function fetchList(path: "similar" | "recommendations") {
    const url = new URL(`${getBaseUrl()}/movie/${id}/${path}`);
    url.searchParams.set("api_key", getApiKey());
    url.searchParams.set("page", "1");

    const res = await tmdbFetch(url.toString(), 3600);
    if (res.status === 404) return [] as TmdbMovie[];
    if (!res.ok) {
      throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
    }
    const data = (await res.json()) as PaginatedMoviesResponse;
    return data.results.filter((m) => m.id !== movieId);
  }

  const similar = await fetchList("similar");
  if (similar.length > 0) return similar.slice(0, limit);

  const recommended = await fetchList("recommendations");
  return recommended.slice(0, limit);
}

/**
 * Official movie genre list (Action, Comedy, …).
 * TMDB: GET /genre/movie/list
 */
export async function getMovieGenres(): Promise<TmdbGenre[]> {
  const url = new URL(`${getBaseUrl()}/genre/movie/list`);
  url.searchParams.set("api_key", getApiKey());

  const res = await tmdbFetch(url.toString(), 86400);

  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { genres: TmdbGenre[] };
  return data.genres;
}

/** Sort modes for genre discover (home always uses popular). */
export type GenreSort = "popular" | "top" | "newest";

export const GENRE_SORTS: {
  id: GenreSort;
  label: string;
  tmdb: string;
}[] = [
  { id: "popular", label: "Popular", tmdb: "popularity.desc" },
  { id: "top", label: "Top rated", tmdb: "vote_average.desc" },
  { id: "newest", label: "Newest", tmdb: "primary_release_date.desc" },
];

export function parseGenreSort(raw: string | undefined | null): GenreSort {
  if (raw === "top" || raw === "newest" || raw === "popular") return raw;
  return "popular";
}

/**
 * Discover movies filtered by one genre id.
 * Returns results + page info for pagination UI.
 * TMDB: GET /discover/movie?with_genres=28
 */
export async function getMoviesByGenre(
  genreId: number,
  page = 1,
  sort: GenreSort = "popular",
): Promise<PaginatedMovies> {
  const sortConfig = GENRE_SORTS.find((s) => s.id === sort) ?? GENRE_SORTS[0]!;

  const url = new URL(`${getBaseUrl()}/discover/movie`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("with_genres", String(genreId));
  url.searchParams.set("page", String(page));
  url.searchParams.set("sort_by", sortConfig.tmdb);
  url.searchParams.set("include_adult", "false");
  // Top-rated without a vote floor is noisy (one-vote 10.0s)
  if (sort === "top") {
    url.searchParams.set("vote_count.gte", "100");
  }

  const res = await tmdbFetch(url.toString(), 3600);

  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as PaginatedMoviesResponse;
  return toPaginated(data);
}

/* -------------------------------------------------------------------------- */
/* TV / series (step 1 — detail + trending discovery)                         */
/* -------------------------------------------------------------------------- */

export type MediaKind = "movie" | "tv";

export type TmdbTvShow = {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  first_air_date: string;
  genre_ids?: number[];
};

export type TmdbTvDetails = TmdbTvShow & {
  tagline: string | null;
  genres: { id: number; name: string }[];
  videos?: { results: TmdbVideo[] };
  original_name?: string;
  original_language?: string;
  status?: string;
  vote_count?: number;
  popularity?: number;
  homepage?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  episode_run_time?: number[];
  last_air_date?: string | null;
  in_production?: boolean;
  networks?: { id: number; name: string; logo_path: string | null }[];
  created_by?: { id: number; name: string; profile_path: string | null }[];
  production_companies?: {
    id: number;
    name: string;
    origin_country: string;
  }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  spoken_languages?: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  credits?: {
    cast: TmdbCastMember[];
    crew: TmdbCrewMember[];
  };
  external_ids?: { imdb_id?: string | null };
};

type PaginatedTvResponse = {
  page: number;
  results: TmdbTvShow[];
  total_pages: number;
  total_results: number;
};

export type PaginatedTv = {
  results: TmdbTvShow[];
  page: number;
  totalPages: number;
  totalResults: number;
};

function toPaginatedTv(data: PaginatedTvResponse): PaginatedTv {
  return {
    results: data.results,
    page: data.page,
    totalPages: Math.min(data.total_pages, 500),
    totalResults: data.total_results,
  };
}

/** Map a TV list item into the poster-row shape (uses `title` like movies). */
export function tvShowAsMovie(show: TmdbTvShow): TmdbMovie {
  return {
    id: show.id,
    title: show.name,
    overview: show.overview,
    poster_path: show.poster_path,
    backdrop_path: show.backdrop_path,
    vote_average: show.vote_average,
    release_date: show.first_air_date ?? "",
    genre_ids: show.genre_ids,
  };
}

export function mediaPath(kind: MediaKind, id: number) {
  return kind === "tv" ? `/tv/${id}` : `/movie/${id}`;
}

/**
 * TV shows trending today (or this week).
 * TMDB: GET /trending/tv/{day|week}
 */
export async function getTrendingTvPage(
  window: "day" | "week" = "day",
  page = 1,
): Promise<PaginatedTv> {
  const url = new URL(`${getBaseUrl()}/trending/tv/${window}`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("page", String(page));

  const res = await tmdbFetch(url.toString(), 1800);

  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  }

  return toPaginatedTv((await res.json()) as PaginatedTvResponse);
}

/** Single TV show by id. Returns null when TMDB says 404. */
export async function getTv(
  id: string | number,
  options: { appendToResponse?: ("credits" | "videos" | "external_ids")[] } = {},
): Promise<TmdbTvDetails | null> {
  const url = new URL(`${getBaseUrl()}/tv/${id}`);
  url.searchParams.set("api_key", getApiKey());
  const appendToResponse = options.appendToResponse ?? [
    "credits",
    "external_ids",
  ];
  if (appendToResponse.length > 0) {
    url.searchParams.set("append_to_response", appendToResponse.join(","));
  }

  const res = await tmdbFetch(url.toString(), 3600);

  if (res.status === 404) return null;

  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as TmdbTvDetails;
}

/**
 * Best YouTube trailer key for a TV show, or null if TMDB has none.
 * TMDB: GET /tv/{id}/videos
 */
export async function getTvTrailerKey(
  id: string | number,
): Promise<string | null> {
  const url = new URL(`${getBaseUrl()}/tv/${id}/videos`);
  url.searchParams.set("api_key", getApiKey());

  const res = await tmdbFetch(url.toString(), 86400);

  if (res.status === 404) return null;

  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { results: TmdbVideo[] };
  return getMovieTrailerKeyFromVideos(data.results);
}

/**
 * Similar TV shows (falls back to recommendations).
 * TMDB: GET /tv/{id}/similar · GET /tv/{id}/recommendations
 */
export async function getSimilarTv(
  id: string | number,
  limit = 20,
): Promise<TmdbTvShow[]> {
  const showId = Number(id);

  async function fetchList(path: "similar" | "recommendations") {
    const url = new URL(`${getBaseUrl()}/tv/${id}/${path}`);
    url.searchParams.set("api_key", getApiKey());
    url.searchParams.set("page", "1");

    const res = await tmdbFetch(url.toString(), 3600);
    if (res.status === 404) return [] as TmdbTvShow[];
    if (!res.ok) {
      throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
    }
    const data = (await res.json()) as PaginatedTvResponse;
    return data.results.filter((show) => show.id !== showId);
  }

  const similar = await fetchList("similar");
  if (similar.length > 0) return similar.slice(0, limit);

  const recommended = await fetchList("recommendations");
  return recommended.slice(0, limit);
}
