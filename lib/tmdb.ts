/**
 * TMDB client (server-only for now).
 *
 * Why this lives in `lib/`: reusable data helpers, not React components.
 * Why we read the key here: `TMDB_API_KEY` stays on the server.
 * Never import this into a Client Component (`"use client"`) or the key can leak.
 */

const TMDB_BASE = process.env.TMDB_BASE_URL;
const TMDB_IMAGE_BASE = process.env.TMDB_IMAGE_BASE_URL;

export type TmdbMovie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
};

type PopularMoviesResponse = {
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
  return `${TMDB_IMAGE_BASE}/${size}${posterPath}`;
}

/** Popular movies from TMDB (page 1 by default). */
export async function getPopularMovies(page = 1): Promise<TmdbMovie[]> {
  const url = new URL(`${TMDB_BASE}/movie/popular`);
  url.searchParams.set("api_key", getApiKey());
  url.searchParams.set("page", String(page));

  const res = await fetch(url.toString(), {
    // Revalidate every hour — Next caches this fetch on the server
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as PopularMoviesResponse;
  return data.results;
}
