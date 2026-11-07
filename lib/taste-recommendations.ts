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
  movies: TmdbMovie[];
};

type TasteSeed = {
  movieId: number;
  title: string;
  mediaType: MediaListType;
  rating: number;
};

/** All list ids for a media kind — used to keep taste rows fresh. */
const getExcludedIds = cache(async (mediaType: MediaListType) => {
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

const getTasteSeeds = cache(async (): Promise<TasteSeed[]> => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  const rows = await prisma.favorite.findMany({
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
  });

  const movies: TasteSeed[] = [];
  const tv: TasteSeed[] = [];

  for (const row of rows) {
    if (row.rating == null) continue;
    const seed: TasteSeed = {
      movieId: row.movieId,
      title: row.title,
      mediaType: row.mediaType === MEDIA_TV ? MEDIA_TV : MEDIA_MOVIE,
      rating: row.rating,
    };
    if (seed.mediaType === MEDIA_TV) {
      if (tv.length < MAX_TV_SEEDS) tv.push(seed);
    } else if (movies.length < MAX_MOVIE_SEEDS) {
      movies.push(seed);
    }
    if (movies.length >= MAX_MOVIE_SEEDS && tv.length >= MAX_TV_SEEDS) break;
  }

  return [...movies, ...tv];
});

function filterPool(
  pool: TmdbMovie[],
  excluded: Set<number>,
  usedAcrossRows: Set<number>,
): TmdbMovie[] {
  const out: TmdbMovie[] = [];
  for (const item of pool) {
    if (excluded.has(item.id) || usedAcrossRows.has(item.id)) continue;
    out.push(item);
    if (out.length >= ROW_LIMIT) break;
  }
  return out;
}

/**
 * Home taste rows for the signed-in user.
 * Empty when signed out, unrated, or TMDB yields thin pools.
 */
export const getTasteRows = cache(async (): Promise<TasteRow[]> => {
  const seeds = await getTasteSeeds();
  if (seeds.length === 0) return [];

  const [movieExcluded, tvExcluded] = await Promise.all([
    getExcludedIds(MEDIA_MOVIE),
    getExcludedIds(MEDIA_TV),
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
    const excluded =
      seed.mediaType === MEDIA_TV ? tvExcluded : movieExcluded;
    const movies = filterPool(pool, excluded, used);
    if (movies.length < MIN_RESULTS) continue;
    for (const movie of movies) used.add(movie.id);
    rows.push({
      id: `taste-${seed.mediaType}-${seed.movieId}`,
      seedId: seed.movieId,
      seedTitle: seed.title,
      mediaType: seed.mediaType,
      movies,
    });
  }

  return rows;
});
