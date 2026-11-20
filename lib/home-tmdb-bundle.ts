import { unstable_cache } from "next/cache";
import { todayKey } from "@/lib/daily-hero";
import {
  getLatestMovies,
  getPopularMoviesPage,
  getTopRatedMoviesPage,
  getTrendingMoviesPage,
  getTrendingTvPage,
  type PaginatedMovies,
  type PaginatedTv,
  type TmdbMovie,
} from "@/lib/tmdb";

export type HomeTmdbBundle = {
  latest: TmdbMovie[];
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

export function homeTmdbBundleHasContent(bundle: HomeTmdbBundle) {
  return (
    bundle.latest.length > 0 ||
    bundle.trending.results.length > 0 ||
    bundle.popular.results.length > 0 ||
    bundle.topRated.results.length > 0 ||
    bundle.trendingTv.results.length > 0
  );
}

async function buildHomeTmdbBundle(): Promise<HomeTmdbBundle> {
  const [latest, trending, popular, topRated, trendingTv] =
    await Promise.allSettled([
      getLatestMovies(),
      getTrendingMoviesPage("day", 1),
      getPopularMoviesPage(1),
      getTopRatedMoviesPage(1),
      getTrendingTvPage("day", 1),
    ]);

  for (const result of [latest, trending, popular, topRated, trendingTv]) {
    if (result.status === "rejected") {
      console.warn("Home TMDB bundle pool failed:", result.reason);
    }
  }

  return {
    latest: latest.status === "fulfilled" ? latest.value : [],
    trending: trending.status === "fulfilled" ? trending.value : emptyMoviePage,
    popular: popular.status === "fulfilled" ? popular.value : emptyMoviePage,
    topRated:
      topRated.status === "fulfilled" ? topRated.value : emptyMoviePage,
    trendingTv:
      trendingTv.status === "fulfilled" ? trendingTv.value : emptyTvPage,
  };
}

/**
 * One cached TMDB pull for home hero + discovery.
 * Avoids duplicate trending/top-rated origin calls across two unstable_cache keys.
 * Empty outages are not written to the Data Cache.
 */
export async function getHomeTmdbBundle(): Promise<HomeTmdbBundle> {
  const day = todayKey();
  try {
    return await unstable_cache(
      async () => {
        const bundle = await buildHomeTmdbBundle();
        if (!homeTmdbBundleHasContent(bundle)) {
          throw new Error("HOME_TMDB_BUNDLE_EMPTY");
        }
        return bundle;
      },
      ["home-tmdb-bundle", day],
      { revalidate: 1800 },
    )();
  } catch (err) {
    if (err instanceof Error && err.message === "HOME_TMDB_BUNDLE_EMPTY") {
      return {
        latest: [],
        trending: emptyMoviePage,
        popular: emptyMoviePage,
        topRated: emptyMoviePage,
        trendingTv: emptyTvPage,
      };
    }
    try {
      return await buildHomeTmdbBundle();
    } catch (liveErr) {
      console.warn("Home TMDB bundle live fetch failed:", liveErr);
      return {
        latest: [],
        trending: emptyMoviePage,
        popular: emptyMoviePage,
        topRated: emptyMoviePage,
        trendingTv: emptyTvPage,
      };
    }
  }
}
