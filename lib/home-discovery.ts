import { unstable_cache } from "next/cache";
import { todayKey } from "@/lib/daily-hero";
import {
  getPopularMoviesPage,
  getTopRatedMoviesPage,
  getTrendingMoviesPage,
  getTrendingTvPage,
  type PaginatedMovies,
  type PaginatedTv,
} from "@/lib/tmdb";

export type HomeDiscoveryPools = {
  trending: PaginatedMovies;
  popular: PaginatedMovies;
  topRated: PaginatedMovies;
  trendingTv: PaginatedTv;
};

const emptyMoviePage: PaginatedMovies = {
  results: [],
  page: 1,
  totalPages: 0,
  totalResults: 0,
};

const emptyTvPage: PaginatedTv = {
  results: [],
  page: 1,
  totalPages: 0,
  totalResults: 0,
};

/**
 * Cross-request cached home discovery pools (no cookies / no user data).
 * Survives dynamic rendering of the personalized home shell.
 */
export async function getHomeDiscoveryPools(): Promise<HomeDiscoveryPools> {
  return unstable_cache(
    async () => {
      const [trending, popular, topRated, trendingTv] = await Promise.allSettled([
        getTrendingMoviesPage("day", 1),
        getPopularMoviesPage(1),
        getTopRatedMoviesPage(1),
        getTrendingTvPage("day", 1),
      ]);

      for (const result of [trending, popular, topRated, trendingTv]) {
        if (result.status === "rejected") {
          console.warn("Home discovery pool failed:", result.reason);
        }
      }

      return {
        trending:
          trending.status === "fulfilled" ? trending.value : emptyMoviePage,
        popular:
          popular.status === "fulfilled" ? popular.value : emptyMoviePage,
        topRated:
          topRated.status === "fulfilled" ? topRated.value : emptyMoviePage,
        trendingTv:
          trendingTv.status === "fulfilled" ? trendingTv.value : emptyTvPage,
      };
    },
    ["home-discovery-pools", todayKey()],
    { revalidate: 1800 },
  )();
}
