import { cache, Suspense } from "react";
import { auth } from "@/auth";
import { DeferredGenreRows } from "@/components/deferred-genre-rows";
import { HeroCarousel, type HeroSlide } from "@/components/hero-carousel";
import { MovieRow } from "@/components/movie-row";
import { SiteFooter } from "@/components/site-footer";
import { MovieRowSkeleton, Skeleton } from "@/components/skeletons";
import { shuffleHeroPicks } from "@/lib/daily-hero";
import { LIST_FAVORITE } from "@/lib/lists";
import { prisma } from "@/lib/prisma";
import { tmdbImageUrl } from "@/lib/tmdb-image-loader";
import {
  backdropUrl,
  getLatestMovies,
  getPopularMoviesPage,
  getTopRatedMoviesPage,
  getTrendingMoviesPage,
  getTrendingTvPage,
  posterUrl,
  tvShowAsMovie,
  type TmdbMovie,
} from "@/lib/tmdb";

/** Refresh at least hourly so a new UTC day picks a new hero set. */
export const revalidate = 3600;

const HERO_GROUP_SIZE = 3;

const getHomeTrendingPage = cache(() => getTrendingMoviesPage("day", 1));
const getHomeTopRatedPage = cache(() => getTopRatedMoviesPage(1));

async function HomeHero() {
  const [latestMovies, topRated, trending] = await Promise.all([
    getLatestMovies(),
    getHomeTopRatedPage().then((page) => page.results),
    getHomeTrendingPage().then((page) => page.results),
  ]);

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

  const slides: HeroSlide[] = picks.map(({ movie, categoryLabel }) => ({
    id: movie.id,
    title: movie.title,
    categoryLabel,
    overview: movie.overview,
    tagline: null,
    backdropUrl: backdropUrl(movie.backdrop_path),
    posterUrl: posterUrl(movie.poster_path, "w500"),
    meta: movie.release_date?.slice(0, 4) ?? "",
    rating: movie.vote_average,
    trailerKey: null,
  }));

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

async function DiscoveryRows() {
  const session = await auth();
  const userId = session?.user?.id;

  const [trendingPage, popularPage, topRatedPage, trendingTvPage, favoriteIds] =
    await Promise.all([
      getHomeTrendingPage(),
      getPopularMoviesPage(1),
      getHomeTopRatedPage(),
      getTrendingTvPage("day", 1),
      userId
        ? prisma.favorite
            .findMany({
              where: { userId, listType: LIST_FAVORITE },
              select: { movieId: true },
            })
            .then((rows) => rows.map((row) => row.movieId))
        : Promise.resolve([] as number[]),
    ]);

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

function HeroSkeleton() {
  return (
    <section className="relative flex min-h-[min(760px,100dvh)] w-full flex-col justify-end overflow-hidden sm:min-h-[min(820px,100dvh)] lg:min-h-[min(860px,100dvh)]">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 pb-10 sm:px-6 lg:px-8">
        <Skeleton className="h-7 w-36 rounded-full" />
        <Skeleton className="mt-5 h-20 w-full max-w-2xl rounded-sm sm:h-28" />
        <Skeleton className="mt-5 h-4 w-full max-w-xl" />
        <Skeleton className="mt-2 h-4 w-2/3 max-w-md" />
        <div className="mt-8 flex gap-3">
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </div>
    </section>
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
      <Suspense fallback={<HeroSkeleton />}>
        <HomeHero />
      </Suspense>

      <div className="relative z-10 flex w-full flex-col gap-14 border-t border-cream/8 pt-12 pb-12 sm:gap-24 sm:pt-20 sm:pb-20">
        <Suspense fallback={<RowsSkeleton count={4} />}>
          <DiscoveryRows />
        </Suspense>
        <DeferredGenreRows />
      </div>

      <SiteFooter />
    </main>
  );
}
