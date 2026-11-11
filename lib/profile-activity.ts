import {
  LIST_FAVORITE,
  LIST_WATCHED,
  LIST_WATCHLIST,
  MEDIA_MOVIE,
  MEDIA_TV,
  type MediaListType,
} from "@/lib/lists";
import { prisma } from "@/lib/prisma";

export type ProfileActivityKind =
  | "watched"
  | "rated"
  | "favorited"
  | "watchlisted";

export type ProfileActivityItem = {
  id: string;
  kind: ProfileActivityKind;
  title: string;
  movieId: number;
  mediaType: MediaListType;
  posterPath: string | null;
  at: Date;
  rating?: number | null;
  note?: string | null;
  rewatchCount?: number;
};

const FETCH_EACH = 24;
const FEED_LIMIT = 20;

/**
 * Recent personal activity for the profile feed (newest first).
 */
export async function getProfileActivity(
  userId: string,
  limit = FEED_LIMIT,
): Promise<ProfileActivityItem[]> {
  const [favorites, watchlist, watched] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId, listType: LIST_FAVORITE },
      orderBy: { createdAt: "desc" },
      take: FETCH_EACH,
      select: {
        id: true,
        movieId: true,
        title: true,
        posterPath: true,
        mediaType: true,
        rating: true,
        note: true,
        createdAt: true,
      },
    }),
    prisma.favorite.findMany({
      where: { userId, listType: LIST_WATCHLIST },
      orderBy: { createdAt: "desc" },
      take: FETCH_EACH,
      select: {
        id: true,
        movieId: true,
        title: true,
        posterPath: true,
        mediaType: true,
        createdAt: true,
      },
    }),
    prisma.favorite.findMany({
      where: { userId, listType: LIST_WATCHED },
      orderBy: [{ watchedAt: "desc" }, { createdAt: "desc" }],
      take: FETCH_EACH,
      select: {
        id: true,
        movieId: true,
        title: true,
        posterPath: true,
        mediaType: true,
        note: true,
        watchedAt: true,
        createdAt: true,
        rewatchCount: true,
      },
    }),
  ]);

  const events: ProfileActivityItem[] = [];

  for (const row of watched) {
    events.push({
      id: `watched-${row.id}`,
      kind: "watched",
      title: row.title,
      movieId: row.movieId,
      mediaType: row.mediaType === MEDIA_TV ? MEDIA_TV : MEDIA_MOVIE,
      posterPath: row.posterPath,
      at: row.watchedAt ?? row.createdAt,
      note: row.note,
      rewatchCount: row.rewatchCount,
    });
  }

  for (const row of favorites) {
    if (row.rating != null) {
      events.push({
        id: `rated-${row.id}`,
        kind: "rated",
        title: row.title,
        movieId: row.movieId,
        mediaType: row.mediaType === MEDIA_TV ? MEDIA_TV : MEDIA_MOVIE,
        posterPath: row.posterPath,
        at: row.createdAt,
        rating: row.rating,
        note: row.note,
      });
    } else {
      events.push({
        id: `favorited-${row.id}`,
        kind: "favorited",
        title: row.title,
        movieId: row.movieId,
        mediaType: row.mediaType === MEDIA_TV ? MEDIA_TV : MEDIA_MOVIE,
        posterPath: row.posterPath,
        at: row.createdAt,
      });
    }
  }

  for (const row of watchlist) {
    events.push({
      id: `watchlist-${row.id}`,
      kind: "watchlisted",
      title: row.title,
      movieId: row.movieId,
      mediaType: row.mediaType === MEDIA_TV ? MEDIA_TV : MEDIA_MOVIE,
      posterPath: row.posterPath,
      at: row.createdAt,
    });
  }

  events.sort((a, b) => b.at.getTime() - a.at.getTime());
  return events.slice(0, limit);
}

export function formatActivityWhen(at: Date) {
  const now = Date.now();
  const diffMs = now - at.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return at.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: at.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}
