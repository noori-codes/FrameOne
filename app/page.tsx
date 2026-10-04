import { HeroCarousel, type HeroSlide } from "@/components/hero-carousel";
import { MovieRow } from "@/components/movie-row";
import { HERO_COUNT, pickDailyHeroMovies, todayKey } from "@/lib/daily-hero";
import {
  backdropUrl,
  getMovie,
  getMovieTrailerKey,
  getMoviesByGenre,
  getPopularMovies,
  getTopRatedMovies,
  getTrendingMovies,
  type TmdbMovie,
} from "@/lib/tmdb";

/** Refresh at least hourly so a new UTC day picks a new hero set. */
export const revalidate = 3600;

/**
 * Curated TMDB genre rows for the home page.
 * IDs come from TMDB’s genre list (same as /genres).
 */
const HOME_GENRE_ROWS = [
  { id: 35, slug: "comedy", title: "Comedy" },
  { id: 10751, slug: "family", title: "Family" },
  { id: 28, slug: "action", title: "Action" },
  { id: 27, slug: "horror", title: "Horror" },
  { id: 878, slug: "scifi", title: "Sci-Fi" },
  { id: 10749, slug: "romance", title: "Romance" },
  { id: 16, slug: "animation", title: "Animation" },
  { id: 53, slug: "thriller", title: "Thriller" },
] as const;

/**
 * Home: daily hero carousel + discovery rows + genre strips.
 */
export default async function Home() {
  const [
    popularP1,
    popularP2,
    trendingP1,
    trendingP2,
    topRatedP1,
    topRatedP2,
    ...genrePagePairs
  ] = await Promise.all([
    getPopularMovies(1),
    getPopularMovies(2),
    getTrendingMovies("day", 1),
    getTrendingMovies("day", 2),
    getTopRatedMovies(1),
    getTopRatedMovies(2),
    // Two TMDB pages per genre (~40 titles) so row carousels stay long
    ...HOME_GENRE_ROWS.flatMap((g) => [
      getMoviesByGenre(g.id, 1),
      getMoviesByGenre(g.id, 2),
    ]),
  ]);

  function mergePages(...pages: TmdbMovie[][]): TmdbMovie[] {
    const seen = new Set<number>();
    const out: TmdbMovie[] = [];
    for (const page of pages) {
      for (const movie of page) {
        if (seen.has(movie.id)) continue;
        seen.add(movie.id);
        out.push(movie);
      }
    }
    return out;
  }

  const popular = mergePages(popularP1, popularP2);
  const trending = mergePages(trendingP1, trendingP2);
  const topRated = mergePages(topRatedP1, topRatedP2);

  const genreRows = HOME_GENRE_ROWS.map((genre, i) => {
    const page1 = genrePagePairs[i * 2]?.results ?? [];
    const page2 = genrePagePairs[i * 2 + 1]?.results ?? [];
    return { ...genre, movies: mergePages(page1, page2) };
  });

  const heroPicks = pickDailyHeroMovies(
    [trendingP1, popularP1],
    HERO_COUNT,
    todayKey(),
  );
  const heroDetails = (
    await Promise.all(heroPicks.map((m) => getMovie(m.id)))
  ).filter((m): m is NonNullable<typeof m> => m != null);

  const trailerKeys = await Promise.all(
    heroDetails.map((m) => getMovieTrailerKey(m.id)),
  );

  const slides: HeroSlide[] = heroDetails.map((movie, i) => {
    const year = movie.release_date?.slice(0, 4);
    const runtime =
      movie.runtime != null
        ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
        : null;
    const genres = movie.genres?.map((g) => g.name).join(" / ");
    const meta = [
      year,
      genres,
      runtime,
      `★ ${movie.vote_average.toFixed(1)}`,
    ]
      .filter(Boolean)
      .join(" · ");

    return {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      tagline: movie.tagline,
      backdropUrl: backdropUrl(movie.backdrop_path),
      meta,
      trailerKey: trailerKeys[i] ?? null,
    };
  });

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col overflow-x-hidden">
      <HeroCarousel slides={slides} />

      <div className="relative z-10 flex w-full flex-col gap-20 border-t border-cream/8 pt-16 pb-24 sm:gap-24 sm:pt-20 sm:pb-28">
        <MovieRow
          id="trending"
          title="Trending now"
          movies={trending}
          href="/browse/trending"
        />
        <MovieRow
          id="popular"
          title="Popular now"
          movies={popular}
          href="/browse/popular"
        />
        <MovieRow
          id="top-rated"
          title="Top rated"
          movies={topRated}
          href="/browse/top-rated"
        />

        {genreRows.map((genre) => (
          <MovieRow
            key={genre.id}
            id={genre.slug}
            title={genre.title}
            movies={genre.movies}
            href={`/genres/${genre.id}`}
          />
        ))}
      </div>
    </main>
  );
}
