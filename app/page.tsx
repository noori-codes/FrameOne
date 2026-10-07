import { cache, Suspense } from "react";
import { HeroCarousel, type HeroSlide } from "@/components/hero-carousel";
import { MovieRow } from "@/components/movie-row";
import { SiteFooter } from "@/components/site-footer";
import { MovieRowSkeleton, Skeleton } from "@/components/skeletons";
import { shuffleHeroPicks } from "@/lib/daily-hero";
import {
  backdropUrl,
  getLatestMovies,
  getMoviesByGenre,
  getPopularMoviesPage,
  getTopRatedMoviesPage,
  getTrendingMoviesPage,
  mapPool,
  posterUrl,
  type TmdbMovie,
} from "@/lib/tmdb";

/** Refresh at least hourly so a new UTC day picks a new hero set. */
export const revalidate = 3600;

const HOME_GENRE_ROWS = [
  { id: 35, slug: "comedy", title: "Comedy" },
  { id: 10751, slug: "family", title: "Family" },
  { id: 28, slug: "action", title: "Action" },
  { id: 12, slug: "adventure", title: "Adventure" },
  { id: 27, slug: "horror", title: "Horror" },
  { id: 878, slug: "scifi", title: "Sci-Fi" },
  { id: 14, slug: "fantasy", title: "Fantasy" },
  { id: 10749, slug: "romance", title: "Romance" },
  { id: 16, slug: "animation", title: "Animation" },
  { id: 53, slug: "thriller", title: "Thriller" },
  { id: 18, slug: "drama", title: "Drama" },
  { id: 80, slug: "crime", title: "Crime" },
  { id: 9648, slug: "mystery", title: "Mystery" },
  { id: 10752, slug: "war", title: "War" },
] as const;

const GENRE_FETCH_CONCURRENCY = 8;
const GENRE_HOME_ROW_SIZE = 12;
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

  return <HeroCarousel slides={slides} />;
}

async function DiscoveryRows() {
  const [trendingPage, popularPage, topRatedPage] = await Promise.all([
    getHomeTrendingPage(),
    getPopularMoviesPage(1),
    getHomeTopRatedPage(),
  ]);

  return (
    <>
      <MovieRow
        id="trending"
        title="Trending now"
        movies={trendingPage.results}
        href="/browse/trending"
      />
      <MovieRow
        id="popular"
        title="Popular now"
        movies={popularPage.results}
        href="/browse/popular"
      />
      <MovieRow
        id="top-rated"
        title="Top rated"
        movies={topRatedPage.results}
        href="/browse/top-rated"
      />
    </>
  );
}

async function GenreRows() {
  const rows = await mapPool(
    HOME_GENRE_ROWS,
    GENRE_FETCH_CONCURRENCY,
    async (genre) => ({
      ...genre,
      movies: (
        await getMoviesByGenre(genre.id, 1)
      ).results.slice(0, GENRE_HOME_ROW_SIZE),
    }),
  );

  return rows.map((genre) => (
    <MovieRow
      key={genre.id}
      id={genre.slug}
      title={genre.title}
      movies={genre.movies}
      href={`/genres/${genre.id}`}
    />
  ));
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
        <Suspense fallback={<RowsSkeleton count={3} />}>
          <DiscoveryRows />
        </Suspense>
        <Suspense fallback={<RowsSkeleton count={4} />}>
          <GenreRows />
        </Suspense>
      </div>

      <SiteFooter />
    </main>
  );
}
