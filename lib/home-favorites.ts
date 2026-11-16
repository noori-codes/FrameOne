import { cache } from "react";
import { getHomePersonalization } from "@/lib/home-personalization";

/** Deduped across home discovery / genre / endless for one request. */
export const getHomeMovieFavoriteIds = cache(async () => {
  const personal = await getHomePersonalization();
  return personal.movieFavoriteIds;
});

export const getHomeTvFavoriteIds = cache(async () => {
  const personal = await getHomePersonalization();
  return personal.tvFavoriteIds;
});
