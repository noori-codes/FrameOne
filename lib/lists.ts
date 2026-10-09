/** Saved-list kinds stored on Favorite.listType */
export const LIST_FAVORITE = "favorite" as const;
export const LIST_WATCHLIST = "watchlist" as const;

export type ListType = typeof LIST_FAVORITE | typeof LIST_WATCHLIST;

export const MEDIA_MOVIE = "movie" as const;
export const MEDIA_TV = "tv" as const;

export type MediaListType = typeof MEDIA_MOVIE | typeof MEDIA_TV;

export function isListType(value: string): value is ListType {
  return value === LIST_FAVORITE || value === LIST_WATCHLIST;
}

export function isMediaListType(value: string): value is MediaListType {
  return value === MEDIA_MOVIE || value === MEDIA_TV;
}

export function mediaHref(mediaType: MediaListType, id: number) {
  return mediaType === MEDIA_TV ? `/tv/${id}` : `/movie/${id}`;
}
