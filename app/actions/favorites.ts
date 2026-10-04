"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { isListType, LIST_FAVORITE, type ListType } from "@/lib/lists";
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

function revalidateLists(movieId: number) {
  revalidatePath(`/movie/${movieId}`);
  revalidatePath("/favorites");
  revalidatePath("/watchlist");
}

/**
 * Add or remove a movie from Favorites or Watchlist.
 * Form field `listType` must be "favorite" or "watchlist".
 */
export async function toggleList(
  _prev: ToggleListState,
  formData: FormData,
): Promise<ToggleListState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in to save movies." };
  }

  const listTypeRaw = String(formData.get("listType") ?? "");
  if (!isListType(listTypeRaw)) {
    return { error: "Invalid list." };
  }
  const listType = listTypeRaw;

  const movieId = Number(formData.get("movieId"));
  const title = String(formData.get("title") ?? "").trim();
  const posterPathRaw = formData.get("posterPath");
  const posterPath =
    typeof posterPathRaw === "string" && posterPathRaw.length > 0
      ? posterPathRaw
      : null;

  if (!Number.isFinite(movieId) || movieId <= 0 || !title) {
    return { error: "Invalid movie." };
  }

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_movieId_listType: {
        userId: session.user.id,
        movieId,
        listType,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidateLists(movieId);
    return { saved: false, listType };
  }

  await prisma.favorite.create({
    data: {
      userId: session.user.id,
      movieId,
      title,
      posterPath,
      listType,
    },
  });

  revalidateLists(movieId);
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
    return { error: "Invalid movie." };
  }

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
      userId_movieId_listType: {
        userId: session.user.id,
        movieId,
        listType: LIST_FAVORITE,
      },
    },
  });

  if (!existing) {
    return { error: "Add this movie to Favorites before rating it." };
  }

  await prisma.favorite.update({
    where: { id: existing.id },
    data: {
      rating,
      note: note.length > 0 ? note : null,
    },
  });

  revalidateLists(movieId);
  return { success: "Saved." };
}
