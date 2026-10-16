import { cache, Suspense } from "react";
import { DeferredGenreRows } from "@/components/deferred-genre-rows";
import { HeroCarousel, type HeroSlide } from "@/components/hero-carousel";
import { HomeEndlessFeed } from "@/components/home-endless-feed";
import { MovieRow } from "@/components/movie-row";
import { SiteFooter } from "@/components/site-footer";
import {
  EndlessFeedSkeleton,
  HomeHeroSkeleton,
  MovieRowSkeleton,
} from "@/components/skeletons";
import { shuffleHeroPicks } from "@/lib/daily-hero";
import {
  getHomeMovieFavoriteIds,
  getHomeTvFavoriteIds,
} from "@/lib/home-favorites";
import { tmdbImageUrl } from "@/lib/tmdb-image-loader";
import {
  backdropUrl,
  getLatestMovies,
  getMovieTrailerKey,
  getPopularMoviesPage,
  getTopRatedMoviesPage,
  getTrendingMoviesPage,
  getTrendingTvPage,
  posterUrl,
  tvShowAsMovie,
  type TmdbMovie,
  type TmdbTvShow,
} from "@/lib/tmdb";

/** Refresh at least hourly so a new UTC day picks a new hero set. */
export const revalidate = 3600;

const HERO_GROUP_SIZE = 3;

const getHomeTrendingPage = cache(() => getTrendingMoviesPage("day", 1));
const getHomeTopRatedPage = cache(() => getTopRatedMoviesPage(1));

async function HomeHero() {
  // Soft-fail each pool — one slow TMDB call (often discover/latest) must not blank the home page.
  const [latestResult, topRatedResult, trendingResult] = await Promise.allSettled([
    getLatestMovies(),
    getHomeTopRatedPage().then((page) => page.results),
    getHomeTrendingPage().then((page) => page.results),
  ]);

  const latestMovies =
    latestResult.status === "fulfilled" ? latestResult.value : [];
  const topRated =
    topRatedResult.status === "fulfilled" ? topRatedResult.value : [];
  const trending =
    trendingResult.status === "fulfilled" ? trendingResult.value : [];

  for (const result of [latestResult, topRatedResult, trendingResult]) {
    if (result.status === "rejected") {
      console.warn("Home hero pool failed:", result.reason);
    }
  }

  const used = new Set<number>();
  function pickGroup(movies: TmdbMovie[], categoryLabel: string) {
    const picks: { movie: TmdbMovie; categoryLabel: string }[] = [];

    for (const movie of movies) {
      if (
        used.has(movie.id) ||
        !movie.backdrop_path ||
        movie.genre_ids?.includes(16)
      ) {
        continue;
      }
      used.add(movie.id);
      picks.push({ movie, categoryLabel });
      if (picks.length === HERO_GROUP_SIZE) break;
    }

    return picks;
  }

  const picks = shuffleHeroPicks([
    ...pickGroup(latestMovies, "Latest releases"),
    ...pickGroup(topRated, "Top rated"),
    ...pickGroup(trending, "Trending now"),
  ]);

  const trailerResults = await Promise.allSettled(
    picks.map(({ movie }) => getMovieTrailerKey(movie.id)),
  );

  const slides: HeroSlide[] = picks.map(({ movie, categoryLabel }, i) => {
    const trailerResult = trailerResults[i];
    const trailerKey =
      trailerResult?.status === "fulfilled" ? trailerResult.value : null;
    return {
      id: movie.id,
      title: movie.title,
      categoryLabel,
      overview: movie.overview,
      tagline: null,
      backdropUrl: backdropUrl(movie.backdrop_path),
      posterUrl: posterUrl(movie.poster_path, "w500"),
      meta: movie.release_date?.slice(0, 4) ?? "",
      rating: movie.vote_average,
      trailerKey,
    };
  });

  const firstBackdrop = slides[0]?.backdropUrl;
  const heroPreload780 = firstBackdrop
    ? tmdbImageUrl(firstBackdrop, 780)
    : null;
  const heroPreload1280 = firstBackdrop
    ? tmdbImageUrl(firstBackdrop, 1280)
    : null;

  return (
    <>
      {heroPreload780 && heroPreload1280 ? (
        <link
          rel="preload"
          as="image"
          // Responsive LCP candidate — matches hero Image sizes="100vw"
          imageSrcSet={`${heroPreload780} 780w, ${heroPreload1280} 1280w`}
          imageSizes="100vw"
          fetchPriority="high"
        />
      ) : null}
      <HeroCarousel slides={slides} />
    </>
  );
}

