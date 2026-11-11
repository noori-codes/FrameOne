"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  isListType,
  isMediaListType,
  LIST_FAVORITE,
  LIST_WATCHED,
  LIST_WATCHLIST,
  MEDIA_MOVIE,
  type ListType,
  type MediaListType,
} from "@/lib/lists";
import { prisma } from "@/lib/prisma";

export type ToggleListState = {
  error?: string;
  saved?: boolean;
  listType?: ListType;
};

export type FavoriteMetaState = {
  error?: string;
  success?: string;
};

export type WatchedDateState = {
  error?: string;
  success?: string;
};

function revalidateLists(mediaType: MediaListType, movieId: number) {
  revalidatePath(mediaType === "tv" ? `/tv/${movieId}` : `/movie/${movieId}`);
  revalidatePath("/favorites");
  revalidatePath("/watchlist");
  revalidatePath("/watched");
  revalidatePath("/stats");
  revalidatePath("/profile");
  revalidatePath("/");
}

function parseWatchedAt(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return { error: "Pick a watch date." as const };
  const watchedAt = new Date(`${trimmed}T12:00:00`);
  if (Number.isNaN(watchedAt.getTime())) {
    return { error: "Invalid watch date." as const };
  }
  return { watchedAt };
}

function parseTitlePayload(formData: FormData) {
  const movieId = Number(formData.get("movieId"));
  const title = String(formData.get("title") ?? "").trim();
  const posterPathRaw = formData.get("posterPath");
  const posterPath =
    typeof posterPathRaw === "string" && posterPathRaw.length > 0
      ? posterPathRaw
      : null;

  const mediaTypeRaw = String(formData.get("mediaType") ?? MEDIA_MOVIE);
  if (!isMediaListType(mediaTypeRaw)) {
    return { error: "Invalid media type." as const };
  }

  if (!Number.isFinite(movieId) || movieId <= 0 || !title) {
    return { error: "Invalid title." as const };
  }

  return {
    movieId,
    title,
    posterPath,
    mediaType: mediaTypeRaw,
  };
}

/**
 * Add or remove a title from Favorites or Watchlist.
 * Form fields: movieId, title, posterPath, listType, mediaType (movie|tv).
 */
export async function toggleList(
  _prev: ToggleListState,
  formData: FormData,
): Promise<ToggleListState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ..._prev, error: "Sign in to save titles." };
  }

  const listTypeRaw = String(formData.get("listType") ?? "");
  if (!isListType(listTypeRaw) || listTypeRaw === LIST_WATCHED) {
    return {
      ..._prev,
      error:
        listTypeRaw === LIST_WATCHED
          ? "Use mark watched."
          : "Invalid list.",
    };
  }
  const listType = listTypeRaw;

  const parsed = parseTitlePayload(formData);
  if ("error" in parsed) {
    return { ..._prev, error: parsed.error };
  }
  const { movieId, title, posterPath, mediaType } = parsed;

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_movieId_listType_mediaType: {
        userId: session.user.id,
        movieId,
        listType,
        mediaType,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidateLists(mediaType, movieId);
    return { saved: false, listType };
  }

  await prisma.favorite.create({
    data: {
      userId: session.user.id,
      movieId,
      mediaType,
      title,
      posterPath,
      listType,
    },
  });

  revalidateLists(mediaType, movieId);
  return { saved: true, listType };
}

/** @deprecated Prefer toggleList — kept name alias for clarity in older call sites. */
export const toggleFavorite = toggleList;

/**
 * Mark a title watched (or unwatch). Clears the matching watchlist row when marking.
 * Optional form field watchedAt (YYYY-MM-DD); defaults to today.
 */
export async function toggleWatched(
  _prev: ToggleListState,
  formData: FormData,
): Promise<ToggleListState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ..._prev, error: "Sign in to log titles." };
  }

  const parsed = parseTitlePayload(formData);
  if ("error" in parsed) {
    return { ..._prev, error: parsed.error };
  }
  const { movieId, title, posterPath, mediaType } = parsed;
  const userId = session.user.id;

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_movieId_listType_mediaType: {
        userId,
        movieId,
        listType: LIST_WATCHED,
        mediaType,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidateLists(mediaType, movieId);
    return { saved: false, listType: LIST_WATCHED };
  }

  const watchedAtRaw = String(formData.get("watchedAt") ?? "").trim();
  let watchedAt = new Date();
  if (watchedAtRaw) {
    const parsedDate = new Date(`${watchedAtRaw}T12:00:00`);
    if (Number.isNaN(parsedDate.getTime())) {
      return { ..._prev, error: "Invalid watch date." };
    }
    watchedAt = parsedDate;
  }

  await prisma.$transaction([
    prisma.favorite.create({
      data: {
        userId,
        movieId,
        mediaType,
        title,
        posterPath,
        listType: LIST_WATCHED,
        watchedAt,
      },
    }),
    prisma.favorite.deleteMany({
      where: {
        userId,
        movieId,
        mediaType,
        listType: LIST_WATCHLIST,
      },
    }),
  ]);

  revalidateLists(mediaType, movieId);
  return { saved: true, listType: LIST_WATCHED };
}

