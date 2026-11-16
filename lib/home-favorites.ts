import { cache } from "react";
import { auth } from "@/auth";
import { LIST_FAVORITE } from "@/lib/lists";
import { prisma } from "@/lib/prisma";

/** Deduped across home discovery / genre / endless for one request. */
export const getHomeMovieFavoriteIds = cache(async () => {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return [] as number[];
    const rows = await prisma.favorite.findMany({
      where: { userId, listType: LIST_FAVORITE, mediaType: "movie" },
      select: { movieId: true },
    });
    return rows.map((row) => row.movieId);
  } catch (err) {
    console.warn("getHomeMovieFavoriteIds failed:", err);
    return [] as number[];
  }
});

export const getHomeTvFavoriteIds = cache(async () => {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return [] as number[];
    const rows = await prisma.favorite.findMany({
      where: { userId, listType: LIST_FAVORITE, mediaType: "tv" },
      select: { movieId: true },
    });
    return rows.map((row) => row.movieId);
  } catch (err) {
    console.warn("getHomeTvFavoriteIds failed:", err);
    return [] as number[];
  }
});
