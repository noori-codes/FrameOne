import {
  LIST_FAVORITE,
  LIST_WATCHED,
  MEDIA_MOVIE,
  MEDIA_TV,
  type MediaListType,
} from "@/lib/lists";
import { prisma } from "@/lib/prisma";
import { getMovie, getTv, mapPool } from "@/lib/tmdb";

const ENRICH_CAP = 80;
const TOP_RATED_LIMIT = 8;
const TOP_GENRES_LIMIT = 6;
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export type StatsShelfItem = {
  movieId: number;
  title: string;
  posterPath: string | null;
  mediaType: MediaListType;
  rating: number | null;
};

export type UserYearStats = {
  year: number;
  availableYears: number[];
  watchedCount: number;
  movieCount: number;
  tvCount: number;
  /** Estimated hours from enriched runtimes; null when nothing enrichable. */
  estimatedHours: number | null;
  hoursAreEstimate: true;
  avgRating: number | null;
  ratedCount: number;
  monthlyCounts: number[];
  mostWatchedMonth: string | null;
  /** ISO date (YYYY-MM-DD) → watch count */
  dailyCounts: Record<string, number>;
  topGenres: { id: number; name: string; count: number }[];
  topRated: StatsShelfItem[];
};

function activityDate(watchedAt: Date | null, createdAt: Date) {
  return watchedAt ?? createdAt;
}

function yearBounds(year: number) {
  const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0));
  return { start, end };
}

function toIsoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseYearParam(raw: string | undefined | null, fallback: number) {
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1970 || n > 2100) return fallback;
  return n;
}

export function resolveStatsYear(
  raw: string | undefined | null,
  availableYears: number[],
) {
  const nowYear = new Date().getUTCFullYear();
  const preferred = parseYearParam(raw, nowYear);
  if (availableYears.includes(preferred)) return preferred;
  if (availableYears.includes(nowYear)) return nowYear;
  return availableYears[0] ?? nowYear;
}

/** Years the user has any watched activity (UTC). */
export async function getUserStatsYears(userId: string): Promise<number[]> {
  const rows = await prisma.favorite.findMany({
    where: { userId, listType: LIST_WATCHED },
    select: { watchedAt: true, createdAt: true },
  });

  const years = new Set<number>();
  for (const row of rows) {
    years.add(activityDate(row.watchedAt, row.createdAt).getUTCFullYear());
  }

  const nowYear = new Date().getUTCFullYear();
  years.add(nowYear);

  return [...years].sort((a, b) => b - a);
}

type WatchedRow = {
  movieId: number;
  title: string;
  posterPath: string | null;
  mediaType: string;
  watchedAt: Date | null;
  createdAt: Date;
};

type RatedRow = {
  movieId: number;
  title: string;
  posterPath: string | null;
  mediaType: string;
  rating: number | null;
  createdAt: Date;
};

type Enrichment = {
  runtimeMinutes: number | null;
  genres: { id: number; name: string }[];
};

async function enrichTitle(
  movieId: number,
  mediaType: string,
): Promise<Enrichment> {
  try {
    if (mediaType === MEDIA_TV) {
      const show = await getTv(movieId, { appendToResponse: [] });
      if (!show) return { runtimeMinutes: null, genres: [] };
      const ep = show.episode_run_time?.find((m) => m > 0) ?? null;
      return {
        runtimeMinutes: ep,
        genres: show.genres ?? [],
      };
    }

    const movie = await getMovie(movieId, { appendToResponse: [] });
    if (!movie) return { runtimeMinutes: null, genres: [] };
    return {
      runtimeMinutes:
        movie.runtime != null && movie.runtime > 0 ? movie.runtime : null,
      genres: movie.genres ?? [],
    };
  } catch {
    return { runtimeMinutes: null, genres: [] };
  }
}

/**
 * Year-in-review stats for a signed-in user.
 * Hours/genres come from capped TMDB enrichment (no schema cache).
 */
