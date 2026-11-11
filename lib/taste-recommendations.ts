import { cache } from "react";
import { auth } from "@/auth";
import {
  LIST_FAVORITE,
  LIST_WATCHED,
  LIST_WATCHLIST,
  MEDIA_MOVIE,
  MEDIA_TV,
  type MediaListType,
} from "@/lib/lists";
import { prisma } from "@/lib/prisma";
import {
  getMovieRecommendations,
  getTvRecommendations,
  tvShowAsMovie,
  type TmdbMovie,
} from "@/lib/tmdb";

const MIN_RATING = 7;
const MAX_MOVIE_SEEDS = 2;
const MAX_TV_SEEDS = 1;
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

type TasteSeed = {
  movieId: number;
  title: string;
  mediaType: MediaListType;
  rating: number;
  reason: "rated" | "watched";
};

/** Titles already on favorites / watchlist / watched — keep taste + discovery fresh. */
export const getUserKnownTitleIds = cache(async (mediaType: MediaListType) => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return new Set<number>();

  const rows = await prisma.favorite.findMany({
    where: {
      userId,
      mediaType,
      listType: { in: [LIST_FAVORITE, LIST_WATCHLIST, LIST_WATCHED] },
    },
    select: { movieId: true },
  });
  return new Set(rows.map((row) => row.movieId));
});

/** Watched-only ids — hide from home discovery / endless feed. */
export const getUserWatchedIds = cache(async (mediaType: MediaListType) => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [] as number[];

  const rows = await prisma.favorite.findMany({
    where: { userId, mediaType, listType: LIST_WATCHED },
    select: { movieId: true },
  });
  return rows.map((row) => row.movieId);
});

const getTasteSeeds = cache(async (): Promise<TasteSeed[]> => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  const [ratedRows, watchedRows] = await Promise.all([
    prisma.favorite.findMany({
      where: {
        userId,
        listType: LIST_FAVORITE,
        rating: { gte: MIN_RATING },
      },
      select: {
        movieId: true,
        title: true,
        mediaType: true,
        rating: true,
        createdAt: true,
      },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    }),
    prisma.favorite.findMany({
      where: { userId, listType: LIST_WATCHED },
      select: {
        movieId: true,
        title: true,
        mediaType: true,
        watchedAt: true,
        createdAt: true,
      },
      orderBy: [{ watchedAt: "desc" }, { createdAt: "desc" }],
      take: 24,
    }),
  ]);

  const movies: TasteSeed[] = [];
  const tv: TasteSeed[] = [];
  const used = new Set<string>();

  function tryPush(seed: TasteSeed) {
    const key = `${seed.mediaType}:${seed.movieId}`;
    if (used.has(key)) return;
    if (seed.mediaType === MEDIA_TV) {
      if (tv.length >= MAX_TV_SEEDS) return;
      tv.push(seed);
    } else {
      if (movies.length >= MAX_MOVIE_SEEDS) return;
      movies.push(seed);
    }
    used.add(key);
  }

  for (const row of ratedRows) {
    if (row.rating == null) continue;
    tryPush({
      movieId: row.movieId,
      title: row.title,
      mediaType: row.mediaType === MEDIA_TV ? MEDIA_TV : MEDIA_MOVIE,
      rating: row.rating,
      reason: "rated",
    });
    if (movies.length >= MAX_MOVIE_SEEDS && tv.length >= MAX_TV_SEEDS) {
      return [...movies, ...tv];
    }
  }

  for (const row of watchedRows) {
    tryPush({
      movieId: row.movieId,
      title: row.title,
      mediaType: row.mediaType === MEDIA_TV ? MEDIA_TV : MEDIA_MOVIE,
      rating: MIN_RATING,
      reason: "watched",
    });
    if (movies.length >= MAX_MOVIE_SEEDS && tv.length >= MAX_TV_SEEDS) break;
  }

  return [...movies, ...tv];
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
 * Seeds from high ratings first, then recent watched.
 */
export const getTasteRows = cache(async (): Promise<TasteRow[]> => {
  const seeds = await getTasteSeeds();
  if (seeds.length === 0) return [];

  const [movieExcluded, tvExcluded] = await Promise.all([
    getUserKnownTitleIds(MEDIA_MOVIE),
    getUserKnownTitleIds(MEDIA_TV),
  ]);

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
    // Always drop the seed id even if it somehow missed known-title lookup.
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
});

/** First taste row for search idle / empty states (movies preferred). */
export const getSearchTasteRow = cache(async (): Promise<TasteRow | null> => {
  const rows = await getTasteRows();
  return rows.find((row) => row.mediaType === MEDIA_MOVIE) ?? rows[0] ?? null;
});
