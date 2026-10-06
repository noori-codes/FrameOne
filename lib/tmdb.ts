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

/** Extra fields returned by GET /movie/{id} */
export type TmdbMovieDetails = TmdbMovie & {
  runtime: number | null;
  tagline: string | null;
  genres: { id: number; name: string }[];
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

/**
 * TMDB fetch with short retries — connection timeouts / 429s are common
 * when the home page fires many discover calls.
 */
async function tmdbFetch(
  url: string,
  revalidate: number | false = 3600,
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        next: { revalidate },
      });

      if ((res.status === 429 || res.status >= 500) && attempt < 2) {
        await sleep(400 * (attempt + 1));
        continue;
      }

      return res;
    } catch (err) {
      lastError = err;
      if (attempt < 2) await sleep(500 * (attempt + 1));
    }
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
): Promise<TmdbMovieDetails | null> {
  const url = new URL(`${getBaseUrl()}/movie/${id}`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("append_to_response", "credits");

  const res = await tmdbFetch(url.toString(), 3600);

  if (res.status === 404) return null;

  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as TmdbMovieDetails;
}

type TmdbVideo = {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
};

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
  const youtube = data.results.filter((v) => v.site === "YouTube" && v.key);

  const pick =
    youtube.find((v) => v.type === "Trailer" && v.official) ??
    youtube.find((v) => v.type === "Trailer") ??
    youtube.find((v) => v.type === "Teaser") ??
    youtube[0];

  return pick?.key ?? null;
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
