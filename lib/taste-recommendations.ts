import { cache } from "react";
import { getHomePersonalization } from "@/lib/home-personalization";
import { MEDIA_MOVIE, MEDIA_TV, type MediaListType } from "@/lib/lists";
import {
  getMovieRecommendations,
  getTvRecommendations,
  tvShowAsMovie,
  type TmdbMovie,
} from "@/lib/tmdb";

const MIN_RESULTS = 6;
const ROW_LIMIT = 20;

export type TasteRow = {
  id: string;
  seedId: number;
  seedTitle: string;
  mediaType: MediaListType;
  /** How we chose the seed — drives the row label. */
  reason: "rated" | "watched";
  movies: TmdbMovie[];
};

/** Titles already on favorites / watchlist / watched — keep taste + discovery fresh. */
export const getUserKnownTitleIds = cache(async (mediaType: MediaListType) => {
  const personal = await getHomePersonalization();
  return new Set(
    mediaType === MEDIA_TV ? personal.knownTvIds : personal.knownMovieIds,
  );
});

/** Watched-only ids — hide from home discovery / endless feed. */
export const getUserWatchedIds = cache(async (mediaType: MediaListType) => {
  const personal = await getHomePersonalization();
  return mediaType === MEDIA_TV
    ? personal.watchedTvIds
    : personal.watchedMovieIds;
});

function normalizeTitle(title: string) {
  return title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function filterPool(
  pool: TmdbMovie[],
  excluded: Set<number>,
  usedAcrossRows: Set<number>,
  seedTitle?: string,
): TmdbMovie[] {
  const seedKey = seedTitle ? normalizeTitle(seedTitle) : "";
  const out: TmdbMovie[] = [];
  for (const item of pool) {
    if (excluded.has(item.id) || usedAcrossRows.has(item.id)) continue;
    // Hard-skip the seed itself even if TMDB/similar leaks it back.
    if (seedKey && normalizeTitle(item.title) === seedKey) continue;
    out.push(item);
    if (out.length >= ROW_LIMIT) break;
  }
  return out;
}

/** Drop known/watched ids from a movie list (home discovery). */
export function excludeTitleIds<T extends { id: number }>(
  items: T[],
  excluded: Iterable<number>,
): T[] {
  const set = excluded instanceof Set ? excluded : new Set(excluded);
  if (set.size === 0) return items;
  return items.filter((item) => !set.has(item.id));
}

/**
 * Home taste rows for the signed-in user.
 * Seeds from high ratings first, then recent watched — via one personalization load.
 */
export const getTasteRows = cache(async (): Promise<TasteRow[]> => {
  try {
    const personal = await getHomePersonalization();
    const seeds = personal.tasteSeeds;
    if (seeds.length === 0) return [];

    const movieExcluded = new Set(personal.knownMovieIds);
    const tvExcluded = new Set(personal.knownTvIds);

    const pools = await Promise.all(
      seeds.map(async (seed) => {
        if (seed.mediaType === MEDIA_TV) {
          const pool = await getTvRecommendations(seed.movieId, ROW_LIMIT + 10);
          return { seed, pool: pool.map(tvShowAsMovie) };
        }
        const pool = await getMovieRecommendations(seed.movieId, ROW_LIMIT + 10);
        return { seed, pool };
      }),
    );

    const usedMovies = new Set<number>();
    const usedTv = new Set<number>();
    const rows: TasteRow[] = [];

    for (const { seed, pool } of pools) {
      const used = seed.mediaType === MEDIA_TV ? usedTv : usedMovies;
      const excluded = new Set(
        seed.mediaType === MEDIA_TV ? tvExcluded : movieExcluded,
      );
      excluded.add(seed.movieId);
      const movies = filterPool(pool, excluded, used, seed.title);
      if (movies.length < MIN_RESULTS) continue;
      for (const movie of movies) used.add(movie.id);
      rows.push({
        id: `taste-${seed.mediaType}-${seed.movieId}`,
        seedId: seed.movieId,
        seedTitle: seed.title,
        mediaType: seed.mediaType,
        reason: seed.reason,
        movies,
      });
    }

    return rows;
  } catch (err) {
    console.warn("getTasteRows failed:", err);
    return [];
  }
});

/** First taste row for search idle / empty states (movies preferred). */
export const getSearchTasteRow = cache(async (): Promise<TasteRow | null> => {
  const rows = await getTasteRows();
  return rows.find((row) => row.mediaType === MEDIA_MOVIE) ?? rows[0] ?? null;
});
