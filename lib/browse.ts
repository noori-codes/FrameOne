import {
  getPopularMoviesPage,
  getTopRatedMoviesPage,
  getTrendingMoviesPage,
  type PaginatedMovies,
} from "@/lib/tmdb";

export const BROWSE_KINDS = {
  trending: {
    title: "Trending now",
    blurb: "Movies trending on TMDB today",
  },
  popular: {
    title: "Popular now",
    blurb: "Most popular movies on TMDB right now",
  },
  "top-rated": {
    title: "Top rated",
    blurb: "Highest-rated movies on TMDB",
  },
} as const;

export type BrowseKind = keyof typeof BROWSE_KINDS;

export function isBrowseKind(value: string): value is BrowseKind {
  return Object.hasOwn(BROWSE_KINDS, value);
}

export function getBrowseMoviesPage(
  kind: BrowseKind,
  page: number,
): Promise<PaginatedMovies> {
  switch (kind) {
    case "trending":
      return getTrendingMoviesPage("day", page);
    case "popular":
      return getPopularMoviesPage(page);
    case "top-rated":
      return getTopRatedMoviesPage(page);
  }
}
