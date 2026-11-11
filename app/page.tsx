import { cache, Suspense } from "react";
import { auth } from "@/auth";
import { DeferredGenreRows } from "@/components/deferred-genre-rows";
import { HeroCarousel, type HeroSlide } from "@/components/hero-carousel";
import { HomeEndlessFeed } from "@/components/home-endless-feed";
import { MovieRow } from "@/components/movie-row";
import { SiteFooter } from "@/components/site-footer";
import { TasteCoachmark } from "@/components/taste-coachmark";
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
import {
  excludeTitleIds,
  getTasteRows,
  getUserWatchedIds,
} from "@/lib/taste-recommendations";
import { MEDIA_MOVIE, MEDIA_TV } from "@/lib/lists";
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
  const [favoriteIds, watchedIds] = await Promise.all([
    getHomeMovieFavoriteIds(),
    getUserWatchedIds(MEDIA_MOVIE),
  ]);
  return (
    <DeferredGenreRows favoriteIds={favoriteIds} excludeIds={watchedIds} />
  );
}

/**
 * Taste + discovery share one Suspense boundary so slower taste rows never
 * stream in *above* discovery that already painted (layout jump / wrong order).
 * Data still fetches in parallel.
 */
async function PrimaryRows() {
  const [
    rows,
    movieFavoriteIds,
    tvFavoriteIds,
    session,
    pools,
    watchedMovieIds,
    watchedTvIds,
  ] = await Promise.all([
    getTasteRows(),
    getHomeMovieFavoriteIds(),
    getHomeTvFavoriteIds(),
    auth(),
    Promise.allSettled([
      getHomeTrendingPage(),
      getPopularMoviesPage(1),
      getHomeTopRatedPage(),
      getTrendingTvPage("day", 1),
    ]),
    getUserWatchedIds(MEDIA_MOVIE),
    getUserWatchedIds(MEDIA_TV),
  ]);

  const showCoach = Boolean(session?.user?.id) && rows.length === 0;

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

  // Cross-row dedupe so home feels curated, not the same posters on repeat.
  const usedMovies = new Set<number>(watchedMovieIds);
  function takeMovies(pool: TmdbMovie[], limit = 18) {
    const out: TmdbMovie[] = [];
    for (const movie of pool) {
      if (usedMovies.has(movie.id)) continue;
      usedMovies.add(movie.id);
      out.push(movie);
      if (out.length >= limit) break;
    }
    return out;
  }

  const usedTv = new Set<number>(watchedTvIds);
  function takeTv(pool: TmdbMovie[], limit = 18) {
    const out: TmdbMovie[] = [];
    for (const show of pool) {
      if (usedTv.has(show.id)) continue;
      usedTv.add(show.id);
      out.push(show);
      if (out.length >= limit) break;
    }
    return out;
  }

  const trendingMovies = takeMovies(trendingPage.results);
  const trendingSeries = takeTv(trendingTvPage.results.map(tvShowAsMovie));
  const topRatedMovies = takeMovies(topRatedPage.results);
  const popularFresh = takeMovies(popularPage.results, 12);

  return (
    <>
      {showCoach ? <TasteCoachmark show /> : null}
      {rows.map((row) => (
        <MovieRow
          key={row.id}
          id={row.id}
          title={
            row.reason === "rated"
              ? `Because you rated ${row.seedTitle}`
              : `Because you watched ${row.seedTitle}`
          }
          subtitle={
            row.reason === "rated"
              ? "Based on your rating"
              : "Based on your diary"
          }
          movies={row.movies}
          mediaType={row.mediaType}
          favoriteIds={
            row.mediaType === "tv" ? tvFavoriteIds : movieFavoriteIds
          }
        />
      ))}
      <MovieRow
        id="trending"
        title="Trending now"
        movies={trendingMovies}
        href="/browse/trending"
        favoriteIds={movieFavoriteIds}
      />
      <MovieRow
        id="trending-series"
        title="Trending series"
        subtitle="TV shows rising on TMDB today"
        movies={trendingSeries}
        mediaType="tv"
        favoriteIds={tvFavoriteIds}
      />
      {popularFresh.length >= 6 ? (
        <MovieRow
          id="popular"
          title="Worth a look"
          subtitle="Fresh popular picks you haven’t logged"
          movies={popularFresh}
          href="/browse/popular"
          favoriteIds={movieFavoriteIds}
        />
      ) : null}
      <MovieRow
        id="top-rated"
        title="Top rated"
        movies={topRatedMovies}
        href="/browse/top-rated"
        favoriteIds={movieFavoriteIds}
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
        2) Primary rows (taste + discovery, one Suspense — paint in order)
        3) Genre wave A/B, deferred on scroll
        4) Endless popular grid
      */}
      <div className="relative z-10 flex min-h-[70vh] w-full flex-col gap-14 border-t border-cream/8 pt-12 pb-12 sm:gap-24 sm:pt-20 sm:pb-20">
        <Suspense fallback={<RowsSkeleton count={6} />}>
          <PrimaryRows />
        </Suspense>
        <Suspense fallback={<RowsSkeleton count={4} />}>
          <HomeGenreRows />
        </Suspense>
        <Suspense fallback={<EndlessFeedSkeleton />}>
          <HomeEndlessFeed />
        </Suspense>
      </div>

      {/* Footer only after hero-height content so mobile never flashes end-credits first. */}
      <SiteFooter />
    </main>
  );
}
