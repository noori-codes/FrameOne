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

const MIN_RATING = 7;
const MAX_MOVIE_SEEDS = 2;
const MAX_TV_SEEDS = 1;

export type HomeTasteSeed = {
  movieId: number;
  title: string;
  mediaType: MediaListType;
  rating: number;
  reason: "rated" | "watched";
};

export type HomePersonalization = {
  userId: string | null;
  movieFavoriteIds: number[];
  tvFavoriteIds: number[];
  watchedMovieIds: number[];
  watchedTvIds: number[];
  knownMovieIds: number[];
  knownTvIds: number[];
  tasteSeeds: HomeTasteSeed[];
};

const EMPTY: HomePersonalization = {
  userId: null,
  movieFavoriteIds: [],
  tvFavoriteIds: [],
  watchedMovieIds: [],
  watchedTvIds: [],
  knownMovieIds: [],
  knownTvIds: [],
  tasteSeeds: [],
};

/**
 * One auth + one favorites query for the whole home tree.
 * Replaces the old N× (auth + findMany) waterfall behind max:1 Prisma.
 */
export const getHomePersonalization = cache(
  async (): Promise<HomePersonalization> => {
    try {
      const session = await auth().catch(() => null);
      const userId = session?.user?.id ?? null;
      if (!userId) return EMPTY;

      const rows = await prisma.favorite.findMany({
        where: {
          userId,
          listType: { in: [LIST_FAVORITE, LIST_WATCHLIST, LIST_WATCHED] },
        },
        select: {
          movieId: true,
          title: true,
          mediaType: true,
          listType: true,
          rating: true,
          watchedAt: true,
          createdAt: true,
        },
      });

      const movieFavoriteIds: number[] = [];
      const tvFavoriteIds: number[] = [];
      const watchedMovieIds: number[] = [];
      const watchedTvIds: number[] = [];
      const knownMovie = new Set<number>();
      const knownTv = new Set<number>();

      const ratedCandidates: {
        movieId: number;
        title: string;
        mediaType: MediaListType;
        rating: number;
        createdAt: Date;
      }[] = [];
      const watchedCandidates: {
        movieId: number;
        title: string;
        mediaType: MediaListType;
        watchedAt: Date | null;
        createdAt: Date;
      }[] = [];

      for (const row of rows) {
        const mediaType =
          row.mediaType === MEDIA_TV ? MEDIA_TV : MEDIA_MOVIE;
        const known = mediaType === MEDIA_TV ? knownTv : knownMovie;
        known.add(row.movieId);

        if (row.listType === LIST_FAVORITE) {
          if (mediaType === MEDIA_TV) tvFavoriteIds.push(row.movieId);
          else movieFavoriteIds.push(row.movieId);

          if (row.rating != null && row.rating >= MIN_RATING) {
            ratedCandidates.push({
              movieId: row.movieId,
              title: row.title,
              mediaType,
              rating: row.rating,
              createdAt: row.createdAt,
            });
          }
        }

        if (row.listType === LIST_WATCHED) {
          if (mediaType === MEDIA_TV) watchedTvIds.push(row.movieId);
          else watchedMovieIds.push(row.movieId);
          watchedCandidates.push({
            movieId: row.movieId,
            title: row.title,
            mediaType,
            watchedAt: row.watchedAt,
            createdAt: row.createdAt,
          });
        }
      }

      ratedCandidates.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      watchedCandidates.sort((a, b) => {
        const aTime = (a.watchedAt ?? a.createdAt).getTime();
        const bTime = (b.watchedAt ?? b.createdAt).getTime();
        return bTime - aTime;
      });

      const movies: HomeTasteSeed[] = [];
      const tv: HomeTasteSeed[] = [];
      const used = new Set<string>();

      function tryPush(seed: HomeTasteSeed) {
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

      for (const row of ratedCandidates) {
        tryPush({
          movieId: row.movieId,
          title: row.title,
          mediaType: row.mediaType,
          rating: row.rating,
          reason: "rated",
        });
        if (movies.length >= MAX_MOVIE_SEEDS && tv.length >= MAX_TV_SEEDS) {
          break;
        }
      }

      if (movies.length < MAX_MOVIE_SEEDS || tv.length < MAX_TV_SEEDS) {
        for (const row of watchedCandidates) {
          tryPush({
            movieId: row.movieId,
            title: row.title,
            mediaType: row.mediaType,
            rating: MIN_RATING,
            reason: "watched",
          });
          if (movies.length >= MAX_MOVIE_SEEDS && tv.length >= MAX_TV_SEEDS) {
            break;
          }
        }
      }

      return {
        userId,
        movieFavoriteIds,
        tvFavoriteIds,
        watchedMovieIds,
        watchedTvIds,
        knownMovieIds: [...knownMovie],
        knownTvIds: [...knownTv],
        tasteSeeds: [...movies, ...tv],
      };
    } catch (err) {
      console.warn("getHomePersonalization failed:", err);
      return EMPTY;
    }
  },
);