/**
 * Update watch date and/or diary note on an existing watched entry.
 */
export async function updateWatchedDiary(
  _prev: WatchedDateState,
  formData: FormData,
): Promise<WatchedDateState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in to update your diary." };
  }

  const movieId = Number(formData.get("movieId"));
  if (!Number.isFinite(movieId) || movieId <= 0) {
    return { error: "Invalid title." };
  }

  const mediaTypeRaw = String(formData.get("mediaType") ?? MEDIA_MOVIE);
  if (!isMediaListType(mediaTypeRaw)) {
    return { error: "Invalid media type." };
  }
  const mediaType = mediaTypeRaw;

  const parsedDate = parseWatchedAt(String(formData.get("watchedAt") ?? ""));
  if ("error" in parsedDate) {
    return { error: parsedDate.error };
  }

  const note = String(formData.get("note") ?? "").trim().slice(0, 280);

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_movieId_listType_mediaType: {
        userId: session.user.id,
        movieId,
        listType: LIST_WATCHED,
        mediaType,
      },
    },
  });

  if (!existing) {
    return { error: "Mark this title watched first." };
  }

  await prisma.favorite.update({
    where: { id: existing.id },
    data: {
      watchedAt: parsedDate.watchedAt,
      note: note.length > 0 ? note : null,
    },
  });

  revalidateLists(mediaType, movieId);
  return { success: "Diary updated." };
}

/** @deprecated Prefer updateWatchedDiary */
export const updateWatchedDate = updateWatchedDiary;

/**
 * Log another play of an already-watched title (bumps rewatch + date).
 * Optional watchedAt (YYYY-MM-DD); defaults to today.
 */
export async function logRewatch(
  _prev: WatchedDateState,
  formData: FormData,
): Promise<WatchedDateState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in to log a rewatch." };
  }

  const movieId = Number(formData.get("movieId"));
  if (!Number.isFinite(movieId) || movieId <= 0) {
    return { error: "Invalid title." };
  }

  const mediaTypeRaw = String(formData.get("mediaType") ?? MEDIA_MOVIE);
  if (!isMediaListType(mediaTypeRaw)) {
    return { error: "Invalid media type." };
  }
  const mediaType = mediaTypeRaw;

  const watchedAtRaw = String(formData.get("watchedAt") ?? "").trim();
  let watchedAt = new Date();
  if (watchedAtRaw) {
    const parsedDate = parseWatchedAt(watchedAtRaw);
    if ("error" in parsedDate) {
      return { error: parsedDate.error };
    }
    watchedAt = parsedDate.watchedAt;
  }

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_movieId_listType_mediaType: {
        userId: session.user.id,
        movieId,
        listType: LIST_WATCHED,
        mediaType,
      },
    },
  });

  if (!existing) {
    return { error: "Mark this title watched first." };
  }

  await prisma.favorite.update({
    where: { id: existing.id },
    data: {
      watchedAt,
      rewatchCount: { increment: 1 },
    },
  });

  revalidateLists(mediaType, movieId);
  return { success: "Rewatch logged." };
}

/**
 * Save personal rating / note on a Favorites entry only.
 */
export async function updateFavoriteMeta(
  _prev: FavoriteMetaState,
  formData: FormData,
): Promise<FavoriteMetaState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in to rate favorites." };
  }

  const movieId = Number(formData.get("movieId"));
  if (!Number.isFinite(movieId) || movieId <= 0) {
    return { error: "Invalid title." };
  }

  const mediaTypeRaw = String(formData.get("mediaType") ?? MEDIA_MOVIE);
  if (!isMediaListType(mediaTypeRaw)) {
    return { error: "Invalid media type." };
  }
  const mediaType = mediaTypeRaw;

  const ratingRaw = String(formData.get("rating") ?? "").trim();
  let rating: number | null = null;
  if (ratingRaw !== "") {
    const n = Number(ratingRaw);
    if (!Number.isInteger(n) || n < 1 || n > 10) {
      return { error: "Rating must be a whole number from 1 to 10." };
    }
    rating = n;
  }

  const note = String(formData.get("note") ?? "").trim().slice(0, 280);

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_movieId_listType_mediaType: {
        userId: session.user.id,
        movieId,
        listType: LIST_FAVORITE,
        mediaType,
      },
    },
  });

  if (!existing) {
    return { error: "Add this title to Favorites before rating it." };
  }

  await prisma.favorite.update({
    where: { id: existing.id },
    data: {
      rating,
      note: note.length > 0 ? note : null,
    },
  });

  revalidateLists(mediaType, movieId);
  return { success: "Saved." };
}
