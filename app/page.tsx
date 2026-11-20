import { Suspense } from "react";
import { DeferredGenreRows } from "@/components/deferred-genre-rows";
import { HeroCarousel } from "@/components/hero-carousel";
import { HomeEndlessFeed } from "@/components/home-endless-feed";
import { MovieRow } from "@/components/movie-row";
import { SiteFooter } from "@/components/site-footer";
import { TasteCoachmark } from "@/components/taste-coachmark";
import {
  EndlessFeedSkeleton,
  HomeHeroSkeleton,
  MovieRowSkeleton,
} from "@/components/skeletons";
import { getHomeDiscoveryPools } from "@/lib/home-discovery";
import { getHomeHeroPayload } from "@/lib/home-hero";
import { getHomePersonalization } from "@/lib/home-personalization";
import { getTasteRows } from "@/lib/taste-recommendations";
import { tvShowAsMovie, type TmdbMovie } from "@/lib/tmdb";

/** Public TMDB shells revalidate hourly; personalization stays request-scoped. */
export const revalidate = 3600;

async function HomeHero() {
  const { slides, preload780, preload1280 } = await getHomeHeroPayload();

  return (
    <>
      {preload780 && preload1280 ? (
        <link
          rel="preload"
          as="image"
          imageSrcSet={`${preload780} 780w, ${preload1280} 1280w`}
          imageSizes="100vw"
          fetchPriority="high"
        />
      ) : null}
      <HeroCarousel slides={slides} />
    </>
  );
}

/**
 * Personalized “because you…” rows — own Suspense so discovery isn’t blocked
 * on TMDB recommendation fan-out.
 */
async function TasteRows() {
  const [rows, personal] = await Promise.all([
    getTasteRows(),
    getHomePersonalization(),
  ]);

  const showCoach = Boolean(personal.userId) && rows.length === 0;

  if (!showCoach && rows.length === 0) return null;

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
          showFavorite={Boolean(personal.userId)}
          favoriteIds={
            row.mediaType === "tv"
              ? personal.tvFavoriteIds
              : personal.movieFavoriteIds
          }
        />
      ))}
    </>
  );
}

/** Cached TMDB discovery + one personalization read for hearts / watched filter. */
async function DiscoveryRows() {
  const poolsPromise = getHomeDiscoveryPools();
  const personal = await getHomePersonalization();
  const pools = await poolsPromise;

  const usedMovies = new Set<number>(personal.watchedMovieIds);
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

  const usedTv = new Set<number>(personal.watchedTvIds);
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

  const trendingMovies = takeMovies(pools.trending.results);
  const trendingSeries = takeTv(pools.trendingTv.results.map(tvShowAsMovie));
  const topRatedMovies = takeMovies(pools.topRated.results);
  const popularFresh = takeMovies(pools.popular.results, 12);

  return (
    <>
      <MovieRow
        id="trending"
        title="Trending now"
        movies={trendingMovies}
        href="/browse/trending"
        showFavorite={Boolean(personal.userId)}
        favoriteIds={personal.movieFavoriteIds}
      />
      <MovieRow
        id="trending-series"
        title="Trending series"
        subtitle="TV shows rising on TMDB today"
        movies={trendingSeries}
        mediaType="tv"
        showFavorite={Boolean(personal.userId)}
        favoriteIds={personal.tvFavoriteIds}
      />
      {popularFresh.length >= 6 ? (
        <MovieRow
          id="popular"
          title="Worth a look"
          subtitle="Fresh popular picks you haven’t logged"
          movies={popularFresh}
          href="/browse/popular"
          showFavorite={Boolean(personal.userId)}
          favoriteIds={personal.movieFavoriteIds}
        />
      ) : null}
      <MovieRow
        id="top-rated"
        title="Top rated"
        movies={topRatedMovies}
        href="/browse/top-rated"
        showFavorite={Boolean(personal.userId)}
        favoriteIds={personal.movieFavoriteIds}
      />
    </>
  );
}

async function HomeGenreRows() {
  const personal = await getHomePersonalization();
  return (
    <DeferredGenreRows
      favoriteIds={personal.movieFavoriteIds}
      excludeIds={personal.watchedMovieIds}
      showFavorite={Boolean(personal.userId)}
    />
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
        1) Hero (cross-request cached, no trailer fan-out)
        2) Taste + discovery in parallel Suspense (taste no longer blocks discovery)
        3) Genre wave A/B, deferred on scroll
        4) Endless popular grid
      */}
      <div className="relative z-10 flex min-h-[70vh] w-full flex-col gap-14 border-t border-cream/8 pt-12 pb-12 sm:gap-24 sm:pt-20 sm:pb-20">
        <Suspense fallback={<RowsSkeleton count={2} />}>
          <TasteRows />
        </Suspense>
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
