/** Saved-list kinds stored on Favorite.listType */
export const LIST_FAVORITE = "favorite" as const;
export const LIST_WATCHLIST = "watchlist" as const;

export type ListType = typeof LIST_FAVORITE | typeof LIST_WATCHLIST;

export function isListType(value: string): value is ListType {
  return value === LIST_FAVORITE || value === LIST_WATCHLIST;
}
