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
};

/** Extra fields returned by GET /movie/{id} */
export type TmdbMovieDetails = TmdbMovie & {
  runtime: number | null;
  tagline: string | null;
  genres: { id: number; name: string }[];
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

function getApiKey() {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error(
      "Missing TMDB_API_KEY. Add it to .env.local and restart `npm run dev`.",
    );
  }
  return key;
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

export function backdropUrl(
  backdropPath: string | null,
  size: "w780" | "w1280" | "original" = "w1280",
) {
  if (!backdropPath) return null;
  return `${getImageBase()}/${size}${backdropPath}`;
}

/** Popular movies from TMDB (page 1 by default). */
export async function getPopularMovies(page = 1): Promise<TmdbMovie[]> {
  const url = new URL(`${getBaseUrl()}/movie/popular`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("page", String(page));

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as PaginatedMoviesResponse;
  return data.results;
}

/**
 * Movies trending today (or this week).
 * TMDB: GET /trending/movie/{day|week}
 */
export async function getTrendingMovies(
  window: "day" | "week" = "day",
  page = 1,
): Promise<TmdbMovie[]> {
  const url = new URL(`${getBaseUrl()}/trending/movie/${window}`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("page", String(page));

  const res = await fetch(url.toString(), {
    next: { revalidate: 1800 },
  });

  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as PaginatedMoviesResponse;
  return data.results;
}

/**
 * Highest-rated movies (all time, TMDB ranking).
 * TMDB: GET /movie/top_rated
 */
export async function getTopRatedMovies(page = 1): Promise<TmdbMovie[]> {
  const url = new URL(`${getBaseUrl()}/movie/top_rated`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("page", String(page));

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as PaginatedMoviesResponse;
  return data.results;
}

/**
 * Search movies by title text.
 * TMDB endpoint: GET /search/movie?query=...
 * Empty query → [] (no network call).
 */
export async function searchMovies(
  query: string,
  page = 1,
): Promise<TmdbMovie[]> {
  const q = query.trim();
  if (!q) return [];

  const url = new URL(`${getBaseUrl()}/search/movie`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("query", q);
  url.searchParams.set("page", String(page));
  url.searchParams.set("include_adult", "false");

  const res = await fetch(url.toString(), {
    // Search results change often — cache briefly
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as PaginatedMoviesResponse;
  return data.results;
}

/** Single movie by id. Returns null when TMDB says 404. */
export async function getMovie(
  id: string | number,
): Promise<TmdbMovieDetails | null> {
  const url = new URL(`${getBaseUrl()}/movie/${id}`);
  url.searchParams.set("api_key", getApiKey());

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as TmdbMovieDetails;
}

/**
 * Official movie genre list (Action, Comedy, …).
 * TMDB: GET /genre/movie/list
 */
export async function getMovieGenres(): Promise<TmdbGenre[]> {
  const url = new URL(`${getBaseUrl()}/genre/movie/list`);
  url.searchParams.set("api_key", getApiKey());

  const res = await fetch(url.toString(), {
    next: { revalidate: 86400 }, // genres rarely change — cache 1 day
  });

  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { genres: TmdbGenre[] };
  return data.genres;
}

/**
 * Discover movies filtered by one genre id.
 * TMDB: GET /discover/movie?with_genres=28
 */
export async function getMoviesByGenre(
  genreId: number,
  page = 1,
): Promise<TmdbMovie[]> {
  const url = new URL(`${getBaseUrl()}/discover/movie`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("with_genres", String(genreId));
  url.searchParams.set("page", String(page));
  url.searchParams.set("sort_by", "popularity.desc");
  url.searchParams.set("include_adult", "false");

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as PaginatedMoviesResponse;
  return data.results;
}