async function HomeGenreRows() {
  const favoriteIds = await getHomeMovieFavoriteIds();
  return <DeferredGenreRows favoriteIds={favoriteIds} />;
}

async function DiscoveryRows() {
  const [pools, favoriteIds, tvFavoriteIds] = await Promise.all([
    Promise.allSettled([
      getHomeTrendingPage(),
      getPopularMoviesPage(1),
      getHomeTopRatedPage(),
      getTrendingTvPage("day", 1),
    ]),
    getHomeMovieFavoriteIds(),
    getHomeTvFavoriteIds(),
  ]);

  const [
    trendingResult,
    popularResult,
    topRatedResult,
    trendingTvResult,
  ] = pools;

  for (const result of pools) {
    if (result.status === "rejected") {
      console.warn("Home discovery pool failed:", result.reason);
    }
  }

  const emptyMoviePage = {
    results: [] as TmdbMovie[],
    page: 1,
    totalPages: 0,
    totalResults: 0,
  };
  const emptyTvPage = {
    results: [] as TmdbTvShow[],
    page: 1,
    totalPages: 0,
    totalResults: 0,
  };

  const trendingPage =
    trendingResult.status === "fulfilled"
      ? trendingResult.value
      : emptyMoviePage;
  const popularPage =
    popularResult.status === "fulfilled"
      ? popularResult.value
      : emptyMoviePage;
  const topRatedPage =
    topRatedResult.status === "fulfilled"
      ? topRatedResult.value
      : emptyMoviePage;
  const trendingTvPage =
    trendingTvResult.status === "fulfilled"
      ? trendingTvResult.value
      : emptyTvPage;

  return (
    <>
      <MovieRow
        id="trending"
        title="Trending now"
        movies={trendingPage.results}
        href="/browse/trending"
        favoriteIds={favoriteIds}
      />
      <MovieRow
        id="trending-series"
        title="Trending series"
        subtitle="TV shows rising on TMDB today"
        movies={trendingTvPage.results.map(tvShowAsMovie)}
        mediaType="tv"
        favoriteIds={tvFavoriteIds}
      />
      <MovieRow
        id="popular"
        title="Popular now"
        movies={popularPage.results}
        href="/browse/popular"
        favoriteIds={favoriteIds}
      />
      <MovieRow
        id="top-rated"
        title="Top rated"
        movies={topRatedPage.results}
        href="/browse/top-rated"
        favoriteIds={favoriteIds}
      />
    </>
  );
}

function RowsSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-14 sm:gap-24">
      {Array.from({ length: count }, (_, i) => (
        <MovieRowSkeleton key={i} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col overflow-x-hidden">
      <Suspense fallback={<HomeHeroSkeleton />}>
        <HomeHero />
      </Suspense>

      {/*
        Home scroll story:
        1) Hero
        2) 4 curated discovery rows (trending / series / popular / top rated)
        3) Genre wave A (4 rows) → Genre wave B (4 rows), deferred on scroll
        4) Endless popular grid
      */}
      <div className="relative z-10 flex w-full flex-col gap-14 border-t border-cream/8 pt-12 pb-12 sm:gap-24 sm:pt-20 sm:pb-20">
        <Suspense fallback={<RowsSkeleton count={4} />}>
          <DiscoveryRows />
        </Suspense>
        <Suspense fallback={<RowsSkeleton count={4} />}>
          <HomeGenreRows />
        </Suspense>
        <Suspense fallback={<EndlessFeedSkeleton />}>
          <HomeEndlessFeed />
        </Suspense>
      </div>

      <SiteFooter />
    </main>
  );
}
