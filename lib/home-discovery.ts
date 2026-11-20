import {
  getHomeTmdbBundle,
  homeTmdbBundleHasContent,
  type HomeTmdbBundle,
} from "@/lib/home-tmdb-bundle";
import type { PaginatedMovies, PaginatedTv } from "@/lib/tmdb";

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

const EMPTY_POOLS: HomeDiscoveryPools = {
  trending: emptyMoviePage,
  popular: emptyMoviePage,
  topRated: emptyMoviePage,
  trendingTv: emptyTvPage,
};

function toDiscoveryPools(bundle: HomeTmdbBundle): HomeDiscoveryPools {
  return {
    trending: bundle.trending,
    popular: bundle.popular,
    topRated: bundle.topRated,
    trendingTv: bundle.trendingTv,
  };
}

/**
 * Discovery pools from the shared home TMDB bundle.
 */
export async function getHomeDiscoveryPools(): Promise<HomeDiscoveryPools> {
  try {
    const bundle = await getHomeTmdbBundle();
    if (!homeTmdbBundleHasContent(bundle)) return EMPTY_POOLS;
    return toDiscoveryPools(bundle);
  } catch (err) {
    console.warn("Home discovery pools failed:", err);
    return EMPTY_POOLS;
  }
}