export async function getUserYearStats(
  userId: string,
  year: number,
): Promise<UserYearStats> {
  const { start, end } = yearBounds(year);

  const [allWatched, ratedFavorites] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId, listType: LIST_WATCHED },
      select: {
        movieId: true,
        title: true,
        posterPath: true,
        mediaType: true,
        watchedAt: true,
        createdAt: true,
      },
      orderBy: [{ watchedAt: "desc" }, { createdAt: "desc" }],
    }) as Promise<WatchedRow[]>,
    prisma.favorite.findMany({
      where: {
        userId,
        listType: LIST_FAVORITE,
        rating: { not: null },
      },
      select: {
        movieId: true,
        title: true,
        posterPath: true,
        mediaType: true,
        rating: true,
        createdAt: true,
      },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    }) as Promise<RatedRow[]>,
  ]);

  const watchedYear = allWatched.filter((row) => {
    const d = activityDate(row.watchedAt, row.createdAt);
    return d >= start && d < end;
  });

  const movieCount = watchedYear.filter(
    (row) => row.mediaType !== MEDIA_TV,
  ).length;
  const tvCount = watchedYear.length - movieCount;

  const monthlyCounts = Array.from({ length: 12 }, () => 0);
  const dailyCounts: Record<string, number> = {};

  for (const row of watchedYear) {
    const d = activityDate(row.watchedAt, row.createdAt);
    monthlyCounts[d.getUTCMonth()]! += 1;
    const key = toIsoDay(d);
    dailyCounts[key] = (dailyCounts[key] ?? 0) + 1;
  }

  let mostWatchedMonth: string | null = null;
  let peak = 0;
  monthlyCounts.forEach((count, index) => {
    if (count > peak) {
      peak = count;
      mostWatchedMonth = MONTH_LABELS[index]!;
    }
  });
  if (peak === 0) mostWatchedMonth = null;

  const watchedKey = (row: { movieId: number; mediaType: string }) =>
    `${row.mediaType === MEDIA_TV ? MEDIA_TV : MEDIA_MOVIE}:${row.movieId}`;

  const watchedKeys = new Set(watchedYear.map(watchedKey));

  const ratingsForWatched = ratedFavorites.filter((row) =>
    watchedKeys.has(watchedKey(row)),
  );
  const ratingsThisYear = ratedFavorites.filter(
    (row) => row.createdAt >= start && row.createdAt < end,
  );

  const ratingPool =
    ratingsForWatched.length > 0 ? ratingsForWatched : ratingsThisYear;

  const ratedCount = ratingPool.length;
  const avgRating =
    ratedCount > 0
      ? ratingPool.reduce((sum, row) => sum + (row.rating ?? 0), 0) / ratedCount
      : null;

  /** Prefer rated titles you also watched this year; else ratings logged this year. */
  const topRatedSource =
    ratingsForWatched.length > 0 ? ratingsForWatched : ratingsThisYear;

  const seenTop = new Set<string>();
  const topRated: StatsShelfItem[] = [];
  for (const row of topRatedSource) {
    const key = watchedKey(row);
    if (seenTop.has(key)) continue;
    seenTop.add(key);
    topRated.push({
      movieId: row.movieId,
      title: row.title,
      posterPath: row.posterPath,
      mediaType: row.mediaType === MEDIA_TV ? MEDIA_TV : MEDIA_MOVIE,
      rating: row.rating,
    });
    if (topRated.length >= TOP_RATED_LIMIT) break;
  }

  const enrichTargets = watchedYear.slice(0, ENRICH_CAP);
  const enrichments = await mapPool(enrichTargets, 6, (row) =>
    enrichTitle(row.movieId, row.mediaType),
  );

  let totalMinutes = 0;
  let runtimeSamples = 0;
  const genreCounts = new Map<number, { name: string; count: number }>();

  enrichments.forEach((enrichment) => {
    if (!enrichment) return;
    if (enrichment.runtimeMinutes != null) {
      totalMinutes += enrichment.runtimeMinutes;
      runtimeSamples += 1;
    }
      for (const genre of enrichment.genres) {
      const prev = genreCounts.get(genre.id);
      if (prev) {
        prev.count += 1;
      } else {
        genreCounts.set(genre.id, { name: genre.name, count: 1 });
      }
    }
  });

  const topGenres = [...genreCounts.entries()]
    .map(([id, value]) => ({ id, name: value.name, count: value.count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, TOP_GENRES_LIMIT);

  const estimatedHours =
    runtimeSamples > 0 ? Math.round((totalMinutes / 60) * 10) / 10 : null;

  const yearSet = new Set<number>();
  const nowYear = new Date().getUTCFullYear();
  yearSet.add(nowYear);
  for (const row of allWatched) {
    yearSet.add(activityDate(row.watchedAt, row.createdAt).getUTCFullYear());
  }
  const availableYears = [...yearSet].sort((a, b) => b - a);

  return {
    year,
    availableYears,
    watchedCount: watchedYear.length,
    movieCount,
    tvCount,
    estimatedHours,
    hoursAreEstimate: true,
    avgRating:
      avgRating != null ? Math.round(avgRating * 10) / 10 : null,
    ratedCount,
    monthlyCounts,
    mostWatchedMonth,
    dailyCounts,
    topGenres,
    topRated,
  };
}
