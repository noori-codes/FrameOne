"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ToggleFavoriteState = {
  error?: string;
  favorited?: boolean;
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
