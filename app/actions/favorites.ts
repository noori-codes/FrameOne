"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  isListType,
  isMediaListType,
  LIST_FAVORITE,
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

function revalidateLists(mediaType: MediaListType, movieId: number) {
  revalidatePath(mediaType === "tv" ? `/tv/${movieId}` : `/movie/${movieId}`);
  revalidatePath("/favorites");
  revalidatePath("/watchlist");
  revalidatePath("/");
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
    return { error: "Sign in to save titles." };
  }

  const listTypeRaw = String(formData.get("listType") ?? "");
  if (!isListType(listTypeRaw)) {
    return { error: "Invalid list." };
  }
  const listType = listTypeRaw;

  const mediaTypeRaw = String(formData.get("mediaType") ?? MEDIA_MOVIE);
  if (!isMediaListType(mediaTypeRaw)) {
    return { error: "Invalid media type." };
  }
  const mediaType = mediaTypeRaw;

  const movieId = Number(formData.get("movieId"));
  const title = String(formData.get("title") ?? "").trim();
  const posterPathRaw = formData.get("posterPath");
  const posterPath =
    typeof posterPathRaw === "string" && posterPathRaw.length > 0
      ? posterPathRaw
      : null;

  if (!Number.isFinite(movieId) || movieId <= 0 || !title) {
    return { error: "Invalid title." };
  }

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
