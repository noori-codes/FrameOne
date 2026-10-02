"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ToggleFavoriteState = {
  error?: string;
  favorited?: boolean;
};

export type FavoriteMetaState = {
  error?: string;
  success?: string;
};

/**
 * Add or remove a favorite for the signed-in user.
 * Called from a form on the movie detail page.
 */
export async function toggleFavorite(
  _prev: ToggleFavoriteState,
  formData: FormData,
): Promise<ToggleFavoriteState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in to save favorites." };
  }

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
      userId_movieId: {
        userId: session.user.id,
        movieId,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    revalidatePath(`/movie/${movieId}`);
    revalidatePath("/favorites");
    return { favorited: false };
  }

  await prisma.favorite.create({
    data: {
      userId: session.user.id,
      movieId,
      title,
      posterPath,
    },
  });

  revalidatePath(`/movie/${movieId}`);
  revalidatePath("/favorites");
  return { favorited: true };
}

/**
 * Save personal rating (1–10) and/or a short note on an existing favorite.
 * Empty rating clears it; empty note clears the note.
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
      userId_movieId: {
        userId: session.user.id,
        movieId,
      },
    },
  });

  if (!existing) {
    return { error: "Save this movie to My list before rating it." };
  }

  await prisma.favorite.update({
    where: { id: existing.id },
    data: {
      rating,
      note: note.length > 0 ? note : null,
    },
  });

  revalidatePath("/favorites");
  revalidatePath(`/movie/${movieId}`);
  return { success: "Saved." };
}
